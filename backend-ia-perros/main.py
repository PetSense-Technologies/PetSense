import os
import cv2
import numpy as np
import json
import pytz
from fastapi import FastAPI, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import date, timedelta, datetime
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
from pydantic import BaseModel # Importación necesaria
import database
import models

# Configuración inicial
#models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="API de Emociones Caninas")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Modelo para recibir los datos del registro en formato JSON
class RegistroMascota(BaseModel):
    nombre_dueno: str
    celular: str
    direccion: str
    nombre_mascota: str
    raza: str
    edad_meses: int

# Diccionario temporal para el registro de 3 fotos (Biometría)
temp_embeddings = defaultdict(list)

print("Cargando modelos...")
detector_perros = YOLO("yolov8n.pt")
clasificador_emociones = YOLO("best.pt")
print("¡Modelos listos!")

ZONA_ECUADOR = pytz.timezone('America/Guayaquil')

# --- REGISTRO FACIAL ---
@app.post("/mascotas/{id}/registro-facial")
async def registro_facial(id: int, posicion: int = Form(...), file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        res_embed = clasificador_emociones(img, embed=[10], verbose=False)
        vector = np.array(res_embed[0].cpu().numpy()).flatten()
        temp_embeddings[id].append(vector)
        
        if len(temp_embeddings[id]) >= 3:
            embedding_final = np.mean(temp_embeddings[id], axis=0)
            mascota = db.query(models.Mascota).filter(models.Mascota.id == id).first()
            if mascota:
                mascota.embedding_identidad = json.dumps(embedding_final.tolist())
                db.commit()
            del temp_embeddings[id]
            return {"status": "success", "message": "Face ID registrado con éxito"}
        
        return {"status": "success", "message": f"Captura {len(temp_embeddings[id])}/3 recibida"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- PREDICCIÓN ---
@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...), mascota_id: int = Form(...), db: Session = Depends(database.get_db)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 1. Validación de Identidad
        res_embed = clasificador_emociones(img, embed=[10], verbose=False)
        vector_actual = np.array(res_embed[0].cpu().numpy()).reshape(1, -1)
        
        db_mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
        if not db_mascota or not db_mascota.embedding_identidad:
            return {"status": "error", "message": "Mascota no tiene perfil registrado."}
            
        vector_registrado = np.array(json.loads(db_mascota.embedding_identidad)).reshape(1, -1)
        similitud = cosine_similarity(vector_actual, vector_registrado)[0][0]
        
        if similitud < 0.80:  # esto es para asemejar la similud en las emociones de los animales
            return {"status": "error", "message": "Acceso denegado: Esta no es la mascota registrada."}

        # 2. Predicción de Emoción
        res_cls = clasificador_emociones(img, verbose=False)
        nombre_emocion = res_cls[0].names[res_cls[0].probs.top1].upper()
        confianza = float(res_cls[0].probs.top1conf) * 100
        
        # 3. ¡NUEVO: GUARDAR EN HISTORIAL!
        nuevo_escaneo = models.HistorialEscaneo(
            mascota_id=mascota_id,
            emocion=nombre_emocion,
            confianza=confianza,
            fecha_hora=datetime.now()
        )
        db.add(nuevo_escaneo)
        db.commit()
        
        return {"status": "success", "emotion": nombre_emocion, "confidence": round(confianza, 2)}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    
# --- REGISTRO DE MASCOTA ---
@app.post("/mascotas/registro")
def registrar_mascota_completa(datos: RegistroMascota, db: Session = Depends(database.get_db)):
    try:
        nuevo_dueno = models.Dueno(
            nombre_dueno=datos.nombre_dueno, 
            celular=datos.celular, 
            direccion=datos.direccion
        )
        db.add(nuevo_dueno)
        db.flush()
        
        nueva_mascota = models.Mascota(
            dueno_id=nuevo_dueno.id,
            nombre_mascota=datos.nombre_mascota,
            raza=datos.raza,
            edad_meses=datos.edad_meses,
            racha_actual=0
        )
        db.add(nueva_mascota)
        db.commit()
        db.refresh(nueva_mascota)
        
        return {"status": "success", "mascota_id": nueva_mascota.id, "message": "Registro completado exitosamente"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

# --- PERFIL Y ANALÍTICAS ---
@app.get("/mascotas/{mascota_id}/perfil")
def obtener_perfil_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
        if not mascota: return {"status": "error", "message": "Mascota no encontrada"}
        
        total_escaneos = db.query(models.HistorialEscaneo).filter(models.HistorialEscaneo.mascota_id == mascota_id).count()
        ultimo_escaneo = db.query(models.HistorialEscaneo).filter(models.HistorialEscaneo.mascota_id == mascota_id).order_by(models.HistorialEscaneo.id.desc()).first()
        ultima_emocion = ultimo_escaneo.emocion.capitalize() if ultimo_escaneo else "Indefinido"

        return {
            "status": "success", "nombre": mascota.nombre_mascota, "raza": mascota.raza,
            "edad": mascota.edad_meses, "racha_actual": mascota.racha_actual,
            "total_escaneos": total_escaneos, "ultima_emocion": ultima_emocion
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/mascotas/{mascota_id}/historial")
def obtener_historial_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        registros = db.query(models.HistorialEscaneo).filter(models.HistorialEscaneo.mascota_id == mascota_id).order_by(models.HistorialEscaneo.fecha_hora.desc()).all()
        resultado = [{"id": r.id, "emocion": r.emocion.capitalize(), "confianza": float(r.confianza), "fecha": r.fecha_hora.strftime("%Y-%m-%d %H:%M")} for r in registros]
        return {"status": "success", "historial": resultado}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/mascotas/{mascota_id}/analisis")
def obtener_analisis_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        conteos_raw = db.query(models.HistorialEscaneo.emocion, func.count(models.HistorialEscaneo.id)).filter(models.HistorialEscaneo.mascota_id == mascota_id).group_by(models.HistorialEscaneo.emocion).all()
        emociones_base = {"FELIZ": 0, "EMOCIONADO": 0, "TRANQUILO": 0, "TRISTE": 0, "ANSIOSO": 0}
        for e, c in conteos_raw:
            if e and e.upper() in emociones_base: emociones_base[e.upper()] = c
            
        return {"status": "success", "distribucion": {k.capitalize(): v for k, v in emociones_base.items()}}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/db-test")
def test_db_connection(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        # Obtener el host sin credenciales de forma segura
        host_seguro = database.DATABASE_URL.split('@')[-1] if database.DATABASE_URL and '@' in database.DATABASE_URL else "No configurada"
        return {
            "status": "success",
            "message": "Conexión a la base de datos exitosa",
            "host": host_seguro
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con la base de datos: {str(e)}"
        }