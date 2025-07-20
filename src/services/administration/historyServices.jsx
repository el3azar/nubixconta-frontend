import axios from 'axios';

const HISTORY_API = 'http://localhost:8080/api/v1/history';
const USERS_API   = 'http://localhost:8080/api/v1/users';
const token       = localStorage.getItem('token');
//const HISTORY_API = 'https://nubixconta-backend-production.up.railway.app/api/v1/history';
//const USERS_API   = 'https://nubixconta-backend-production.up.railway.app/api/v1/users';
// Obtiene todos los usuarios para el <Select>
export const getAllUsers = () =>
  axios.get(USERS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtiene la bitácora de un usuario (sin fechas)
export const getChangeHistoryByUser = (userId) =>
  axios.get(`${HISTORY_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtiene la bitácora de un usuario en un rango de fechas
export const getChangeHistoryByUserAndDates = (userId, start, end) =>
  axios.get(`${HISTORY_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { start, end }
  });

// Obtiene sólo las entradas de un usuario que NO tienen empresa asociada
export const getChangeHistoryWithoutCompany = (userId) =>
  axios.get(`${HISTORY_API}/user/${userId}/without-company`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Obtiene todas las entradas (de todos los usuarios) en un rango de fechas
export const getChangeHistoryByDateRange = (start, end) =>
  axios.get(`${HISTORY_API}/dates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { start, end }
  });