# librerias
import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Depends, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from sqlalchemy.orm import Session
import database
import models
from datetime import date, timedelta, datetime
from sqlalchemy import func
import pytz
import google.generativeai as genai  # Añadir esta importación

# Configurar Gemini
genai.configure(api_key="TU_API_KEY_AQUI")
modelo_gemini = genai.GenerativeModel('gemini-1.5-pro')

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="API de Emociones Caninas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ZONA_ECUADOR = pytz.timezone('America/Guayaquil')

# Rutas de los modelos
RUTA_DETECTOR = "yolov8n.pt"
RUTA_CLASIFICADOR = "best.pt"

print("Cargando modelos de Inteligencia Artificial en memoria...")
detector_perros = YOLO(RUTA_DETECTOR)
clasificador_emociones = YOLO(RUTA_CLASIFICADOR)
print("¡Modelos listos para recibir peticiones!")

# Función auxiliar para verificar si es un perro con Gemini
async def verificar_perro_con_gemini(img):
    """
    Verifica si la imagen contiene un perro usando Gemini
    Retorna: (bool, mensaje)
    """
    try:
        # Convertir imagen a bytes para enviar a Gemini
        _, img_encoded = cv2.imencode('.jpg', img)
        img_bytes = img_encoded.tobytes()
        
        # Crear el prompt para Gemini
        prompt = """
        Analiza esta imagen y responde ÚNICAMENTE con un JSON en este formato:
        {
            "es_perro": true/false,
            "confianza": 0-100,
            "motivo": "breve explicación de por qué es o no es un perro"
        }
        
        La respuesta debe ser SOLO el JSON, sin texto adicional.
        """
        
        # Enviar a Gemini
        response = modelo_gemini.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": img_bytes}
        ])
        
        # Parsear la respuesta
        import json
        try:
            # Limpiar la respuesta por si tiene markdown u otros caracteres
            texto_respuesta = response.text.strip()
            # Buscar el JSON en el texto
            inicio_json = texto_respuesta.find('{')
            fin_json = texto_respuesta.rfind('}') + 1
            if inicio_json != -1 and fin_json > inicio_json:
                json_str = texto_respuesta[inicio_json:fin_json]
                resultado = json.loads(json_str)
                return resultado.get('es_perro', False), resultado.get('motivo', 'No se pudo determinar')
            else:
                return False, "No se pudo analizar la imagen correctamente"
        except:
            return False, "Error al interpretar la respuesta de Gemini"
            
    except Exception as e:
        print(f"Error al verificar con Gemini: {str(e)}")
        return False, f"Error en la verificación: {str(e)}"

@app.get("/")
def inicio():
    return {"status": "online", "message": "API de Emociones Caninas activa"}

@app.post("/predict")
async def predict_emotion(
    file: UploadFile = File(...), 
    mascota_id: int = Form(None),  
    mascota_id_query: int = Query(None, alias="mascota_id"), 
    db: Session = Depends(database.get_db)
):
    try:
        id_final = mascota_id_query if mascota_id_query is not None else mascota_id

        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "No se pudo decodificar la imagen"}
            
        # VERIFICACIÓN CON GEMINI - PRIMERO
        es_perro, mensaje_gemini = await verificar_perro_con_gemini(img)
        
        if not es_perro:
            return {
                "status": "error", 
                "message": "No es su mascota",
                "detalle_gemini": mensaje_gemini,
                "imagen_analizada": False
            }
        
        # Si Gemini confirma que es un perro, continuamos con el procesamiento normal
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
        string_sample = str(embedding_vector[:5])

        # INFERENCIA
        res_cls = clasificador_emociones(recorte_efectivo, verbose=False)
        r_cls = res_cls[0]
        
        if hasattr(r_cls, 'probs') and r_cls.probs is not None:
            nombre_emocion = r_cls.names[r_cls.probs.top1].upper()
            confianza = r_cls.probs.top1conf.item() * 100
        else:
            nombre_emocion = "INDEFINIDO"
            confianza = 0.0

        print(f"Intentando procesar escaneo. mascota_id resuelto final: {id_final}")

        # PERSISTENCIA EN BASE DE DATOS Y RACHAS
        if id_final:
            db_mascota = db.query(models.Mascota).filter(models.Mascota.id == id_final).first()
            if db_mascota:
                hoy = date.today()
                
                ultima_racha_str = str(db_mascota.ultima_racha_update) if db_mascota.ultima_racha_update else None
                ayer_str = str(hoy - timedelta(days=1))
                hoy_str = str(hoy)

                try:
                    if ultima_racha_str == ayer_str:
                        db_mascota.racha_actual += 1
                    elif ultima_racha_str != hoy_str:
                        db_mascota.racha_actual = 1
                    
                    db_mascota.ultima_racha_update = hoy
                except Exception as racha_err:
                    print(f" Advertencia en racha: {racha_err}")

                emocion_formateada = nombre_emocion.strip().capitalize()

                nuevo_escaneo = models.HistorialEscaneo(
                    mascota_id=id_final,
                    emocion=emocion_formateada,
                    confianza=round(confianza, 2),
                    embedding_sample=string_sample,
                    fecha_hora=datetime.now(ZONA_ECUADOR)
                )
                db.add(nuevo_escaneo)
                db.commit()
                print(f"¡Escaneo guardado exitosamente en la base de datos para la mascota ID {id_final}!")
            else:
                print(f"ERROR: Se resolvió el mascota_id {id_final}, pero NO EXISTE en la base de datos.")
        else:
            print("ADVERTENCIA: No se pudo resolve el mascota_id por ningún medio.")

        return {
            "status": "success",
            "emotion": nombre_emocion,
            "confidence": round(confianza, 2),
            "embedding_dimension": dimension_vector,
            "embedding_sample": embedding_vector[:5],
            "verificacion_gemini": {
                "es_perro": True,
                "mensaje": mensaje_gemini
            }
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error interno en /predict: {str(e)}")
        return {"status": "error", "message": str(e)}
    
# Resto de tus endpoints (registro, perfil, historial, analisis) permanecen igual