# librerias
import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from sqlalchemy.orm import Session
from fastapi import Depends
import database
import models
from datetime import date, timedelta

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="API de Emociones Caninas")

# CORS para React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de los modelos
RUTA_DETECTOR = "yolov8n.pt"
RUTA_CLASIFICADOR = "best.pt"

print("Cargando modelos de Inteligencia Artificial en memoria...")
# Al instanciarlos aquí, se quedan precargados para responder de inmediato
detector_perros = YOLO(RUTA_DETECTOR)
clasificador_emociones = YOLO(RUTA_CLASIFICADOR)
print("¡Modelos listos para recibir peticiones!")

@app.get("/")
def inicio():
    return {"status": "online", "message": "API de Emociones Caninas activa"}

@app.post("/predict")
async def predict_emotion(
    file: UploadFile = File(...), 
    mascota_id: int = None,  # Agregamos esto para saber a quién guardar
    db: Session = Depends(database.get_db)
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "No se pudo decodificar la imagen"}
            
        h, w, _ = img.shape
        res_det = detector_perros(img, conf=0.25, verbose=False)
        x1, y1, x2, y2 = 0, 0, w, h
        perro_detectado = False
        
        for r in res_det:
            for box in r.boxes:
                if int(box.cls[0]) == 16:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    perro_detectado = True
                    break
            if perro_detectado: break
                
        if not perro_detectado:
            x1, y1, x2, y2 = int(w*0.1), int(h*0.1), w - int(w*0.1), h - int(h*0.1)

        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
        recorte_efectivo = img[y1:y2, x1:x2]
        if recorte_efectivo.size == 0: recorte_efectivo = img

        # EMBEDDINGS
        res_embed = clasificador_emociones(recorte_efectivo, embed=[10], verbose=False)
        embedding_vector = res_embed[0].tolist() 
        dimension_vector = len(embedding_vector)
        string_sample = str(embedding_vector[:5]) # Muestra compacta para la base de datos

        # INFERENCIA
        res_cls = clasificador_emociones(recorte_efectivo, verbose=False)
        r_cls = res_cls[0]
        
        if hasattr(r_cls, 'probs') and r_cls.probs is not None:
            nombre_emocion = r_cls.names[r_cls.probs.top1].upper()
            confianza = r_cls.probs.top1conf.item() * 100
        else:
            nombre_emocion = "INDEFINIDO"
            confianza = 0.0

        # PERSISTENCIA EN BASE DE DATOS Y RACHAS
        if mascota_id:
            db_mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
            if db_mascota:
                hoy = date.today()
                # Racha
                if db_mascota.ultima_racha_update == hoy - timedelta(days=1):
                    db_mascota.racha_actual += 1
                elif db_mascota.ultima_racha_update != hoy:
                    db_mascota.racha_actual = 1
                
                db_mascota.ultima_racha_update = hoy
                
                # Registro en el historial
                nuevo_escaneo = models.HistorialEscaneo(
                    mascota_id=mascota_id,
                    emocion=nombre_emocion,
                    confianza=round(confianza, 2),
                    embedding_sample=string_sample
                )
                db.add(nuevo_escaneo)
                db.commit()

        return {
            "status": "success",
            "emotion": nombre_emocion,
            "confidence": round(confianza, 2),
            "embedding_dimension": dimension_vector,
            "embedding_sample": embedding_vector[:5]
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error interno: {str(e)}")
        return {"status": "error", "message": str(e)}