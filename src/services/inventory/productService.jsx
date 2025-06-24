import axios from "axios";

const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/products";

export const createProduct = async (productData) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.post(API_URL, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al registrar el producto:", error);
    throw error;
  }
};
