import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/products";
/**
 * Edita un producto existente mediante PATCH.
 * @param {number} id - ID del producto.
 * @param {object} productData - Objeto con los datos a actualizar.
 * @returns {Promise<object>} - Respuesta del servidor.
 */
export const updateProduct = async (id, productData) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.patch(`${API_URL}/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    throw error;
  }
};
