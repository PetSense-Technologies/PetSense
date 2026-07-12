import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends, Form, Query
from sqlalchemy.orm import Session
from DATABASE.database import get_db

router = APIRouter()

detector_yolo11 = None

def set_model(model):
    global detector_yolo11
    detector_yolo11 = model

# Clase 16 = "dog" en el dataset COCO
CLASE_PERRO = 16
CONFIANZA_MINIMA = 0.60

@router.post("/verify-dog")
async def verify_dog(
    file: UploadFile = File(...),
    mascota_id: int = Form(None),
    mascota_id_query: int = Query(None, alias="mascota_id"),
    db: Session = Depends(get_db)
):
    try:
        id_final = mascota_id_query if mascota_id_query is not None else mascota_id

        # Decodificar la imagen
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "status": "error",
                "message": "No se pudo decodificar la imagen. Verifica que el archivo sea una imagen válida."
            }

        # Inferencia con yolo11s
        resultados = detector_yolo11(img, conf=CONFIANZA_MINIMA, verbose=False)

        es_perro = False
        mejor_confianza = 0.0
        detecciones_perro = []

        for r in resultados:
            for box in r.boxes:
                if int(box.cls[0]) == CLASE_PERRO:
                    confianza_deteccion = float(box.conf[0]) * 100
                    detecciones_perro.append(round(confianza_deteccion, 2))
                    if confianza_deteccion > mejor_confianza:
                        mejor_confianza = confianza_deteccion
                        es_perro = True

        if es_perro:
            mensaje = f"Se detectó un perro en la imagen con {round(mejor_confianza, 1)}% de confianza."
        else:
            mensaje = "No se detectó ningún perro en la imagen."

        print(f"[verify-dog] mascota_id={id_final} | es_perro={es_perro} | confianza={round(mejor_confianza, 2)}%")

        return {
            "status": "success",
            "mascota_id": id_final,
            "es_perro": es_perro,
            "confianza": round(mejor_confianza, 2),
            "total_detecciones": len(detecciones_perro),
            "mensaje": mensaje
        }

    except Exception as e:
        print(f"Error interno en /verify-dog: {str(e)}")
        return {"status": "error", "message": str(e)}
