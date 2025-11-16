import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/users`;

const getToken = () => {
    return sessionStorage.getItem('nubix_token');
};

/**
 * Endpoint para que un administrador cambie la contraseña de otro usuario (asistente).
 * @param {number} userId - El ID del usuario cuya contraseña será reseteada.
 * @param {object} passwordData - Un objeto con { adminPassword, newPassword, confirmPassword }.
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const resetUserPasswordByAdmin = (userId, passwordData) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(new Error("No se encontró el token de autenticación."));
    }

    return axios.patch(`${API_URL}/${userId}/reset-password`, passwordData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};