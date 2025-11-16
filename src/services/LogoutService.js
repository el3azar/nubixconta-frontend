
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/auth`;  

/**
 * Función para enviar la petición de logout al backend.
 * @param {string} token El token JWT del usuario autenticado.
 * @param {number} accessLogId El ID del registro de acceso a cerrar.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la petición es exitosa o se rechaza en caso de error.
 */
export const logoutService = async (token, accessLogId) => {
    if (!token || !accessLogId) {
        console.warn('Advertencia: No se puede registrar el logout, falta token o accessLogId.');
        return;
    }

    try {
      
        await axios.post(`${API_URL}/logout`, {
            accessLogId: accessLogId,
            dateEnd: new Date().toISOString()
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Sesión registrada como cerrada en el backend exitosamente.");
    } catch (error) {
        console.error('Error al registrar cierre de sesión en backend:', error);
        throw error;
    }
};