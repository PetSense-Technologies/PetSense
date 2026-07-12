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

print("Cargando modelos de IA...")
detector_perros = YOLO(RUTA_DETECTOR)
clasificador_emociones = YOLO(RUTA_CLASIFICADOR)
print("Modelos cargados y listos")

# Inyectar los modelos en el endpoint de predicción
endpoint_predict.set_models(detector_perros, clasificador_emociones)

# Registrar routers
app.include_router(endpoint_root.router)
app.include_router(endpoint_predict.router)
app.include_router(endpoint_mascotas_registro.router)
app.include_router(endpoint_mascotas_perfil.router)
app.include_router(endpoint_mascotas_historial.router)
app.include_router(endpoint_mascotas_analisis.router)