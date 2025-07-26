import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/companies';

export const registerCompany = async (companyData) => {
  try {
    const token = sessionStorage.getItem('nubix_token');

    const response = await axios.post(API_URL, companyData, {
      headers: {
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al registrar la empresa'
    );
  }
};