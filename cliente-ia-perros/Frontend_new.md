# PetSense - Frontend (App Móvil)

Este documento describe la estructura, propósito y funcionalidades del proyecto frontend de **PetSense**, una aplicación móvil desarrollada con **React Native** y **Expo** para el análisis de emociones caninas y verificación biométrica.

## Tecnologías Principales
- **React Native (Expo):** Framework principal para construir la app de forma nativa para Android e iOS.
- **React Navigation:** Para el manejo de las rutas y la navegación entre pantallas (Stack y Bottom Tabs).
- **AsyncStorage:** Para almacenamiento local persistente (guardar la sesión y el ID de la mascota registrada).
- **Expo Camera / Image Picker:** Para interactuar con la cámara del dispositivo, tomar fotos y procesarlas.

---

## Estructura de Archivos y Carpetas

### Raíz del Proyecto
* **`App.js`**: Es el archivo principal (Punto de entrada). Se encarga de:
  * Orquestar la navegación general mediante un `NavigationContainer`.
  * Comprobar al iniciar si el dispositivo ya tiene una mascota registrada leyendo el almacenamiento local (`AsyncStorage`).
  * Definir el menú inferior flotante (`MainTabs`) que contiene los accesos a: Escáner, Historial, Análisis y Perfil.
* **`package.json`**: Define las dependencias del proyecto (Expo, React Navigation, Axios/Fetch, etc.) y los comandos para iniciar el servidor de desarrollo (`npm start`).
* **`app.json`**: Archivo de configuración global de Expo (nombre de la app, versión, íconos, splash screen, permisos).

### Carpeta `src/` (Código Fuente)

#### 1. `config.js`
Archivo de configuración global que centraliza la URL de conexión hacia tu servidor Backend (FastAPI). 
* Permite gestionar de manera sencilla la IP de desarrollo o la URL de producción.

#### 2. `screens/` (Pantallas de la App)
Esta carpeta contiene todos los componentes visuales a los que el usuario puede navegar.

* **`WelcomeScreen.js` (Bienvenida / Splash):**
  * Pantalla inicial con animaciones de presentación. 
  * Decide el flujo: Si el usuario ya está registrado (tiene un `mascota_id_real` guardado localmente), lo envía al *Menú Principal*. Si es nuevo, lo dirige a *Registro*.

* **`RegistroScreen.js` (Registro):**
  * Pantalla para dar de alta a una nueva mascota (nombre, raza, edad, etc.). 
  * Envía los datos al backend y guarda el ID de respuesta localmente.

* **`RegistroBiometrico.js` (Registro Biométrico Facial):**
  * Interfaz especializada que guía al usuario para tomar y subir fotografías secuenciales de su mascota (ej. frontal, izquierda, derecha).
  * Construye el perfil biométrico necesario para el reconocimiento de identidad.

* **`ScannerScreen.js` (Escáner / Cámara):**
  * El módulo central para el análisis.
  * Permite abrir la cámara para tomar una foto del perro y enviarla al modelo de IA (`endpoint_predict`) para detectar sus emociones o utilizar funciones de verificación.

* **`HistoryScreen.js` (Historial):**
  * Muestra una lista cronológica de todos los escaneos emocionales previos realizados a la mascota registrada.

* **`AnalysisScreen.js` (Análisis):**
  * Presenta gráficos o estadísticas consolidadas sobre el comportamiento emocional del perro, brindando un resumen visual.

* **`ProfileScreen.js` (Perfil):**
  * Interfaz donde se consulta la información personal y datos de la mascota registrada (foto, nombre, raza).

---

## Flujo Lógico Principal

1. **Inicialización:** El usuario abre la app (`App.js` -> `WelcomeScreen`).
2. **Validación de Sesión:** La app busca un ID en su memoria.
   * **Sin ID:** Va a `RegistroScreen`, registra al perro, posteriormente navega a `RegistroBiometrico` (u otras vistas) y guarda el ID.
   * **Con ID:** Entra directamente al sistema central compuesto por Tabs.
3. **Uso Activo:** Dentro de los Tabs, el usuario usa `ScannerScreen` para la lectura de emociones o revisa sus métricas en `HistoryScreen` y `AnalysisScreen`.
4. **Comunicación Backend:** Todas las pantallas se apoyan en `config.js` para enviar las fotos (vía `FormData` y fetch) hacia los endpoints de inteligencia artificial en el backend (YOLO / DINOv2).
