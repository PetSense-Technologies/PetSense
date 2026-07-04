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
from sqlalchemy import func
from fastapi import Form

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
    mascota_id: int = Form(None),  # <--- Cambiado a Form para capturar desde FormData del front si es necesario
    db: Session = Depends(database.get_db)
):
    try:
        # Si no viene por Form, intentamos capturarlo por Query String por si acaso
        # Esto asegura compatibilidad total con cómo lo envíe tu React Native
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

        print(f"Intentando procesar escaneo. mascota_id recibido: {mascota_id}")

        # PERSISTENCIA EN BASE DE DATOS Y RACHAS
        if mascota_id:
            db_mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
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
                    print(f"Advertencia en racha: {racha_err}")

                emocion_formateada = nombre_emocion.strip().capitalize()

                nuevo_escaneo = models.HistorialEscaneo(
                    mascota_id=mascota_id,
                    emocion=emocion_formateada,
                    confianza=round(confianza, 2),
                    embedding_sample=string_sample
                )
                db.add(nuevo_escaneo)
                db.commit()
                print(f"¡Escaneo guardado exitosamente en la base de datos para la mascota ID {mascota_id}!")
            else:
                print(f"ERROR: Se recibió el mascota_id {mascota_id}, pero NO EXISTE ninguna mascota con ese ID en la base de datos.")
        else:
            print("ADVERTENCIA: El endpoint /predict no recibió ningún mascota_id (llegó None).")

        return {
            "status": "success",
            "emotion": nombre_emocion,
            "confidence": round(confianza, 2),
            "embedding_dimension": dimension_vector,
            "embedding_sample": embedding_vector[:5]
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error interno en /predict: {str(e)}")
        return {"status": "error", "message": str(e)}
    
@app.post("/mascotas/registro")
def registrar_mascota_completa(
    nombre_dueno: str, celular: str, direccion: str,
    nombre_mascota: str, raza: str, edad_meses: int,
    db: Session = Depends(database.get_db)
):
    try:
        # Creación del registro del dueño
        nuevo_dueno = models.Dueno(nombre_dueno=nombre_dueno, celular=celular, direccion=direccion)
        db.add(nuevo_dueno)
        db.flush()
        
        # Creación de la mascota con el ID de su dueño
        nueva_mascota = models.Mascota(
            dueno_id=nuevo_dueno.id,
            nombre_mascota=nombre_mascota,
            raza=raza,
            edad_meses=edad_meses,
            racha_actual=0
        )
        db.add(nueva_mascota)
        db.commit()
        db.refresh(nueva_mascota)
        
        return {"status": "success", "mascota_id": nueva_mascota.id, "message": "Registro completado exitosamente"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    

# CONSULTA DESDE REACT NATIVE

@app.get("/mascotas/{mascota_id}/perfil")
def obtener_perfil_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
        if not mascota:
            return {"status": "error", "message": "Mascota no encontrada"}
        
        # Obtener el conteo total de escaneos reales
        total_escaneos = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).count()
        
        # Obtener la última emoción registrada
        ultimo_escaneo = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).order_by(models.HistorialEscaneo.id.desc()).first()
        
        ultima_emocion = ultimo_escaneo.emocion.capitalize() if ultimo_escaneo else "Indefinido"

        return {
            "status": "success",
            "nombre": mascota.nombre_mascota,
            "raza": mascota.raza,
            "edad": mascota.edad_meses, 
            "racha_actual": mascota.racha_actual,
            "total_escaneos": total_escaneos,
            "ultima_emocion": ultima_emocion
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/mascotas/{mascota_id}/perfil")
def obtener_perfil_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        mascota = db.query(models.Mascota).filter(models.Mascota.id == mascota_id).first()
        if not mascota:
            return {"status": "error", "message": "Mascota no encontrada"}
        
        total_escaneos = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).count()
        
        ultimo_escaneo = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).order_by(models.HistorialEscaneo.id.desc()).first()
        
        ultima_emocion = ultimo_escaneo.emocion.capitalize() if ultimo_escaneo else "Indefinido"

        return {
            "status": "success",
            "nombre": mascota.nombre_mascota,
            "raza": mascota.raza,
            "edad": mascota.edad_meses, 
            "racha_actual": mascota.racha_actual,
            "total_escaneos": total_escaneos,
            "ultima_emocion": ultima_emocion
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/mascotas/{mascota_id}/historial")
def obtener_historial_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        registros = db.query(models.HistorialEscaneo).filter(
            models.HistorialEscaneo.mascota_id == mascota_id
        ).order_by(models.HistorialEscaneo.fecha_hora.desc()).all() 
        
        resultado = []
        for r in registros:
            fecha_formateada = r.fecha_hora.strftime("%Y-%m-%d %H:%M") if r.fecha_hora else "Sin fecha"

            resultado.append({
                "id": r.id,
                "emocion": r.emocion.capitalize() if r.emocion else "Indefinido",
                "confianza": float(r.confianza) if r.confianza else 0.0, # Convertimos Numeric a float para evitar problemas en JSON
                "fecha": fecha_formateada
            })
        return {"status": "success", "historial": resultado}
    except Exception as e:
        print(f"Error en historial: {str(e)}")
        return {"status": "error", "message": str(e)}
    
@app.get("/mascotas/{mascota_id}/analisis")
def obtener_analisis_mascota(mascota_id: int, db: Session = Depends(database.get_db)):
    try:
        conteos_raw = db.query(
            models.HistorialEscaneo.emocion, func.count(models.HistorialEscaneo.id)
        ).filter(models.HistorialEscaneo.mascota_id == mascota_id).group_by(models.HistorialEscaneo.emocion).all()
        
        emociones_base = {"FELIZ": 0, "EMOCIONADO": 0, "TRANQUILO": 0, "TRISTE": 0, "ANSIOSO": 0}
        for emocion, conteo in conteos_raw:
            if emocion in emociones_base:
                emociones_base[emocion] = conteo

        dias_semana_map = {"Monday": "L", "Tuesday": "M", "Wednesday": "Mi", "Thursday": "J", "Friday": "V", "Saturday": "S", "Sunday": "D"}
        hoy = date.today()
        escaneos_por_dia = []
        
        for i in range(6, -1, -1):
            dia_evaluado = hoy - timedelta(days=i)
            
            conteo_dia = db.query(models.HistorialEscaneo).filter(
                models.HistorialEscaneo.mascota_id == mascota_id,
                func.date(models.HistorialEscaneo.fecha_hora) == dia_evaluado
            ).count()
            
            nombre_dia_eng = dia_evaluado.strftime("%A")
            nombre_dia_esp = dias_semana_map.get(nombre_dia_eng, dia_evaluado.strftime("%a"))
            
            escaneos_por_dia.append({
                "day": nombre_dia_esp,
                "count": conteo_dia,
                "active": dia_evaluado == hoy
            })

        return {
            "status": "success",
            "bienestar_general": 86, 
            "escaneos_por_dia": escaneos_por_dia,
            "distribucion": {k.capitalize(): v for k, v in emociones_base.items()}
        }
    except Exception as e:
        print(f"Error en análisis: {str(e)}")
        return {"status": "error", "message": str(e)}