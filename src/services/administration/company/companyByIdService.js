
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/companies';

export const getCompanyById= async (id) => {
  try {
    const token = sessionStorage.getItem('nubix_token');
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la empresa por ID:', error);
    return null;
  }
};
