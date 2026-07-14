// Conexión global usando variables de entorno de Expo (EXPO_PUBLIC_*)
const rawUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
let cleanUrl = rawUrl.trim();

// Si la URL no empieza con http:// o https:// (por ejemplo, si es una IP local), se le agrega http://
if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `http://${cleanUrl}`;
}

// Limpiamos la barra diagonal final si existe para evitar problemas de doble slash (//) en los fetch
export const API_BASE_URL = cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl;

// Id por defecto prueba
export const MASCOTA_ID = 1;