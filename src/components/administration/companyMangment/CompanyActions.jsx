import {  FiUserPlus } from 'react-icons/fi';
import { RiUserReceived2Line } from "react-icons/ri";
import {FaEdit, FaEye, FaBook } from 'react-icons/fa';
import styles from '../../../styles/accountsreceivable/AccountsReceivable.module.css'
const CompanyActions = ({
  empresa,
  onEdit,
  onView,
  onAccounting,
  onAssign,
}) => {
  return (
 <div className="d-flex justify-content-center gap-2">

      {/* Ver empresa */}
      <FaEye title="Ver detalles" className={styles.icono} onClick={onView} />

      {/* Editar empresa */}
      <FaEdit title="Editar" className={styles.icono} onClick={onEdit} />

      {/* Ir a contabilidad */}
      <FaBook title="Contabilidad" className={styles.icono} onClick={onAccounting} />

      {/* Asignar/Reasignar empresa */}
      {empresa.asignada ? (
        <RiUserReceived2Line title="Reasignar" className={styles.icono} onClick={onAssign} />
      ) : (
        <FiUserPlus title="Asignar" className={styles.icono} onClick={onAssign} />
      )}
    </div>
  );
};

export default CompanyActions;
