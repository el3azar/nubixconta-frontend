import React from 'react';
import {
  FiEdit,
  FiEye,
  FiBarChart2,
  FiUserPlus,
} from 'react-icons/fi';
import { showToggleCompanyStatusModal } from './ToggleCompanyStatusModal';

const CompanyActions = ({
  empresa,
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus
}) => {
  const handleSwitchChange = () => {
    const nuevoEstado = !empresa.activa;
    showToggleCompanyStatusModal(nuevoEstado, () => {
      onToggleStatus(empresa, nuevoEstado);
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center gap-2">
      <span title="Editar" onClick={onEdit}><FiEdit /></span>
      <span title="Ver" onClick={onView}><FiEye /></span>
      <span title="Contabilidad" onClick={onAccounting}><FiBarChart2 /></span>
      <span title="Asignar" onClick={onAssign}><FiUserPlus /></span>

      {/* 🎯 Aquí va el switch visual */}
      <div className="form-check form-switch switch-dark">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={empresa.activa}
          onChange={handleSwitchChange}
        />
      </div>
    </div>
  );
};

export default CompanyActions;
