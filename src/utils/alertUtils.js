// src/utils/alertUtils.js

import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

// Objeto de configuración de clases para no repetirlo.
const customClasses = {
  popup: 'swal-popup-custom',
  title: 'swal-title-custom',
  htmlContainer: 'swal-html-container-custom',
  icon: 'swal-icon-custom',
  confirmButton: 'swal-button-confirm-custom',
  cancelButton: 'swal-button-cancel-custom',
};

/**
 * Muestra un toast de éxito.
 * @param {string} message - El mensaje a mostrar.
 */
export const showSuccessToast = (message = '¡Operación exitosa!') => {
  toast.success(message);
};

/**
 * Muestra una alerta de error bloqueante con el tema de la aplicación.
 * @param {string} title - El título del error.
 * @param {string} text - La descripción del error.
 */
export const showErrorAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    customClass: customClasses,
  });
};

/**
 * Muestra un diálogo de confirmación con el tema de la aplicación.
 * @param {object} options - Opciones para el diálogo.
 * @param {string} options.title - El título de la pregunta (ej. '¿Estás seguro?').
 * @param {string} options.text - El texto de advertencia.
 * @param {string} [options.confirmButtonText='Sí, continuar'] - Texto para el botón de confirmar.
 * @returns {Promise<SweetAlertResult>}
 */
export const showConfirmDialog = ({ title, text, confirmButtonText = 'Sí, continuar' }) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    customClass: customClasses,
  });
};