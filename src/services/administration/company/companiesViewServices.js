import axios from "axios";
//Este enpoint trae el listado de todas las cuentas asignadas
const API_URL = "http://localhost:8080/api/v1/companies/active";
//const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/companies";
export const getCompaniesActive = async () => {
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
    console.error("Error al obtener las empresas:", error);
    return [];
  }
};
