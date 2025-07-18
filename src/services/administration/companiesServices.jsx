// services/companiesService.js
import axios from 'axios';

export const getUserCompanies = async (token) => {
  try {
    const response = await axios.get(
      'http://localhost:8080/api/v1/companies/byUser',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return [];
  }
};
