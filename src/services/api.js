// src/services/api.js
import axios from 'axios';

// --- 1. DEFINE LAS CLAVES IGUAL QUE EN TU AUTHCONTEXT ---
const TOKEN_KEY = "nubix_token";
const ROLE_KEY = "nubix_role";
const ACCESS_LOG_ID_KEY = "nubix_access_log_id";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1` // URL base dinámica desde .env
});

// --- 2. INTERCEPTOR DE PETICIÓN (CORREGIDO) ---
api.interceptors.request.use(
    (config) => {
        // Busca en sessionStorage (no localStorage)
        // Usa la clave "nubix_token"
        const token = sessionStorage.getItem(TOKEN_KEY); 
        
        if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    // --- 3. INTERCEPTOR DE RESPUESTA (CORREGIDO) ---
    // (Ahora ya puedes descomentar esto)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si la API devuelve 401 (No autorizado) o 403 (Prohibido)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Error de autenticación (401/403). Redirigiendo al login.");
        
        // Limpia el storage para que el AuthContext sepa que se cerró sesión
        // (Esto imita la limpieza de tu función logout)
        sessionStorage.removeItem(TOKEN_KEY); 
        sessionStorage.removeItem(ROLE_KEY); 
        sessionStorage.removeItem(ACCESS_LOG_ID_KEY);
        sessionStorage.removeItem("empresaActiva");
        
        // Redirige a tu ruta de login (que dijiste que era '/')
        window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default api;