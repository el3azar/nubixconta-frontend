// src/services/accounting/cierreService.js
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from 'react';

// --- MODIFICACIÓN: La URL base ahora apunta a la ruta común ---
const BASE_URL = "http://localhost:8080/api/v1/cierres/mensual";

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const useCierreService = () => {
  const { token } = useAuth();

  /**
   * Obtiene el estado (abierto/cerrado) de los 12 meses para un año específico.
   * La respuesta es un array de objetos: [{ mes: 1, nombreMes: 'Enero', cerrado: true }, ...]
   */
  const getEstadoMensualPorAnio = useCallback(async (anio) => {
    const endpoint = `${BASE_URL}/${anio}`; // Llama a GET /api/v1/cierres/mensual/{anio}
    const response = await axios.get(endpoint, getAuthHeader(token));
    return response.data;
  }, [token]);

  /**
   * Cierra un período contable (mes) para un año específico.
   */
  const cerrarPeriodo = useCallback(async ({ anio, mes }) => {
    const endpoint = `${BASE_URL}/${anio}/${mes}`;
    await axios.post(endpoint, null, getAuthHeader(token));
  }, [token]);

  /**
   * Reabre un período contable (mes) que estaba cerrado.
   */
  const reabrirPeriodo = useCallback(async ({ anio, mes }) => {
    const endpoint = `${BASE_URL}/${anio}/${mes}`;
    await axios.delete(endpoint, getAuthHeader(token));
  }, [token]);

  return {
    getEstadoMensualPorAnio, // Nombre de función actualizado
    cerrarPeriodo,
    reabrirPeriodo,
  };
};