import axios from "axios";
import { DateTime } from "luxon";
const BASE_URL = 'http://localhost:8080/api/v1/collection-detail/register-payment';

//const BASE_URL_AR = 'https://nubixconta-backend-production.up.railway.app/api/v1/accounts-receivable';
//const BASE_URL_CD = 'https://nubixconta-backend-production.up.railway.app/api/v1/collection-detail';
export const registrarLiquidacionVenta = async ({
  documentNumber,
  cuentaNombre,
  metodoPago,
  referencia,
  descripcion,
  ventas,
  cuentas,
  tipoLiquidacion,
  montoAbono
}) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const ventaSeleccionada = ventas.find(v => v.documentNumber === documentNumber);
    if (!ventaSeleccionada) throw new Error("No se encontró la venta");

    const cuentaSeleccionada = cuentas.find(c => c.accountName === cuentaNombre);
    if (!cuentaSeleccionada) throw new Error("No se encontró la cuenta bancaria");

    const monto = tipoLiquidacion === "PARCIAL" ? parseFloat(montoAbono) : ventaSeleccionada.totalAmount;
    if (isNaN(monto) || monto <= 0) throw new Error("El monto del abono debe ser un número positivo");
    
    const nuevoDetalle = {
      saleId:  ventaSeleccionada.saleId,
      accountId: cuentaSeleccionada.id,
      reference: referencia,
      paymentMethod: metodoPago,
      paymentStatus: "PENDIENTE",
      paymentAmount: monto,
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
