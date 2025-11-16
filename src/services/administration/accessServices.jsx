import axios from 'axios';

const ACCESS_API = `${import.meta.env.VITE_API_URL}/api/v1/access-logs`;
const USERS_API = `${import.meta.env.VITE_API_URL}/api/v1/users`;
const token       = localStorage.getItem('token');
//const HISTORY_API = 'https://nubixconta-backend-production.up.railway.app/api/v1/access-logs';
//const USERS_API   = 'https://nubixconta-backend-production.up.railway.app/api/v1/users';
// Obtiene todos los usuarios para el <Select>
export const getAllUsers = () =>
  axios.get(USERS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Obtiene la bitácora de todos los accesos al sistema
  export const getAccessLogs = () =>
  axios.get(ACCESS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtiene la bitácora de un usuario (sin fechas)
export const getAccessLogsByUser = (userId) =>
  axios.get(`${ACCESS_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtiene la bitácora de un usuario en un rango de fechas
export const getAccessLogsByUserAndDates = (userId, start, end) =>
  axios.get(`${ACCESS_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { start, end }
  });

{/*}
// Obtiene sólo las entradas de un usuario que NO tienen empresa asociada
export const getChangeHistoryWithoutCompany = (userId) =>
  axios.get(`${HISTORY_API}/user/${userId}/without-company`, {
    headers: { Authorization: `Bearer ${token}` }
  });
*/}

// Obtiene todas las entradas (de todos los usuarios) en un rango de fechas
export const getAccessLogsByDateRange = (start, end) =>
  axios.get(`${ACCESS_API}/dates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { start, end }
  });