import axios from "axios";

const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/products";

export const fetchProductList = async () => {
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
    console.error("Error al obtener la lista de productos:", error);
    return [];
  }
};
