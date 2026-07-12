import cv2
import numpy as np
import pytz
from fastapi import APIRouter, UploadFile, File, Depends, Form, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from DATABASE import database
from MODELS import models

router = APIRouter()

ZONA_ECUADOR = pytz.timezone('America/Guayaquil')

# Referencias a los modelos YOLO (se inyectan desde main.py)
detector_perros = None
clasificador_emociones = None

def set_models(detector, clasificador):
    """Permite que main.py inyecte los modelos cargados."""
    global detector_perros, clasificador_emociones
    detector_perros = detector
    clasificador_emociones = clasificador

@router.post("/predict")
async def predict_emotion(
    file: UploadFile = File(...),
    mascota_id: int = Form(None),
    mascota_id_query: int = Query(None, alias="mascota_id"),
    db: Session = Depends(database.get_db)
):
    print("Entró al endpoint")
    print(file.filename)
    try:
        id_final = mascota_id_query if mascota_id_query is not None else mascota_id

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
            if perro_detectado:
                break

        if not perro_detectado:
            x1, y1, x2, y2 = int(w * 0.1), int(h * 0.1), w - int(w * 0.1), h - int(h * 0.1)

        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
        recorte_efectivo = img[y1:y2, x1:x2]
        if recorte_efectivo.size == 0:
            recorte_efectivo = img

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
            "embedding_sample": embedding_vector[:5]
        }

    except Exception as e:
        db.rollback()
        print(f"Error interno en /predict: {str(e)}")
        return {"status": "error", "message": str(e)}
