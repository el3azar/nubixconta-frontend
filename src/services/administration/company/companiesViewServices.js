import axios from "axios";
//Este enpoint trae el listado de todas las cuentas activas
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/companies/active`;
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
