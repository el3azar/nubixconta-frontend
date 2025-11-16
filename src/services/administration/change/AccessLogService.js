import axios from 'axios';

const ACCESS_API = `${import.meta.env.VITE_API_URL}/api/v1/access-logs`;
const USERS_API = `${import.meta.env.VITE_API_URL}/api/v1/users`;

const getToken = () => sessionStorage.getItem('nubix_token');

export const getAllUsers = () => {
  const token = getToken();
  return axios.get(USERS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

/**
 * Obtiene la bitácora de accesos con filtros opcionales.
 *
 * @param {object} filters Objeto con filtros opcionales.
 * @param {string} filters.userId El ID del usuario.
 * @param {string} filters.startDate La fecha de inicio en formato YYYY-MM-DD.
 * @param {string} filters.endDate La fecha de fin en formato YYYY-MM-DD.
 */
export const getAccessLogs = (filters = {}) => {
  const token = getToken();
  return axios.get(ACCESS_API, {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });
};
