// services/accountsreceivable/editarLiquidacionVenta.js
import axios from "axios";
import { DateTime } from "luxon";

const BASE_URL = "http://localhost:8080/api/v1/payment-details";

export const editarLiquidacionCompra = async (id, {
  accountId,
  paymentMethod,
  reference,
  paymentStatus,
  paymentAmount,
  paymentDetailDescription,
  paymentDetailsDate,
  moduleType
}) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const payload = {
      accountId,
      paymentMethod,
      reference,
      paymentStatus,
      paymentAmount: parseFloat(paymentAmount),
      paymentDetailDescription,
      paymentDetailsDate: DateTime.fromISO(paymentDetailsDate).toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      moduleType,
    };

    await axios.patch(`${BASE_URL}/${id}`, payload, { headers });
    return { success: true };
  } catch (error) {
    console.error("Error al editar liquidación:", error);
    return { success: false, message: error.message };
  }
};
