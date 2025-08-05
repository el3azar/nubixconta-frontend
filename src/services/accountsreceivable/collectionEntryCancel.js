import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/collection-entry/by-detail";

export const cancelCollectionEntry = async (collectionDetailId) => {
  const token = sessionStorage.getItem("nubix_token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    await axios.delete(`${BASE_URL}/${collectionDetailId}`, { headers });
  } catch (error) {
    console.error("Error al anular la partida:", error);
    throw error;
  }
};
