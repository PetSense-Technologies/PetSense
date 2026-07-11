FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependencias del sistema necesarias para opencv y ultralytics
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copia los archivos de requerimientos e instala las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
RUN python -c "import cv2; print(cv2.__version__)"

# Copia todo el contenido del directorio local (menos lo excluido por .dockerignore) al contenedor
COPY . .

# Expone el puerto en el que corre la aplicación FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación usando Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
