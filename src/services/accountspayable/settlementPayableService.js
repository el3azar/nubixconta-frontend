import axios from "axios";
import { DateTime } from "luxon";
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1/payment-details/make-payment`;
const PURCHASE_DOCUMENT_URL = `${import.meta.env.VITE_API_URL}/api/v1/purchases/document`;

export const settlementPayableService = async ({
  idPurchase,
  cuentaNombre,
  metodoPago,
  referencia,
  descripcion,
  cuentas,
  montoAPagar,
}) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const cuentaSeleccionada = cuentas.find(c => c.accountName === cuentaNombre);
    if (!cuentaSeleccionada) throw new Error("No se encontró la cuenta bancaria");

    const montoFinal = parseFloat(montoAPagar);

    if (isNaN(montoFinal) || montoFinal <= 0) {
      throw new Error("El monto a registrar debe ser un número positivo y válido.");
    }

    const nuevoDetalle = {
      idPurchase:  idPurchase,
      reference: referencia,
      paymentMethod: metodoPago,
      paymentStatus: "PENDIENTE",
      paymentAmount: montoFinal,
      paymentDetailDescription: descripcion,
      paymentDetailsDate:DateTime.local().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      moduleType: "Cuentas por pagar",
      accountId: cuentaSeleccionada.id,
    };
console.log("Datos enviados al servidor:", nuevoDetalle);
    await axios.post(BASE_URL, nuevoDetalle, { headers });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar liquidación:", error);
    return { success: false, message: error.message };
  }
};

export const getPurchaseIdByDocumentNumber = async (documentNumber) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(`${PURCHASE_DOCUMENT_URL}/${documentNumber}`, { headers });
    return response.data; // Esto debería devolver el ID de la compra
  } catch (error) {
    console.error("Error al obtener el ID de la compra por número de documento:", error);
    throw error;
  }
};
