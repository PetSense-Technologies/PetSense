# PetSense - Frontend (App Móvil)

Este documento describe la estructura, propósito y funcionalidades del proyecto frontend de **PetSense**, una aplicación móvil desarrollada con **React Native** y **Expo** para el análisis de emociones caninas mediante Inteligencia Artificial.

## Tecnologías Principales
- **React Native (Expo):** Framework principal para construir la app de forma nativa para Android e iOS.
- **React Navigation:** Para el manejo de las rutas y la navegación entre pantallas (Stack y Bottom Tabs).
- **AsyncStorage:** Para almacenamiento local persistente (guardar la sesión y el ID de la mascota registrada).
- **Expo Camera / Image Picker:** Para interactuar con la cámara del dispositivo y subir fotos.

---

## Estructura de Archivos y Carpetas

### Raíz del Proyecto
* **`App.js`**: Es el archivo principal (Punto de entrada). Se encarga de:
  * Orquestar la navegación general (`NavigationContainer`).
  * Comprobar al iniciar si el dispositivo ya tiene una mascota registrada leyendo el almacenamiento local (`AsyncStorage`).
  * Definir el menú inferior flotante (`MainTabs`) que contiene los accesos rápidos a: Escáner, Historial, Análisis y Perfil.
* **`package.json`**: Define las dependencias del proyecto (Expo, React Navigation, Axios/Fetch, etc.) y los comandos para iniciar el servidor de desarrollo (`npm start`).
* **`app.json`**: Archivo de configuración global de Expo (nombre de la app, versión, íconos, splash screen, permisos).

### Carpeta `src/` (Código Fuente)

#### 1. `config.js`
Archivo de configuración global que centraliza la URL de conexión hacia tu servidor Backend (FastAPI). 
* Toma la URL de una variable de entorno `EXPO_PUBLIC_API_URL` o usa una por defecto.
* Se asegura de limpiar barras diagonales sobrantes y de agregar el `http://` si es una IP local.

#### 2. `screens/` (Pantallas de la App)
Esta carpeta contiene todos los componentes visuales principales a los que el usuario puede navegar.

* **`WelcomeScreen.js` (Bienvenida / Splash):**
  * Pantalla inicial con animaciones de "Splash". 
  * Toma la decisión de ruteo: Si el usuario ya completó el registro en el pasado (existe un `mascota_id_real` guardado localmente), lo envía directo al *Menú Principal*. Si es nuevo, lo dirige a *Registro*.

* **`RegistroScreen.js` (Registro):**
  * Pantalla para dar de alta a una nueva mascota. 
  * Captura los datos del perro (nombre, raza, edad, dueño) y los envía al backend. Al finalizar, guarda el ID asignado en el `AsyncStorage` del teléfono.

* **`ScannerScreen.js` (Escáner / Cámara):**
  * Es el corazón de la aplicación.
  * Permite abrir la cámara o la galería para tomar una foto del perro y enviarla al modelo de IA (`endpoint_predict`) para detectar sus emociones o utilizar las nuevas funciones de verificación biométrica.

* **`HistoryScreen.js` (Historial):**
  * Muestra una lista cronológica de todos los escaneos emocionales previos que se le han hecho al perro, solicitando los datos a la base de datos.

* **`AnalysisScreen.js` (Análisis):**
  * Presenta gráficos o estadísticas sobre el comportamiento emocional del perro a lo largo del tiempo (por ejemplo, gráficas de barras indicando cuántas veces estuvo feliz vs. estresado).

* **`ProfileScreen.js` (Perfil):**
  * Muestra la información personal de la mascota registrada (foto, nombre, raza).
  * (Aquí es donde idealmente se implementaría la interfaz para crear el **Perfil Biométrico**, pidiéndole al usuario que suba las 5 fotos correspondientes).

---

## Flujo Lógico Actual

1. El usuario abre la app (`App.js` -> `WelcomeScreen`).
2. La app busca un ID en su memoria.
   * **Sin ID:** Va a `RegistroScreen`, registra al dueño/perro y guarda el ID.
   * **Con ID:** Entra directamente al sistema central compuesto por Tabs.
3. Dentro del sistema de Tabs, el usuario usa `ScannerScreen` para interactuar con la IA (Backend) o revisa sus datos en `HistoryScreen` y `AnalysisScreen`.
4. El Backend procesa las peticiones apoyándose en `config.js` para saber a dónde apuntar las llamadas de red.
