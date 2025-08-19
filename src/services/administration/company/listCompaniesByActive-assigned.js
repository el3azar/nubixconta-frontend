import axios from "axios";
//Este enpoint trae el listado de todas las cuentas activas y asignadas
const API_URL = "http://localhost:8080/api/v1/companies/active-assigned";
export const getCompaniesActiveAndAssigned = async () => {
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