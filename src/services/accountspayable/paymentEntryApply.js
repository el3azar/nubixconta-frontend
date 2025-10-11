import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/payment-entry/from-detail";

export const applyPaymentEntry = async (paymentDetailId) => {
  const token = sessionStorage.getItem("nubix_token");
  const headers = {
    Authorization: `Bearer ${token}`
  };

  try {
    const response = await axios.post(`${BASE_URL}/${paymentDetailId}`, null, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al aplicar partida contable:", error.response || error);
    throw error;
  }
};


