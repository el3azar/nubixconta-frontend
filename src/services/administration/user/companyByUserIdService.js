// src/services/companyService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/companies`;

// Se mantiene la función auxiliar, aunque también podría estar dentro de la principal
const getToken = () => {
  const token = sessionStorage.getItem('nubix_token');
  return token ? `Bearer ${token}` : '';
};

// Se refactoriza para usar async/await y manejar errores
export const getCompaniesByUser = async (userId) => {
  try {
    const token = getToken();
    if (!token) {
      console.error("No se encontró un token de autenticación en sessionStorage.");
      // Se lanza un error para que el catch lo atrape
      throw new Error("No se ha iniciado sesión.");
    }

    const response = await axios.get(`${API_URL}/byUser/${userId}`, {
      headers: {
        Authorization: token,
      },
      // conCredentials no es necesario si el token está en el header
      // withCredentials: true,
    });
    
    // Retorna la data directamente
    return response.data;

  } catch (error) {
    console.error("Error al obtener las empresas:", error);
    // Retorna un array vacío para evitar errores en el componente
    return [];
  }
};