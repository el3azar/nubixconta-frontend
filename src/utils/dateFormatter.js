// src/utils/dateFormatter.js (Replaces your existing function)
import { parseISO, format, isValid } from 'date-fns';
// Opcional: para formato español si lo prefieres
// import { es } from 'date-fns/locale'; 

/**
 * Formatea una fecha string (ISO) al formato DD/MM/YYYY usando date-fns.
 * Maneja correctamente fechas sin hora sin asumir UTC.
 * @param {string} dateString - La fecha a formatear (ej. "2025-10-21" o "2025-10-21T14:30:00").
 * @returns {string} La fecha formateada como "DD/MM/YYYY" o un texto de fallback.
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }

  try {
    // parseISO interpreta "YYYY-MM-DD" como fecha local, no UTC midnight
    const date = parseISO(dateString); 

    // Comprueba si la fecha parseada es válida
    if (!isValid(date)) {
      return 'Fecha inválida';
    }

    // Formatea como DD/MM/YYYY
    // Puedes cambiar 'dd/MM/yyyy' por 'MM/dd/yyyy' si prefieres ese formato
    return format(date, 'dd/MM/yyyy'); 
    // Para formato español: return format(date, 'dd/MM/yyyy', { locale: es });

  } catch (error) {
    console.error("Error formateando fecha (date-fns):", dateString, error);
    return 'Error al formatear'; 
  }
};


// =================================================================
// == NUEVAS FUNCIONES AÑADIDAS (NO ROMPEN NADA)
// =================================================================

/**
 * Formateador de moneda centralizado.
 * @param {number | string} value - El valor numérico a formatear.
 * @returns {string} El valor formateado como moneda.
 */
export const formatCurrency = (value) => {
  const number = Number(value);
  if (isNaN(number)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

/**
 * Formatea una fecha string (ISO) a un formato legible con hora (ej. "29/10/2025 09:36 PM").
 * Usado en el Libro Mayor.
 * @param {string} dateString - La fecha en formato ISO 8601.
 * @returns {string} La fecha formateada o 'N/A'.
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy h:mm a') : 'Fecha inválida';
  } catch (error) {
    return 'Error de fecha';
  }
};