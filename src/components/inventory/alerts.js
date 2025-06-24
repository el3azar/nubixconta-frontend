import Swal from 'sweetalert2';

const baseToast = {
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: {
    popup: 'swal2-toast',
    title: 'swal2-title-custom',
  }
};

export const showSuccess = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#7ACB7A',
    color: 'white',
    icon: 'success',
    title: message,
  });
};

export const showError = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#E57373',
    color: 'white',
    icon: 'error',
    title: message,
  });
};

export const showInfo = (message) => {
  Swal.fire({
    ...baseToast,
    background: '#5DADE2',
    color: 'white',
    icon: 'info',
    title: message,
  });
};
