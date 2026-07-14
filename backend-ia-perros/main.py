import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

from DATABASE.database import Base, engine
from MODELS.dueno import Dueno                       
from MODELS.mascota import Mascota                     
from MODELS.historial_escaneo import HistorialEscaneo 

# routers segmentados
from API import (
    endpoint_root,
    endpoint_predict,
    endpoint_mascotas_registro,
    endpoint_mascotas_perfil,
    endpoint_mascotas_historial,
    endpoint_mascotas_analisis,
    endpoint_verificacion_perro,
    endpoint_crear_perfil
)

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Instancia de la aplicación
app = FastAPI(title="API de Emociones Caninas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelos YOLO
RUTA_DETECTOR = "WEIGHTS/yolov8n.pt"
RUTA_CLASIFICADOR = "WEIGHTS/best.pt"
RUTA_VERIFICADOR = "WEIGHTS/yolo11s.pt"

print("Cargando modelos de IA...")
detector_perros = YOLO(RUTA_DETECTOR)
clasificador_emociones = YOLO(RUTA_CLASIFICADOR)
# modelo para verificación de perro
detector_verificacion = YOLO(RUTA_VERIFICADOR)
print("Modelos YOLO cargados y listos")

import torch
print("Cargando modelo DINOv2 (puede descargar la primera vez)...")
dino_v2 = torch.hub.load('facebookresearch/dinov2', 'dinov2_vitb14', pretrained=True)
dino_v2.eval()
print("Modelo DINOv2 listo")

# Inyectar los modelos en los endpoints
endpoint_predict.set_models(detector_perros, clasificador_emociones)
endpoint_verificacion_perro.set_model(detector_verificacion)
endpoint_crear_perfil.set_models(detector_verificacion, dino_v2)

# Registrar routers
app.include_router(endpoint_root.router)
app.include_router(endpoint_predict.router)
app.include_router(endpoint_mascotas_registro.router)
app.include_router(endpoint_mascotas_perfil.router)
app.include_router(endpoint_mascotas_historial.router)
app.include_router(endpoint_mascotas_analisis.router)
app.include_router(endpoint_verificacion_perro.router)
app.include_router(endpoint_crear_perfil.router)