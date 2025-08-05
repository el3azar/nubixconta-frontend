import axios from 'axios';

const HISTORY_API = 'http://localhost:8080/api/v1/change-history';
const USERS_API = 'http://localhost:8080/api/v1/users';
const token = sessionStorage.getItem('nubix_token');

export const getAllUsers = () =>
 axios.get(USERS_API, {
 headers: { Authorization: `Bearer ${token}` }
 });

export const getChangeHistory = () =>
 axios.get(HISTORY_API, {
 headers: { Authorization: `Bearer ${token}` }
 });

// Obtiene la bitácora de un usuario, opcionalmente por rango de fechas
export const getChangeHistoryByUser = (userId, start, end) => {
 const params = {};
 if (start) params.start = start;
 if (end) params.end = end;

 return axios.get(`${HISTORY_API}/user/${userId}`, {
 headers: { Authorization: `Bearer ${token}` },
 params: params
 });
};

export const getChangeHistoryWithoutCompany = (userId) =>
 axios.get(`${HISTORY_API}/user/${userId}/without-company`, {
 headers: { Authorization: `Bearer ${token}` }
 });

//  obtener la bitácora solo por rango de fechas
export const getChangeHistoryByDateRange = (start, end) => {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;

  return axios.get(`${HISTORY_API}/by-dates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: params
  });
};