import axios from 'axios';

const HISTORY_API = `${import.meta.env.VITE_API_URL}/api/v1/change-history`;
const USERS_API = `${import.meta.env.VITE_API_URL}/api/v1/users`;

const getToken = () => sessionStorage.getItem('nubix_token');

export const getAllUsers = () => {
  const token = getToken();
  return axios.get(USERS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getChangeHistory = () => {
  const token = getToken(); 
  return axios.get(HISTORY_API, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getChangeHistoryByUser = (userId, start, end) => {
  const token = getToken();
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;

  return axios.get(`${HISTORY_API}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: params
  });
};

export const getChangeHistoryWithoutCompany = (userId) => {
  const token = getToken(); 
  return axios.get(`${HISTORY_API}/user/${userId}/without-company`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getChangeHistoryByDateRange = (start, end) => {
  const token = getToken(); 
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;

  return axios.get(`${HISTORY_API}/by-dates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: params
  });
};