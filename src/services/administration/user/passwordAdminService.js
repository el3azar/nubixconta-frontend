import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/users`;

const getToken = () => {
    return sessionStorage.getItem('nubix_token');
};

/**
 * Endpoint para que el propio administrador cambie su contraseña.
 * @param {number} adminId - El ID del administrador autenticado.
 * @param {object} passwordData - Un objeto con { oldPassword, newPassword, confirmPassword }.
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const changeAdminPassword = (adminId, passwordData) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(new Error("No se encontró el token de autenticación."));
    }

    return axios.patch(`${API_URL}/change-password/${adminId}`, passwordData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};