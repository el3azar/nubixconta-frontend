import { Notifier } from "../../../utils/alertUtils";
/**
 * Llama a este método cuando el usuario intente activar o desactivar una empresa.
 * Muestra un modal de confirmación y si acepta, ejecuta la función `onConfirm()`.
 * @param {boolean} nuevoEstado - true para activar, false para desactivar
 * @param {function} onConfirm - función a ejecutar si el usuario confirma
 */
export const showToggleCompanyStatusModal = (nuevoEstado, onConfirm) => {
  Notifier.confirm({
    title: `¿Está seguro de que desea ${nuevoEstado ? 'activar' : 'desactivar'} la empresa?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: nuevoEstado ? 'Activar' : 'Desactivar',
    cancelButtonText: 'Cancelar',
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-4 px-4 py-3',
      title: 'fw-bold text-dark',
      confirmButton: `btn ${nuevoEstado ? 'btn-dark' : 'btn-danger'} px-4 me-3`,
      cancelButton: 'btn btn-outline-dark px-4'
    },
    background: '#c0b8cd',
    color: '#000'
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
