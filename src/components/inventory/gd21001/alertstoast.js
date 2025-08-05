// Importa la librería SweetAlert2 para poder usarla.
import Swal from 'sweetalert2';

// Define una configuración base para todos los toasts para no repetir código.
const baseToast = {
  toast: true,                // Lo convierte en un toast (notificación pequeña).
  position: 'top-end',        // Posición en la esquina superior derecha.
  showConfirmButton: false,   // No muestra el botón de confirmación.
  timer: 3000,                // El toast se cierra automáticamente después de 3 segundos.
  timerProgressBar: true,     // Muestra una barra de progreso del tiempo restante.
  customClass: {
    popup: 'swal2-toast',     // Clase CSS para el contenedor del toast.
    title: 'swal2-title-custom', // Clase CSS para el título del toast.
  }
};

// ✅ Función para un toast de ÉXITO.
export const showSuccess = (message) => {
  Swal.fire({
    ...baseToast,             // Usa la configuración base.
    background: '#87c087d5',    // Fondo verde.
    color: 'white',           // Texto blanco.
    icon: 'success',          // Ícono de éxito.
    title: message,           // Mensaje a mostrar.
  });
};

// ❌ Función para un toast de ERROR.
export const showError = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#c78282e5',    // Fondo rojo.
    color: 'white',
    icon: 'error',
    title: message,
  });
};

// ⚠️ Función para un toast de ADVERTENCIA.
export const showWarning = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#b89a6bde',    // Fondo amarillo/naranja.
    color: 'white',
    icon: 'warning',
    title: message,
  });
};

// ℹ️ Función para un toast de INFORMACIÓN.
export const showInfo = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#8cbad8d3',    // Fondo azul.
    color: 'white',
    icon: 'info',
    title: message,
  });
};