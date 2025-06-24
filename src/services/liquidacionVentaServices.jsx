import axios from "axios";

const BASE_URL_AR = 'https://nubixconta-backend-production.up.railway.app/api/v1/accounts-receivable';
const BASE_URL_CD = 'https://nubixconta-backend-production.up.railway.app/api/v1/collection-detail';

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

    const nuevaCuentaPorCobrar = {
      saleId: ventaSeleccionada.saleId,
      balance: monto,
      receiveAccountStatus: "PENDIENTE",
      receivableAccountDate: new Date().toISOString(),
      moduleType: "Cuentas por cobrar",
    };

    const responseAR = await axios.post(BASE_URL_AR, nuevaCuentaPorCobrar, { headers });
    const accountReceivableId = responseAR.data.id;

    const nuevoDetalle = {
      accountReceivable: { id: accountReceivableId },
      accountId: cuentaSeleccionada.id,
      reference: referencia,
      paymentMethod: metodoPago,
      paymentStatus: "PENDIENTE",
      paymentAmount: monto,
      paymentDetailDescription: descripcion,
      moduleType: "Cuentas por cobrar",
    };

    await axios.post(BASE_URL_CD, nuevoDetalle, { headers });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar liquidación:", error);
    return { success: false, message: error.message };
  }
};
