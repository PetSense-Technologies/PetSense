import numpy as np
import json
from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from DATABASE.database import get_db
from MODELS.mascota import Mascota
from API.endpoint_crear_perfil import procesar_imagen_y_embedding

router = APIRouter()

UMBRAL_SIMILITUD = 0.70

@router.post("/verificar-identidad")
async def verificar_identidad(
    mascota_id: int = Form(...),
    foto: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    print(f"--- Iniciando /verificar-identidad para mascota_id={mascota_id} ---")
    
    mascota = db.query(Mascota).filter(Mascota.id == mascota_id).first()
    if not mascota:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    if not mascota.embedding_identidad:
        raise HTTPException(status_code=400, detail="La mascota no tiene un perfil biométrico creado.")

    try:
        datos_emb = json.loads(mascota.embedding_identidad)
        if isinstance(datos_emb, list) or "mean" not in datos_emb or not datos_emb["mean"]:
            raise ValueError()
        mean_vector = np.array(datos_emb["mean"])
    except:
        raise HTTPException(status_code=400, detail="El perfil biométrico de la mascota está incompleto o corrupto.")

    b64, emb = await procesar_imagen_y_embedding(foto)
    if b64 is None or emb is None:
        raise HTTPException(
            status_code=400,
            detail="La imagen no contiene un perro válido o hubo un error al procesarla."
        )

    # Cosine similarity
    dot_product = np.dot(emb, mean_vector)
    norm_a = np.linalg.norm(emb)
    norm_b = np.linalg.norm(mean_vector)
    
    if norm_a == 0 or norm_b == 0:
        similitud = 0.0
    else:
        similitud = dot_product / (norm_a * norm_b)
        
    similitud = float(similitud)
    es_coincidencia = similitud >= UMBRAL_SIMILITUD
    porcentaje = round(similitud * 100, 2)

    print(f"[verificar-identidad] Similitud obtenida: {porcentaje}% | Umbral: {UMBRAL_SIMILITUD * 100}%")

    if es_coincidencia:
        mensaje = f"Identidad verificada exitosamente. Similitud del {porcentaje}%."
    else:
        mensaje = f"Verificación fallida. El perro no coincide (Similitud: {porcentaje}%)."

    return {
        "status": "success",
        "mascota_id": mascota_id,
        "es_coincidencia": es_coincidencia,
        "similitud_porcentaje": porcentaje,
        "mensaje": mensaje
    }
