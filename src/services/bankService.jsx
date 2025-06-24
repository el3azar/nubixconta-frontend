import axios from "axios";
//Este enpoint trae el listado de todas las cuentas bancarias de la empresa
const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/accounts/bank-accounts";

export const getBankAcount = async () => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
};