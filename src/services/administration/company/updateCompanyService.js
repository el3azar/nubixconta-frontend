import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/companies`;

export const updateCompanyService = async (id, updatedData) => {
  const token = sessionStorage.getItem('nubix_token'); // Asegúrate de que este sea el nombre correcto de tu token

  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error actualizando la empresa:', error);
    throw error.response?.data?.message || 'Error al actualizar la empresa';
  }
};
