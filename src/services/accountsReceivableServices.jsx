import axios from 'axios';
//Este enpoint trae todos los registros asociados a accounts-receivable
const BASE_URL = 'http://localhost:8080/api/v1/accounts-receivable';

export const fetchAccountsReceivable = async () => {
  try {
    const token = sessionStorage.getItem('nubix_token'); 
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const response = await axios.get(BASE_URL, {
      headers,
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas por cobrar:', error);
    throw error;
  }
};
export const fetchAccountsByDate = async (start, end) => {
  const token = sessionStorage.getItem('nubix_token');
  const url = `${BASE_URL}/search-by-date?start=${start}&end=${end}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return response.data;
};
