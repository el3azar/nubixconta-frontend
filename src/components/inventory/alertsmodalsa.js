// alertService.js

// Se importa la librería una sola vez en este archivo.
import Swal from 'sweetalert2';
import './alertsmodalsa.css';
/**
 * Muestra una alerta básica con un título y un texto.
 * @param {string} title - El título de la alerta.
 * @param {string} text - El texto del cuerpo de la alerta.
 * @param {string} icon - El ícono a mostrar (success, error, warning, info, question).
 */
export const showAlert = (title, text, icon) => {
  Swal.fire({
    title,
    text,
    icon,
  });
};

/**
 * Muestra un diálogo de confirmación. Devuelve una promesa que se resuelve con la interacción del usuario.
 * El componente que lo llama debe manejar el resultado con .then() o async/await.
 * @param {string} title - El título del diálogo.
 * @param {string} text - El texto de advertencia.
 * @returns {Promise<SweetAlertResult>}
 */
export const showConfirmationDialog = (
  title = '¿Estás seguro?',
  text = "Esta acción no se puede revertir.",
  confirmButtonText = 'Sí, ¡hazlo!', // Valor por defecto
  cancelButtonText = 'Cancelar' // Valor por defecto
) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText, // Usamos el parámetro
    cancelButtonText   // Usamos el parámetro
  });
};

/**
 * Muestra un diálogo con un campo de texto para que el usuario ingrese datos.
 * @param {string} title - El título del diálogo.
 * @param {string} inputLabel - La etiqueta para el campo de texto.
 * @returns {Promise<SweetAlertResult>}
 */
export const showInputDialog = (title, inputLabel) => {
  return Swal.fire({
    title,
    input: 'text',
    inputLabel,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    customClass: {
      input: 'mi-input-grande' // Nombre de la clase que usarás en tu CSS
    },
    inputValidator: (value) => {
      if (!value) {
        return '¡Necesitas escribir algo!';
      }
    }
  });
};

/**
 * Muestra una alerta que se cierra automáticamente después de un tiempo.
 * @param {string} title - El título de la alerta.
 * @param {number} timer - El tiempo en milisegundos para que se cierre.
 */
export const showAutoClosingAlert = (title, timer = 2000) => {
  Swal.fire({
    title,
    timer,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Muestra una alerta de carga, ejecuta una promesa (como una llamada fetch) y muestra el resultado.
 * @param {Function} requestFunction - Una función que devuelve una promesa (ej. una llamada fetch).
 */
export const showAjaxRequest = (requestFunction) => {
  Swal.fire({
    title: 'Procesando...',
    text: 'Por favor, espera.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  requestFunction()
    .then(result => {
      Swal.fire({
        title: result.title,
        text: result.message,
        icon: 'success'
      });
    })
    .catch(error => {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    });
};