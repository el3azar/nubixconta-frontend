// src/utils/alertUtils.js
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast'; // Importación correcta de react-hot-toast

// --- CONFIGURACIÓN CENTRALIZADA ---

// Clases CSS personalizadas para TODOS los modales de SweetAlert.
// Estas clases deben estar definidas en tu archivo CSS global (ej. custom-swal.css).
const swalCustomClasses = {
  popup: 'swal-popup-custom',
  title: 'swal-title-custom',
  htmlContainer: 'swal-html-container-custom',
  icon: 'swal-icon-custom',
  confirmButton: 'swal-button-confirm-custom',
  cancelButton: 'swal-button-cancel-custom',
};


// =================================================================
// == API DE NOTIFICACIONES ESTANDARIZADA "Notifier"
// =================================================================

export const Notifier = {

  // --- TOASTS ESTÁNDAR (Con el tema morado de Rutas.jsx o el Toaster global) ---

  /** Muestra un toast de éxito con el tema principal de la aplicación. */
  success: (message = '¡Operación exitosa!') => toast.success(message),

  /** Muestra un toast de error con el tema principal de la aplicación. */
  error: (message = 'Ocurrió un error.') => toast.error(message),

  /**
   * Muestra un toast de información. Acepta opciones para personalizarlo.
   * @param {string} message - El mensaje a mostrar.
   * @param {object} [options] - Opciones adicionales de react-hot-toast.
   * @param {React.ReactNode} [options.icon] - Un icono personalizado en formato JSX.
   * @param {number} [options.duration] - Duración personalizada en milisegundos.
   */
  info: (message, options = {}) => {
    const defaultIcon = 'ℹ️';
    const finalIcon = options.icon ?? defaultIcon; // Usa el operador de coalescencia nula
    toast(message, {
      icon: finalIcon,
      ...options
    });
  },

  /** Muestra un toast de advertencia con el tema principal de la aplicación. */
  warning: (message) => toast(message, { icon: '⚠️' }),

 /**
   * Muestra un toast de carga y devuelve su ID para poder cerrarlo manualmente.
   * @param {string} message - El mensaje de carga.
   * @returns {string} El ID del toast.
   */
  loading: (message = 'Cargando...') => toast.loading(message),

  /**
   * Cierra un toast específico usando su ID.
   * @param {string} toastId - El ID del toast a cerrar.
   */
  dismiss: (toastId) => toast.dismiss(toastId),

  // =================================================================
  // == TOASTS TEMÁTICOS (Colores Alternativos)
  // =================================================================

  /** Muestra un toast de éxito con un fondo VERDE. */
  successGreen: (message = '¡Éxito!') => {
    toast.success(message, {
      style: {
        background: '#7ACB7A',
        color: 'white',
        border: '1px solid #69b369',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#7ACB7A',
      },
    });
  },

  /** Muestra un toast de error con un fondo ROJO. */
  errorRed: (message = 'Error') => {
    toast.error(message, {
      style: {
        background: '#E57373',
        color: 'white',
        border: '1px solid #d46262',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#E57373',
      },
    });
  },


  // --- MODALES BLOQUEANTES (Con SweetAlert2 y tu CSS personalizado) ---

  /**
   * Muestra una alerta de error grave que bloquea la UI.
   * @param {string} title - Título del modal.
   * @param {string} text - Texto del cuerpo del modal.
   * @returns {Promise<SweetAlertResult>} Resultado de la interacción del usuario.
   */
  showError: (title, text) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      customClass: swalCustomClasses,
    });
  },

  /**
   * Muestra un diálogo de confirmación.
   * @param {object} options - Opciones para el modal de confirmación.
   * @param {string} options.title - Título del modal.
   * @param {string} options.text - Texto del cuerpo del modal.
   * @param {string} [options.confirmButtonText='Sí, continuar'] - Texto del botón de confirmación.
   * @returns {Promise<SweetAlertResult>} Resultado de la interacción del usuario.
   */
  confirm: ({ title, text, confirmButtonText = 'Sí, continuar' }) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      customClass: swalCustomClasses,
    });
  },

  /**
   * Muestra un diálogo con un campo de texto para entrada de usuario.
   * @param {object} options - Opciones para el modal de input.
   * @param {string} options.title - Título del modal.
   * @param {string} options.inputLabel - Etiqueta para el campo de entrada.
   * @param {string} [options.placeholder=''] - Placeholder del campo de entrada.
   * @returns {Promise<SweetAlertResult>} Resultado de la interacción del usuario con el valor ingresado.
   */
  input: ({ title, inputLabel, placeholder = '' }) => {
    return Swal.fire({
      title,
      input: 'text',
      inputLabel,
      placeholder,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        ...swalCustomClasses,
        input: 'swal-input-custom' // Clase específica para el campo de texto de SweetAlert
      },
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '¡Este campo es requerido!';
        }
      }
    });
  },
};