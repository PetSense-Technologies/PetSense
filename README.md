# 🐾 PetSense - Cliente Mobile (React Native + Expo)

Este repositorio contiene la aplicación móvil de **PetSense**, un analizador de emociones para mascotas desarrollado con **React Native** y **Expo Go**. La aplicación permite registrar dueños y mascotas, tomar o subir fotos, e interactuar con un servicio externo de Inteligencia Artificial para predecir el estado de ánimo de los perritos.

---

## 🛠️ Tecnologías Utilizadas

*   **React Native** & **Expo SDK**
*   **React Navigation (Stack)** - Gestión de flujos y pantallas lineales.
*   **Expo Image Picker** - Acceso nativo a la cámara y galería del dispositivo.
*   **AsyncStorage** - Almacenamiento local seguro del ID de la mascota en el teléfono.
*   **Ionicons (@expo/vector-icons)** - Paquete de iconos vectoriales para la interfaz de usuario.

---

## 📐 Flujo de la Aplicación

El proyecto implementa una arquitectura lineal limpia controlada por almacenamiento interno:
1.  **Bienvenida (`WelcomeScreen`)**: Introducción comercial y acceso al sistema.
2.  **Registro Inicial (`RegistroScreen`)**: Formulario obligatorio. Envía los datos al backend en Python/FastAPI y persiste de forma local el `mascota_id` generado.
3.  **Escáner (`ScannerScreen`)**: Captura de imagen (Cámara/Galería) y envío asíncrono en formato `multipart/form-data` inyectando el ID guardado de la mascota.
4.  **Historial / Análisis / Perfil**: Pantallas preparadas para la lectura de métricas y datos del servidor.

---

## 📋 Prerrequisitos

Antes de iniciar, asegúrate de tener instalado en tu máquina de desarrollo:
*   [Node.js](https://nodejs.org/) (Versión LTS recomendada)
*   **Expo Go** instalado en tu dispositivo físico Android/iOS (disponible en Play Store / App Store) para pruebas en tiempo real.

---

## 🚀 Instalación y Configuración

Sigue estos pasos detallados para clonar, instalar y ejecutar el proyecto desde cero:

### 1. Clonar el repositorio e instalar dependencias
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
# Instalar los paquetes base del proyecto
npm install

# Instalar el navegador por Stack y sus dependencias nativas obligatorias de Expo
npm install @react-navigation/stack
npx expo install react-native-gesture-handler react-native-safe-area-context

2. Configurar las IPs del Servidor (Backend)
Debido a que estás probando en un dispositivo físico con Expo Go, la app debe apuntar a la IP de tu red local (LAN) donde corre tu backend.

Asegúrate de cambiar las constantes de URL en los siguientes archivos con tu IP actual:

src/screens/RegistroScreen.js: const API_BASE_URL = 'http://TU_IP_LOCAL:8000';

src/screens/ScannerScreen.js: const BACKEND_URL = "http://TU_IP_LOCAL:8000/predict";

💡 Nota: Recuerda que el backend de FastAPI debe levantarse exponiendo el host a la red local, por ejemplo: uvicorn main:app --host 0.0.0.0 --port 8000.

🏃 Execution / Cómo Ejecutar el Proyecto
Para levantar el servidor de desarrollo de Expo, ejecuta en tu terminal:

Bash
npx expo start
¿Cómo probarlo en tu celular?
Asegúrate de que tu computadora y tu celular estén conectados exactamente a la misma red Wi-Fi.

Al ejecutar el comando, aparecerá un código QR en la terminal.

En Android: Abre la aplicación Expo Go, selecciona "Scan QR Code" y escanea el código de la terminal.

En iOS: Abre la cámara nativa del iPhone, escanea el código QR y acepta abrirlo en la app de Expo Go.

🛑 Resolución de Problemas Comunes
Error: Unable to resolve "@react-navigation/stack"
Se soluciona ejecutando npm install @react-navigation/stack y reiniciando el empaquetador.

Error: Unable to resolve "./src/screens/WelcomeScreen"
Verifica que el archivo exista dentro de la ruta especificada y que las mayúsculas/minúsculas de tu archivo físico coincidan exactamente con los import en App.js.

La app se queda cargando o dice "No se pudo conectar con el servidor IA"
Revisa que el firewall de tu computadora permita conexiones entrantes en el puerto 8000 y valida que tu teléfono no se haya cambiado a la red de datos móviles.