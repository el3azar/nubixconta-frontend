import React from 'react';
import CompanyActions from './CompanyActions';

const CompanyRow = ({
  company,
  index,
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus
}) => {
  return (
    <tr className="text-center align-middle">
      <td>{String(index).padStart(4, '0')}</td>
      <td>{company.nrc}</td>
      <td>{company.nombre}</td>
      <td className={company.asignada ? 'text-success' : 'text-secondary'}>
        {company.asignada ? 'Asignada' : 'Sin asignar'}
      </td>
      <td>
        <CompanyActions
          isActive={company.activa}
          onEdit={() => onEdit(company)}
          onView={() => onView(company)}
          onAccounting={() => onAccounting(company)}
          onAssign={() => onAssign(company)}
          onToggleStatus={(newState) => onToggleStatus(company, newState)}
        />
      </td>
    </tr>
  );
};

export default CompanyRow;
