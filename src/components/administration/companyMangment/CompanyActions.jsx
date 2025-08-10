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

  if (isDeactivatedView) {
    return (
      <div className="d-flex justify-content-center gap-3">
         <FaEye title="Reactivar" className={styles.icono} onClick={() => onToggleStatus(empresa)} />
   
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
    </div>
  );
};

export default CompanyActions;
