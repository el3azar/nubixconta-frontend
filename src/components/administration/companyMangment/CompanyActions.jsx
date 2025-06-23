import React from 'react';
import {
  FiEdit,
  FiEye,
  FiBarChart2,
  FiUserPlus,
  FiXCircle,
  FiCheckCircle
} from 'react-icons/fi';

const CompanyActions = ({
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus,
  isActive
}) => {
  const iconStyle = {
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <span className="me-2" title="Editar">
        <FiEdit style={iconStyle} onClick={onEdit} />
      </span>

      <span className="me-2" title="Ver Información">
        <FiEye style={iconStyle} onClick={onView} />
      </span>

      <span className="me-2" title="Ver Contabilidad">
        <FiBarChart2 style={iconStyle} onClick={onAccounting} />
      </span>

      <span className="me-2" title="Asignar Empresa">
        <FiUserPlus style={iconStyle} onClick={onAssign} />
      </span>

      <span title={isActive ? 'Desactivar' : 'Activar'}>
        {isActive ? (
          <FiXCircle
            style={{ ...iconStyle, color: 'red' }}
            onClick={() => onToggleStatus(false)}
          />
        ) : (
          <FiCheckCircle
            style={{ ...iconStyle, color: 'green' }}
            onClick={() => onToggleStatus(true)}
          />
        )}
      </span>
    </div>
  );
};

export default CompanyActions;
