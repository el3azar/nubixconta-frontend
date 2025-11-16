import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/sales/status`;
export const getAllSales = async (status = "APLICADA") => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.get(`${BASE_URL}/${status}`, {
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
