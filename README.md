Markdown
# PetSense 🐾 — Mobile Emotion Analysis App

PetSense es una aplicación móvil diseñada para el análisis del comportamiento y emociones animales mediante reconocimiento facial. El ecosistema conecta un frontend desarrollado en React Native con un backend de alto rendimiento en Python (FastAPI) y almacenamiento relacional gestionado en PostgreSQL.

---

## 🎨 Identidad Visual y Psicología del Color

El diseño de la interfaz se basa en una paleta limpia, moderna y funcional (antropocentrismo visual), orientada a transmitir confianza, estabilidad y una lectura inmediata del estado emocional de la mascota.

| Color | Código Hex | Uso en la Aplicación | Justificación Psicológica |
| :--- | :--- | :--- | :--- |
| **Azul Principal** | `#2563EB` | Headers, tarjetas informativas, botones de acción. | Transmite confianza, seguridad tecnológica y profesionalismo médico/veterinario. |
| **Verde Éxito** | `#10B981` | Botones de confirmación, emoción: **FELIZ**. | Asociado a la salud, vitalidad, tranquilidad y estados de ánimo óptimos en la mascota. |
| **Ámbar Alerta** | `#F59E0B` | Badges de atención, emoción: **EMOCIONADO**. | Captura la atención sin generar pánico; representa alta energía y dinamismo. |
| **Rojo Crítico** | `#EF4444` | Alertas de error, emoción: **ANSIOSO / ENOJADO**. | Código universal de advertencia. Indica estados de estrés, peligro o irritabilidad que requieren atención inmediata. |
| **Gris Fondo** | `#F1F5F9` | Fondo general de las pantallas (`Slate-100`). | Reduce la fatiga visual, aporta limpieza y permite que las tarjetas de datos contrasten de forma limpia. |

---

## 🏗️ Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada de tipo **Cliente-Servidor (REST API)** distribuida en tres capas principales:

1. **Capa de Presentación (Frontend Móvil):** Desarrollada con React Native y Expo. Gestiona el ciclo de vida de la interfaz, el almacenamiento en caché local (`AsyncStorage`) y la captura/envío de flujos multimedia.
2. **Capa de Lógica de Negocio (Backend):** Construida sobre FastAPI (Python). Expone endpoints optimizados, procesa las peticiones de registro unificado mediante query parameters y gestiona el flujo de análisis mediante modelos de IA.
3. **Capa de Datos (Persistencia):** Base de datos relacional PostgreSQL encargada de mantener la integridad referencial entre los dueños, las mascotas y los registros históricos de análisis emocional.

---

## 🔄 Flujo de Procesamiento y Conectividad

El siguiente flujo describe cómo interactúan los componentes desde que se registra una mascota hasta que se consulta su historial en tiempo real:

[ PANTALLA REGISTRO ] --(POST + Query Params)--> [ FASTAPI BACKEND ]
|                                               |
(Guarda ID Real)                                (Guarda en DB)
v                                               v
[ ASYNCSTORAGE (Local) ]                           [ POSTGRESQL ]
|                                               |
(Lee ID de Mascota)                                    |
v                                               v
[ PANTALLA HISTORIAL ] <(GET /historial JSON)====+


1. **Registro:** El usuario ingresa los datos en el celular. El frontend genera un string de parámetros (`URLSearchParams`) y hace una petición `POST` al endpoint `/mascotas/registro`.
2. **Persistencia Inicial:** El backend recibe los parámetros, inserta la información en PostgreSQL y retorna un JSON con la clave `"mascota_id"`.
3. **Sincronización Local:** El cliente captura `data.mascota_id` de forma estricta y lo almacena localmente usando `AsyncStorage.setItem('mascota_id_real')`. Esto rompe el estancamiento de IDs genéricos (`1`) entre múltiples dispositivos.
4. **Consulta en Tiempo Real:** Al navegar a la pantalla de historial, la app extrae el ID real guardado en memoria y ejecuta un `GET` dinámico a `/mascotas/${mascotaIdReal}/historial`, renderizando las tarjetas con los colores correspondientes a cada emoción.

---

## 🛠️ Herramientas y Stack Tecnológico

### Frontend (Cliente Móvil)
* **React Native (Expo Framework):** Desarrollo ágil de la interfaz nativa multiplataforma.
* **AsyncStorage:** Persistencia en disco local para el manejo del ID único por dispositivo.
* **React Navigation:** Gestión de rutas, navegación por pestañas (`Tabs`) y ganchos de ciclo de vida (`useFocusEffect`).
* **Expo Vector Icons (Ionicons):** Sistema de iconografía semántica para soporte visual de las emociones.

### Backend (Servidor)
* **Python 3.10+ & FastAPI:** Framework asíncrono de alto rendimiento para la construcción de la API REST.
* **SQLAlchemy:** ORM (Object-Relational Mapping) para interactuar de forma segura con la base de datos mediante objetos de Python.
* **Uvicorn:** Servidor ASGI ultrarrápido para el despliegue del backend local.

### Base de Datos y Herramientas de Entorno
* **PostgreSQL:** Motor de base de datos relacional para la persistencia del negocio.
* **pgAdmin 4:** Herramienta web de administración gráfica para el monitoreo de tablas, índices y queries en la base de datos.

---

## 📋 Requisitos del Sistema

Antes de iniciar la instalación, asegúrate de tener instalado en tu máquina:
* **Node.js** (Versión LTS recomendada, 18.x o superior)
* **Python** (Versión 3.10 o superior)
* **PostgreSQL Server** (Corriendo localmente en el puerto estándar `5432`)
* **Expo Go** (Instalado en tu dispositivo móvil Android/iOS para pruebas en tiempo real)

---

## 🚀 Guía de Instalación desde Cero

### 1. Configuración de la Base de Datos
1. Abre **pgAdmin 4** y conéctate a tu servidor local de PostgreSQL.
2. Crea una nueva base de datos llamada `petsense_db` (o el nombre configurado en tu backend).
3. Asegúrate de que el usuario `postgres` tenga los permisos adecuados y recuerda tu contraseña.

### 2. Despliegue del Backend (Servidor Python)
Navega a la carpeta de tu backend desde la terminal:

```bash
# 1. Crear un entorno virtual para no contaminar el sistema
python -m venv venv

# 2. Activar el entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En macOS/Linux:
source venv/bin/activate

# 3. Instalar las dependencias core del backend
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic

# 4. Iniciar el servidor local apuntando a tu main.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Nota: Usar --host 0.0.0.0 es mandatorio para que el servidor escuche peticiones desde la red local y tu celular pueda conectarse.

3. Despliegue del Frontend (React Native - Expo)
Abre una nueva terminal en la raíz de la carpeta del cliente (cliente-ia-perros):

Bash
# 1. Instalar los módulos de Node.js especificados en el package.json
npm install

# 2. Instalar manualmente las librerías críticas de navegación y almacenamiento local
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npx expo install expo-modules-core

# 3. Iniciar el empaquetador de Expo
npx expo start
4. Vinculación del Dispositivo Móvil
Conecta tu computadora y tu celular a la misma red Wi-Fi.

Abre el archivo de configuración de red en tu frontend (ej. src/config.js) y verifica que API_BASE_URL apunte a la IP local exacta de tu máquina (ej. http://192.168.18.3:8000).

Escanea el código QR que se muestra en la terminal de Expo usando la cámara de tu celular (iOS) o la aplicación Expo Go (Android).