import {  FiUserPlus } from 'react-icons/fi';
import { RiUserReceived2Line } from "react-icons/ri";
import {FaEdit, FaEye, FaBook,FaEyeSlash, FaUndo } from 'react-icons/fa';
import styles from '../../../styles/accountsreceivable/AccountsReceivable.module.css'
const CompanyActions = ({
  empresa,
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus,
  isDeactivatedView = false,
}) => {

    // Lógica condicional para renderizar iconos
  if (isDeactivatedView) {
    // Si estamos en la vista de empresas desactivadas, solo mostrar FaEye (para activar)
    return (
      <div className="d-flex justify-content-center gap-3">
         <FaEye title="Reactivar" className={styles.icono} onClick={() => onToggleStatus(empresa)} />
        {/* Puedes añadir FaEye para ver detalles si lo deseas en esta vista */}
       
      </div>
    );
  }

  return (
 <div className="d-flex justify-content-center gap-3">

      {/* Asignar/Reasignar empresa */}
      {empresa.asignada ? (
        <RiUserReceived2Line title="Reasignar" className={styles.icono} onClick={onAssign} />
      ) : (
        <FiUserPlus title="Asignar" className={styles.icono} onClick={onAssign} />
      )}
      {/* Ver empresa */}
      <FaEye title="Ver detalles" className={styles.icono} onClick={onView} />
      
      {/* Desactivar - Siempre visible si solo hay empresas activas */}
      <FaEyeSlash
        title="Desactivar"
        className={styles.icono}
        onClick={() => onToggleStatus(empresa, false)} // Pasa la empresa y el nuevo estado (false para desactivar)
      />

      {/* Editar empresa */}
      <FaEdit title="Editar" className={styles.icono} onClick={onEdit} />

      {/* Ir a contabilidad */}
      <FaBook title="Contabilidad" className={styles.icono} onClick={onAccounting} />

    </div>
  );
};

export default CompanyActions;
