import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/collection-detail";

export const getCollectionDetailById = async (id) => {
  try {
    const token = sessionStorage.getItem("nubix_token");

    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener el CollectionDetail por ID:", error);
    throw new Error("No se pudo obtener la información del cobro.");
  }
};
