# main.py
import os
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Request  # <── ¡Agregamos 'Request' aquí!
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="API de Emociones Caninas")

# Habilitar CORS para que React Native pueda conectarse sin restricciones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de los modelos (ambos deben estar en la misma carpeta raíz del proyecto)
RUTA_DETECTOR = "yolov8n.pt"
RUTA_CLASIFICADOR = "best.pt"

print("📦 Cargando modelos de Inteligencia Artificial en memoria...")
# Al instanciarlos aquí, se quedan precargados para responder de inmediato
detector_perros = YOLO(RUTA_DETECTOR)
clasificador_emociones = YOLO(RUTA_CLASIFICADOR)
print("🚀 ¡Modelos listos para recibir peticiones!")

@app.get("/")
def inicio():
    return {"status": "online", "message": "API de Emociones Caninas activa"}

@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    try:
        # 1. Leer los bytes de la imagen enviada por el celular
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "No se pudo decodificar la imagen"}
            
        h, w, _ = img.shape

        # 2. Aplicar el detector base (YOLOv8n)
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
            margen_h, margen_w = int(h * 0.10), int(w * 0.10)
            x1, y1 = margen_w, margen_h
            x2, y2 = w - margen_w, h - margen_h

        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        # 3. Extraer el recorte limpio del perro
        recorte_efectivo = img[y1:y2, x1:x2]
        if recorte_efectivo.size == 0:
            recorte_efectivo = img

        # 4. 🔥 EXTRACCIÓN DE EMBEDDINGS (El requisito del Ingeniero)
        # Pasamos el argumento embed=[...] para extraer el vector de la penúltima capa
        res_embed = clasificador_emociones(recorte_efectivo, embed=[10], verbose=False)
        
        # El embedding es un tensor/vector numérico. Lo convertimos a una lista de Python
        embedding_vector = res_embed[0].tolist() 
        dimension_vector = len(embedding_vector)

        # Imprimimos en la consola los primeros 5 números para demostrar que existe
        print("\n" + "="*50)
        print(f"🧬 EMBEDDING GENERADO CON ÉXITO")
        print(f"📊 Dimensión del vector: {dimension_vector} características numéricas")
        print(f"🔢 Primeros 5 valores del embedding: {embedding_vector[:5]}")
        print("="*50 + "\n")

        # 5. Inferencia normal para la interfaz móvil
        res_cls = clasificador_emociones(recorte_efectivo, verbose=False)
        r_cls = res_cls[0]
        
        if hasattr(r_cls, 'probs') and r_cls.probs is not None:
            top_clase_idx = r_cls.probs.top1
            nombre_emocion = r_cls.names[top_clase_idx]
            confianza = r_cls.probs.top1conf.item() * 100
        else:
            if len(r_cls.boxes) > 0:
                box = r_cls.boxes[0]
                top_clase_idx = int(box.cls[0])
                nombre_emocion = r_cls.names[top_clase_idx]
                confianza = box.conf[0].item() * 100
            else:
                nombre_emocion = "indefinido"
                confianza = 0.0

        # 6. Respuesta hacia Expo Go incluyendo los metadatos del embedding
        return {
            "status": "success",
            "emotion": nombre_emocion.upper(),
            "confidence": round(confianza, 2),
            "embedding_dimension": dimension_vector,
            "embedding_sample": embedding_vector[:5]  # Le mandamos una muestra ligera a la app
        }
        
    except Exception as e:
        print(f"❌ Error interno: {str(e)}")
        return {"status": "error", "message": str(e)}