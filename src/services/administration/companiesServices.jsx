// services/companiesService.js
import axios from 'axios';

export const getUserCompanies = async (token) => {
  try {
    const response = await axios.get(
      'https://nubixconta-backend-production.up.railway.app/api/v1/companies/byUser',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return [];
  }
};
