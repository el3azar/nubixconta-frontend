// src/services/accountsreceivable/getCollectionEntryById.js
const  API_BASE_URL = "http://localhost:8080/api";

export const getCollectionEntryById = async (id) => {
  const token = sessionStorage.getItem('nubix_token');
  if (!token) {
    throw new Error('No se encontró el token de autenticación.');
  }

  // --- CAMBIO AQUÍ: LA URL DEL ENDPOINT HA SIDO ACTUALIZADA ---
  const url = `${API_BASE_URL}/v1/collection-entry/detail/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Error al obtener el asiento contable para el cobro ID ${id}`);
  }

  const data = await response.json();
  return data;
};