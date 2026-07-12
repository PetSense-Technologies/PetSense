# 📋 Endpoints — API de Emociones Caninas

Listado completo de todos los endpoints disponibles en la API, organizados por archivo de origen dentro de la carpeta `API/`.

---

## 1. `endpoint_root.py`

### `GET /`
**Descripción:** Endpoint de bienvenida / health-check. Permite verificar que la API está en línea y funcionando correctamente.  
**Autenticación requerida:** No  
**Parámetros:** Ninguno  
**Respuesta exitosa:**
```json
{
  "status": "online",
  "message": "API de Emociones Caninas activa"
}
```

---

## 2. `endpoint_predict.py`

### `POST /predict`
**Descripción:** Endpoint principal de inferencia. Recibe una imagen de un perro, detecta al animal con YOLOv8, clasifica su emoción con el modelo `best.pt` y guarda el resultado en la base de datos vinculado a la mascota indicada. También actualiza la racha diaria de escaneos.  
**Autenticación requerida:** No  
**Parámetros:**

| Nombre | Tipo | Fuente | Requerido | Descripción |
|---|---|---|---|---|
| `file` | `UploadFile` | Form (multipart) | ✅ | Imagen del perro (jpg, png, etc.) |
| `mascota_id` | `int` | Form | ❌ | ID de la mascota (alternativa al query param) |
| `mascota_id` | `int` | Query param | ❌ | ID de la mascota (tiene prioridad sobre el Form) |

**Respuesta exitosa:**
```json
{
  "status": "success",
  "emotion": "FELIZ",
  "confidence": 94.32,
  "embedding_dimension": 512,
  "embedding_sample": [0.12, -0.03, 0.88, 0.45, -0.67]
}
```

---

## 3. `endpoint_mascotas_registro.py`

### `POST /mascotas/registro`
**Descripción:** Registra un nuevo dueño y su mascota en un único paso. Crea primero el registro del dueño, luego crea la mascota asociada a ese dueño y devuelve el `mascota_id` generado.  
**Autenticación requerida:** No  
**Parámetros (Query Params):**

| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `nombre_dueno` | `str` | ✅ | Nombre completo del dueño |
| `celular` | `str` | ✅ | Número de celular del dueño |
| `direccion` | `str` | ✅ | Dirección del dueño |
| `nombre_mascota` | `str` | ✅ | Nombre de la mascota |
| `raza` | `str` | ✅ | Raza del perro |
| `edad_meses` | `int` | ✅ | Edad de la mascota en meses |

**Respuesta exitosa:**
```json
{
  "status": "success",
  "mascota_id": 7,
  "message": "Registro completado exitosamente"
}
```

---

## 4. `endpoint_mascotas_perfil.py`

### `GET /mascotas/{mascota_id}/perfil`
**Descripción:** Retorna el perfil resumido de una mascota: nombre, raza, edad, racha actual de escaneos, total de escaneos realizados y la última emoción detectada.  
**Autenticación requerida:** No  
**Parámetros (Path):**

| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `mascota_id` | `int` | ✅ | ID de la mascota |

**Respuesta exitosa:**
```json
{
  "status": "success",
  "nombre": "Max",
  "raza": "Labrador",
  "edad": 24,
  "racha_actual": 5,
  "total_escaneos": 42,
  "ultima_emocion": "Feliz"
}
```

---

## 5. `endpoint_mascotas_historial.py`

### `GET /mascotas/{mascota_id}/historial`
**Descripción:** Devuelve el historial completo de escaneos de una mascota, ordenado del más reciente al más antiguo. Cada registro incluye la emoción detectada, el nivel de confianza y la fecha/hora del escaneo.  
**Autenticación requerida:** No  
**Parámetros (Path):**

| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `mascota_id` | `int` | ✅ | ID de la mascota |

**Respuesta exitosa:**
```json
{
  "status": "success",
  "historial": [
    {
      "id": 101,
      "emocion": "Feliz",
      "confianza": 91.5,
      "fecha": "2026-07-11 14:35"
    }
  ]
}
```

---

## 6. `endpoint_mascotas_analisis.py`

### `GET /mascotas/{mascota_id}/analisis`
**Descripción:** Retorna un análisis estadístico de la mascota: distribución de emociones (cuántas veces se detectó cada emoción), actividad de escaneos de los últimos 7 días y un indicador general de bienestar.  
**Autenticación requerida:** No  
**Parámetros (Path):**

| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `mascota_id` | `int` | ✅ | ID de la mascota |

**Respuesta exitosa:**
```json
{
  "status": "success",
  "bienestar_general": 86,
  "escaneos_por_dia": [
    { "day": "L", "count": 3, "active": false },
    { "day": "D", "count": 1, "active": true }
  ],
  "distribucion": {
    "Feliz": 20,
    "Emocionado": 10,
    "Tranquilo": 8,
    "Triste": 3,
    "Ansioso": 1
  }
}
```

---

## Resumen rápido

| Método | Ruta | Archivo | Descripción breve |
|---|---|---|---|
| `GET` | `/` | `endpoint_root.py` | Health-check de la API |
| `POST` | `/predict` | `endpoint_predict.py` | Detectar emoción en imagen |
| `POST` | `/mascotas/registro` | `endpoint_mascotas_registro.py` | Registrar dueño + mascota |
| `GET` | `/mascotas/{id}/perfil` | `endpoint_mascotas_perfil.py` | Perfil de la mascota |
| `GET` | `/mascotas/{id}/historial` | `endpoint_mascotas_historial.py` | Historial de escaneos |
| `GET` | `/mascotas/{id}/analisis` | `endpoint_mascotas_analisis.py` | Análisis y estadísticas |
