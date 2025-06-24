// src/services/accountsReceivableService.js
import axios from "axios";

const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/accounts-receivable";

export const getAccountsReceivable = async () => {
  try {
    const token = sessionStorage.getItem("nubix_token"); // token correcto
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener cuentas por cobrar:", error);
    return []; // o `throw error` si deseas manejarlo arriba
  }
};
