import cv2
import numpy as np
import base64
import json
from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import torch
from torchvision import transforms

from DATABASE.database import get_db
from MODELS.mascota import Mascota

router = APIRouter()

# Modelos inyectados desde main.py
detector_yolo11 = None
dino_model = None

def set_models(yolo_model, dino):
    global detector_yolo11, dino_model
    detector_yolo11 = yolo_model
    dino_model = dino

# Preprocesamiento oficial para DINOv2
_preprocess = transforms.Compose([
    transforms.Resize(256, interpolation=transforms.InterpolationMode.BICUBIC),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]),
])

CLASE_PERRO = 16
CONFIANZA_MINIMA = 0.60

async def procesar_imagen_y_embedding(upload_file: UploadFile):
    if not upload_file:
        return None, None

    contents = await upload_file.read()
    if not contents:
        return None, None

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None, None

    # Validar con YOLO
    resultados = detector_yolo11(img, conf=CONFIANZA_MINIMA, verbose=False)
    perros = sum(
        1 for r in resultados
        for box in r.boxes
        if int(box.cls[0]) == CLASE_PERRO
    )

    if perros == 0:
        return None, None
    if perros > 1:
        raise HTTPException(
            status_code=400,
            detail=f"La foto '{upload_file.filename}' contiene más de un perro. Solo debe existir una mascota."
        )

    # Generar Embedding con DINOv2
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = transforms.functional.to_pil_image(img_rgb)
    tensor = _preprocess(pil_img).unsqueeze(0)

    with torch.no_grad():
        emb = dino_model(tensor)
    embedding = emb.squeeze(0).cpu().numpy()

    # Comprimir un poco para base64
    _, buffer = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
    img_b64 = base64.b64encode(buffer).decode('utf-8')

    return img_b64, embedding

@router.post("/crear-perfil")
async def crear_perfil(
    mascota_id: int = Form(...),
    vista_frontal: UploadFile = File(None),
    lado_izq: UploadFile = File(None),
    lado_der: UploadFile = File(None),
    vista_3_4: UploadFile = File(None),
    vista_superior: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    print(f"--- Iniciando /crear-perfil para mascota_id={mascota_id} ---")
    mascota = db.query(Mascota).filter(Mascota.id == mascota_id).first()
    if not mascota:
        print("Mascota no encontrada en la base de datos.")
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    embeddings_list = []
    
    # Mapeo de archivos subidos
    archivos = {
        "vista_frontal": vista_frontal,
        "lado_izq": lado_izq,
        "lado_der": lado_der,
        "vista_3_4": vista_3_4,
        "vista_superior": vista_superior
    }
    
    # Cargar embeddings previos si existen
    if mascota.embedding_identidad:
        try:
            datos_emb = json.loads(mascota.embedding_identidad)
            if isinstance(datos_emb, list):
                # Formato viejo: era solo una lista. Lo reiniciamos.
                datos_emb = {"mean": [], "partials": {}}
            elif "partials" not in datos_emb:
                datos_emb = {"mean": [], "partials": {}}
        except:
            datos_emb = {"mean": [], "partials": {}}
    else:
        datos_emb = {"mean": [], "partials": {}}

    resultados_b64 = {}
    exitosas = []
    fallidas = []

    for columna, archivo in archivos.items():
        if archivo is not None and archivo.filename:
            print(f"[crear-perfil] Procesando imagen para '{columna}': {archivo.filename}")
            b64, emb = await procesar_imagen_y_embedding(archivo)
            if b64 is not None and emb is not None:
                resultados_b64[columna] = b64
                datos_emb["partials"][columna] = emb.tolist()
                exitosas.append(columna)
                print(f"[crear-perfil] Éxito: Se detectó un perro en '{columna}'.")
            else:
                fallidas.append(columna)
                print(f"[crear-perfil] Error: No se detectó un perro o hubo un error al leer la imagen '{columna}'.")
        else:
            print(f"[crear-perfil] No se envió imagen para la clave '{columna}'.")

    if not datos_emb["partials"]:
        raise HTTPException(
            status_code=400,
            detail="Ninguna de las imágenes proporcionadas contiene un perro válido."
        )

    # Recalcular el mean embedding con todas las fotos que tengamos hasta ahora (las nuevas + las previas)
    todas_las_listas = list(datos_emb["partials"].values())
    mean_emb = np.mean(np.stack(todas_las_listas), axis=0)
    datos_emb["mean"] = mean_emb.tolist()

    # Actualizar DB
    mascota.embedding_identidad = json.dumps(datos_emb)
    if "vista_frontal" in resultados_b64: mascota.vista_frontal = resultados_b64["vista_frontal"]
    if "lado_izq" in resultados_b64: mascota.lado_izq = resultados_b64["lado_izq"]
    if "lado_der" in resultados_b64: mascota.lado_der = resultados_b64["lado_der"]
    if "vista_3_4" in resultados_b64: mascota.vista_3_4 = resultados_b64["vista_3_4"]
    if "vista_superior" in resultados_b64: mascota.vista_superior = resultados_b64["vista_superior"]

    db.commit()

    return {
        "status": "success",
        "mascota_id": mascota_id,
        "imagenes_procesadas_ahora": len(exitosas),
        "total_imagenes_perfil": len(datos_emb["partials"]),
        "exitosas": exitosas,
        "fallidas": fallidas,
        "mensaje": "Perfil biométrico actualizado."
    }

@router.post("/subir-foto-perfil")
async def subir_foto_perfil(
    mascota_id: int = Form(...),
    tipo_foto: str = Form(..., description="Una de: vista_frontal, lado_izq, lado_der, vista_3_4, vista_superior"),
    foto: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    print(f"--- Iniciando /subir-foto-perfil para mascota_id={mascota_id}, tipo={tipo_foto} ---")
    
    campos_validos = ["vista_frontal", "lado_izq", "lado_der", "vista_3_4", "vista_superior"]
    if tipo_foto not in campos_validos:
        raise HTTPException(status_code=400, detail=f"tipo_foto inválido. Debe ser uno de {campos_validos}")

    mascota = db.query(Mascota).filter(Mascota.id == mascota_id).first()
    if not mascota:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")

    b64, emb = await procesar_imagen_y_embedding(foto)
    if b64 is None or emb is None:
        print(f"[subir-foto-perfil] Error: No se detectó un perro en '{tipo_foto}'.")
        raise HTTPException(
            status_code=400,
            detail="La imagen no contiene un perro válido o hubo un error al procesarla. Por favor, toma la foto de nuevo."
        )

    # Cargar y actualizar embeddings
    if mascota.embedding_identidad:
        try:
            datos_emb = json.loads(mascota.embedding_identidad)
            if isinstance(datos_emb, list) or "partials" not in datos_emb:
                datos_emb = {"mean": [], "partials": {}}
        except:
            datos_emb = {"mean": [], "partials": {}}
    else:
        datos_emb = {"mean": [], "partials": {}}

    datos_emb["partials"][tipo_foto] = emb.tolist()
    
    todas_las_listas = list(datos_emb["partials"].values())
    mean_emb = np.mean(np.stack(todas_las_listas), axis=0)
    datos_emb["mean"] = mean_emb.tolist()

    mascota.embedding_identidad = json.dumps(datos_emb)
    setattr(mascota, tipo_foto, b64)

    db.commit()

    return {
        "status": "success",
        "mascota_id": mascota_id,
        "tipo_foto": tipo_foto,
        "total_imagenes_perfil": len(datos_emb["partials"]),
        "mensaje": f"Foto '{tipo_foto}' validada y guardada correctamente."
    }
