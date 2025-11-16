import axios from "axios";

// =========================================================================================
// == INICIO DE CÓDIGO MODIFICADO Y AÑADIDO
// =========================================================================================

// Define tu URL base de la API en un solo lugar para facilitar futuros cambios.
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/auth`;
// const API_BASE_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/auth";

/**
 * Servicio para autenticar a un usuario (login).
 * Intercambia credenciales (usuario/contraseña) por un token de autenticación genérico.
 * @param {object} credentials - Un objeto que contiene 'userName' y 'password'.
 * @returns {Promise<object>} - El objeto de respuesta del backend (ej. { token, role, accessLogId }).
 * @throws {Error} - Lanza un error si la petición falla, para ser capturado por el componente.
 */
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data; // Devuelve la respuesta completa del backend.
  } catch (error) {
    // Es una mejor práctica lanzar el error en lugar de devolver null.
    // Esto permite al componente que llama (Login.jsx) tener más control
    // sobre el mensaje de error que se muestra al usuario.
    console.error("Error en el servicio de login:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Servicio para obtener un token con el scope de una empresa específica.
 * Intercambia un token de autenticación genérico por uno nuevo que incluye el 'company_id'.
 * @param {number} companyId - El ID de la empresa que el usuario ha seleccionado.
 * @param {string} token - El token de autenticación actual (el genérico o uno anterior).
 * @returns {Promise<object>} - El objeto de respuesta del backend (ej. { token: "nuevo_token..." }).
 * @throws {Error} - Lanza un error si la petición falla.
 */
const selectCompany = async (companyId, token) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/select-company/${companyId}`,
            {}, // El cuerpo de la petición es vacío, el ID va en la URL.
            {
                headers: {
                    // Añadimos el encabezado de autorización manualmente.
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error en el servicio de selección de empresa:", error.response?.data || error.message);
        throw error;
    }
}

// Puedes añadir aquí el servicio de logout si quieres centralizarlo también.
/**
 * Servicio para notificar al backend el cierre de sesión de un usuario.
 * @param {object} logoutData - Contiene el accessLogId.
 * @param {string} token - El token de autenticación actual.
 */
const logout = async (logoutData, token) => {
    try {
        await axios.post(`${API_BASE_URL}/logout`, logoutData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        // Generalmente no bloqueamos al usuario si la llamada de logout falla.
        console.error("Error notificando el logout al backend:", error.response?.data || error.message);
    }
}


// Exportamos un objeto que contiene todos los métodos del servicio.
// Esto facilita la importación y el uso en los componentes.
export const authService = {
  login,
  selectCompany,
  logout
};

// =========================================================================================
// == FIN DE CÓDIGO MODIFICADO Y AÑADIDO
// =========================================================================================