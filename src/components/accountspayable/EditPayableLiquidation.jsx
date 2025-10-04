import React, { useEffect, useState } from "react";
import styles from "../../styles/accountsreceivable/RegisterReceivableLiquidacion.module.css";
import AutocompleteSelect from '../accountsreceivable/AutocompleteSelect';
import { getBankAcount } from "../../services/accountsreceivable/bankService";

import { Notifier } from '../../utils/alertUtils';
import { editarLiquidacionCompra } from "../../services/accountspayable/editarLiquidacionCompra";
const EditPayableLiquidation = ({ onClose, paymentDetail }) => {
  const [cuentas, setCuentas] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [fecha, setFecha] = useState("");

  // Cargar cuentas y setear datos básicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cuentasData = await getBankAcount();
        console.log("Cuentas obtenidas:", cuentasData);
        setCuentas(cuentasData);

        // Asignar cuenta seleccionada si ya existe
        const cuentaMatch = cuentasData.find(
          (c) => c.id === paymentDetail.accountId
        );
        if (cuentaMatch) {
          setCuentaSeleccionada(cuentaMatch.accountName);
        }
      } catch (err) {
        console.error("Error al cargar cuentas:", err);
      }
    };

    if (paymentDetail) {
      setDescripcion(paymentDetail.paymentDetailDescription || "");
      setReferencia(paymentDetail.reference || "");
      setMontoAbono(paymentDetail.paymentAmount || "");
      setMetodoPago(paymentDetail.paymentMethod || "");
      setFecha(paymentDetail.paymentDetailDate || "");
    }

    fetchData();
  }, [paymentDetail]);

  const handleEditar = async () => {
    const cuentaObj = cuentas.find((c) => c.accountName === cuentaSeleccionada);
    if (!cuentaObj) {
      Notifier.error("Debe seleccionar una cuenta válida");
      return;
    }

    try {
      const result = await editarLiquidacionCompra(paymentDetail.id, {
        accountId: cuentaObj.id,
        paymentMethod: metodoPago,
        reference: referencia,
        paymentStatus: paymentDetail.paymentStatus,
        paymentAmount: montoAbono,
        paymentDetailDescription: descripcion,
        paymentDetailDate: fecha,
        moduleType: paymentDetail.moduleType,
      });

      if (result.success) {
        Notifier.success("Liquidación actualizada con éxito.");
        onClose();
      } else {
        Notifier.error("Error al actualizar: " + result.message);
      }
    } catch (error) {
      console.error("Error al editar liquidación:", error);
      Notifier.error("Ocurrió un error: " + error.message);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        <h3 className={styles.title}>Editar liquidación</h3>

        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>N° de Documento</label>
            <input
              className={styles.input}
              type="text"
              value={paymentDetail?.documentNumber || ""}
              disabled
            />
          </div>

          <div>
            <label className={styles.label}>Método de pago</label>
            <select
              className={styles.input}
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option>Transacción</option>
              <option>Tarjeta</option>
              <option>Remesa</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.input}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label}>Referencia</label>
            <input
              className={styles.input}
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          <AutocompleteSelect
            label="Cuenta"
            options={cuentas.map((c) => c.accountName)}
            placeholder="Buscar cuenta bancaria"
            onSelect={(value) => setCuentaSeleccionada(value)}
            selectedValue={cuentaSeleccionada}
          />

          <div>
            <label className={styles.label}>Monto</label>
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              value={montoAbono}
              onChange={(e) => setMontoAbono(e.target.value)}
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.cancel}>Cancelar</button>
          <button onClick={handleEditar} className={styles.register}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditPayableLiquidation;
