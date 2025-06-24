// src/services/accountReceivableService.js
import axios from "axios";

const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/accounts-receivable/search-by-customer";

export const getAccountStatementsByCustomer = async (filters) => {
  try {
    const token = sessionStorage.getItem("nubix_token");

    // Construimos la query dinámicamente
    const params = new URLSearchParams();
    if (filters.nombre) params.append("name", filters.nombre);
    if (filters.apellido) params.append("lastName", filters.apellido);
    if (filters.dui) params.append("dui", filters.dui);
    if (filters.nit) params.append("nit", filters.nit);

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener estado de cuenta:", error);
    return [];
  }
};
