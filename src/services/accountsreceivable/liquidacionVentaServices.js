import axios from "axios";
import { DateTime } from "luxon";
const BASE_URL = 'http://localhost:8080/api/v1/collection-detail/register-payment';

const BASE_URL_AR = 'http://localhost:8080/api/v1/accounts-receivable';
const BASE_URL_CD = 'http://localhost:8080/api/v1/collection-detail';

export const registrarLiquidacionVenta = async ({
  saleId,
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
      saleId:  saleId,
      accountId: cuentaSeleccionada.id,
      reference: referencia,
      paymentMethod: metodoPago,
      paymentStatus: "PENDIENTE",
      paymentAmount: montoFinal,
      paymentDetailDescription: descripcion,
      collectionDetailDate:DateTime.local().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      moduleType: "Cuentas por cobrar",
    };

    await axios.post(BASE_URL, nuevoDetalle, { headers });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar liquidación:", error);
    return { success: false, message: error.message };
  }
};
