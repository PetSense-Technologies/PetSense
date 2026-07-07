Markdown
# PetSense 🐾 — Aplicación Mobil para detectar las emociones de tu mascota.

PetSense es una aplicación móvil diseñada para el análisis del comportamiento y emociones animales mediante reconocimiento facial. El ecosistema conecta un frontend desarrollado en React Native con un backend de alto rendimiento en Python (FastAPI) y almacenamiento relacional gestionado en PostgreSQL.

El Modelo de Predicción (Google Colab Workflow)

El núcleo inteligente de PetSense es una Red Neuronal Convolucional (CNN) optimizada mediante Transferencia de Aprendizaje (Transfer Learning) en Google Colab para clasificar características faciales y landmarks en animales domésticos.

       [ IMAGEN CRUDA ] -> Recorte de Rostro (Landmarks)
               |
               v
       [ PREPROCESAMIENTO ] -> Redimensión (224x224) + Normalización [0, 1]
               |
               v
       [ CAPA BASE MODELO ] -> MobileNetV2 (Pesos de ImageNet Congelados)
               |
               v
     [ CABEZA DE DETECCIÓN ] -> GlobalAveragePooling2D + Dense + Dropout (0.3)
               |
               v
       [ INFERENCIA SOFTMAX ] -> Probabilidades de las 5 Emociones


1. Preparación del Dataset y Preprocesamiento

Aumento de Datos (Data Augmentation): Para prevenir el sobreajuste (overfitting) provocado por las variaciones lumínicas y diferencias morfológicas entre razas (ej. perros braquicéfalos frente a hocicos alargados), se aplicó un pipeline de distorsión controlada en memoria:

Rotaciones aleatorias de hasta $\pm 15^\circ$.

Desplazamientos horizontales y verticales del $10\%$.

Espejado horizontal (Horizontal Flip).

Saneamiento de Canales: Las imágenes se convierten a formato de color RGB, se redimensionan estrictamente a un tamaño estandarizado de $224 \times 224$ píxeles y se normaliza el rango de intensidad de sus píxeles dividiendo cada canal entre $255.0$:


$$\mathbf{X}_{\text{normalized}} = \frac{\mathbf{X}}{255.0} \in [0, 1]$$

2. Arquitectura de la Red Neuronal

Para posibilitar un procesamiento ágil y de baja latencia en arquitecturas cliente-servidor locales, se utilizó una base pre-entrenada de MobileNetV2 (ideal para despliegues ligeros), acoplando un bloque clasificador personalizado en la cima:

Capa Base (Feature Extractor): MobileNetV2 con pesos inicializados de ImageNet. Sus capas convolucionales profundas permanecen congeladas para retener la capacidad de detección de bordes, texturas y formas generales.

Capa de Reducción: GlobalAveragePooling2D para aplanar los mapas de características espaciales tridimensionales en un vector unidimensional compacto.

Capa Totalmente Conectada (Dense Layer): Una capa de $128$ neuronas densas con función de activación no lineal ReLU:


$$f(x) = \max(0, x)$$

Capa de Regularización: Capa Dropout configurada al $30\%$ ($0.3$) para apagar aleatoriamente conexiones neuronales durante el entrenamiento y forzar a la red a aprender patrones distribuidos e independientes.

Capa de Clasificación Final (Output Layer): Una capa densa final de $5$ neuronas con función de activación Softmax para normalizar las salidas en una distribución de probabilidad de suma igual a $1.0$:


**Softmax:**

$$
P_i=\frac{e^{z_i}}{\sum_{j=1}^{5}e^{z_j}}
$$

3. Hiperparámetros de Entrenamiento

Optimizador: Adam (Tasa de aprendizaje inicial $\eta = 0.0001$).

Función de Pérdida (Loss Function): Categorical Crossentropy, adecuada para clasificación multiclase excluyente:


$$\mathcal{L} = -\sum_{i=1}^{N} y_i \log(\hat{y}_i)$$

Callbacks de Control:

EarlyStopping: Frena el entrenamiento si la pérdida de validación no mejora durante 5 épocas continuas, restaurando los mejores pesos del ciclo.

ReduceLROnPlateau: Disminuye la tasa de aprendizaje a la mitad si el aprendizaje se estanca, refinando la convergencia en mínimos locales.

4. Exportación del Artefacto

El modelo final consolidado se exportó desde Google Colab en formato abierto ONNX (Open Neural Network Exchange). Este formato es óptimo para entornos de producción en servidores Python (FastAPI) debido a su bajo consumo de RAM y su velocidad de ejecución en arquitecturas de CPU locales.

## Funcionamiento de la Inferencia en FastAPI (Producción)

Cuando el usuario de la aplicación móvil captura una fotografía o sube una imagen de la galería, el servidor ejecuta la inferencia en tiempo real siguiendo estos pasos asíncronos:

Inicialización Eficiente (Startup): Al arrancar el backend con Uvicorn, FastAPI carga en memoria caché el runtime del modelo ONNX una única vez a través del evento @app.on_event("startup") utilizando onnxruntime.InferenceSession. Esto evita sobrecargas repetitivas y asegura latencias inferiores a 0.8 segundos por petición.

Recepción del Multipart Payload: El cliente React Native inyecta la imagen binaria mediante una petición multipart en el endpoint /mascotas/escanear.

Preparación del Tensor: El backend procesa los bytes de imagen utilizando la librería Pillow (PIL):

Ajusta la orientación EXIF de la cámara móvil.

Fuerza la conversión a formato RGB.

Aplica un redimensionamiento bicúbico a $224 \times 224$ píxeles.

Transforma la matriz a un formato compatible con ONNX de tipo numpy con dimensiones de lote: [1, 224, 224, 3].

Inferencia y Decisión: Se ejecuta la sesión de ONNX sobre el tensor. El modelo retorna el vector probabilístico resultante de 5 dimensiones:


$$\mathbf{p} = [p_{\text{feliz}}, p_{\text{emocionado}}, p_{\text{tranquilo}}, p_{\text{triste}}, p_{\text{inquieto}}]$$

Se utiliza un operador argmax para determinar la emoción ganadora:


$$\text{Emoción ganadora} = \operatorname{argmax}(\mathbf{p})$$

Se extrae el valor máximo del vector de probabilidades para asignarlo como el nivel de certeza de la predicción (confianza):


$$\text{Confianza} = \max(\mathbf{p}) \times 100\%$$

Persistencia y Sincronización: SQLAlchemy recibe el ID real de la mascota, asocia el nombre de la emoción y su precisión matemática, e inserta la sesión histórica de forma segura en PostgreSQL.



##  Identidad Visual y Psicología del Color

El diseño de la interfaz se basa en una paleta limpia, moderna y funcional, orientada a transmitir confianza, estabilidad y una lectura inmediata del estado emocional de la mascota. El sistema normaliza las respuestas técnicas de la IA a etiquetas legibles por el usuario.

| Color | Código Hex | Etiqueta del Modelo (IA) | Texto en Interfaz | Justificación Psicológica |
| :--- | :--- | :--- | :--- | :--- |
| **Azul Institucional** | `#2563EB` | N/A | Global (Botones/Headers) | Transmite confianza, seguridad tecnológica y profesionalismo veterinario. |
| **Verde Éxito** | `#10B981` | `HAPPY`, `FELIZ`, `SMILE` | **Feliz** | Asociado a la salud, vitalidad y estados de ánimo óptimos en la mascota. |
| **Ámbar Alerta** | `#F59E0B` | `EXCITED`, `EMOCIONADO`, `EXITED` | **Emocionado** | Captura la atención sin generar pánico; representa alta energía y dinamismo positivo. |
| **Azul Claro** | `#3B82F6` | `RELAXED`, `TRANQUILO`, `RELAX` | **Tranquilo** | Representa paz, serenidad, balance y un estado de reposo libre de estrés. |
| **Gris Pizarra** | `#64748B` | `SAD`, `TRISTE`, `FROWN` | **Triste** | Denota neutralidad pasiva, decaimiento físico o emocional, y baja energía. |
| **Rojo Crítico** | `#EF4444` | `ANGRY`, `ANSIOSO`, `ENOJADO` | **Inquieto / Enojado** | Código universal de advertencia. Indica estrés agudo, miedo o reactividad. |



## Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada de tipo **Cliente-Servidor (REST API)** distribuida en tres capas principales:

1. **Capa de Presentación (Frontend Móvil):** Desarrollada con React Native y Expo. Gestiona el ciclo de vida de la interfaz, el almacenamiento en caché local (`AsyncStorage`) y la captura/envío de flujos multimedia.
2. **Capa de Lógica de Negocio (Backend):** Construida sobre FastAPI (Python). Expone endpoints optimizados, procesa las peticiones de registro unificado mediante query parameters y gestiona el flujo de análisis mediante modelos de IA.
3. **Capa de Datos (Persistencia):** Base de datos relacional PostgreSQL encargada de mantener la integridad referencial entre los dueños, las mascotas y los registros históricos de análisis emocional.



## Flujo de Procesamiento y Conectividad

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



## Herramientas y Stack Tecnológico

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



##  Requisitos del Sistema

Antes de iniciar la instalación, asegúrate de tener instalado en tu máquina:
* **Node.js** (Versión LTS recomendada, 18.x o superior)
* **Python** (Versión 3.10 o superior)
* **PostgreSQL Server** (Corriendo localmente en el puerto estándar `5432`)
* **Expo Go** (Instalado en tu dispositivo móvil Android/iOS para pruebas en tiempo real)



##  Guía de Instalación desde Cero

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
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
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

Abre el archivo de configuración de red en tu frontend (ej. src/config.js) y verifica que API_BASE_URL apunte a la IP local exacta de tu máquina (ej. http://aqui_va_tu_url:8000).

Escanea el código QR que se muestra en la terminal de Expo usando la cámara de tu celular (iOS) o la aplicación Expo Go (Android).
