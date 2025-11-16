import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/payment-entry/by-detail`;

export const cancelPaymentEntry = async (paymentDetailId) => {
  const token = sessionStorage.getItem("nubix_token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    await axios.delete(`${BASE_URL}/${paymentDetailId}`, { headers });
  } catch (error) {
    console.error("Error al anular la partida:", error);
    throw error;
  }
};
