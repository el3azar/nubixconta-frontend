import React, { useState } from 'react';
import CompanyActions from './CompanyActions';
import CustomSelect from './CustomSelect'; // Asegúrate que la ruta sea correcta
import '../../../styles/administration/CompanyRow.administration.css';

const CompanyRow = ({
  company,
  index,
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');

  // Lista de asistentes (puedes pasarla como prop si lo prefieres)
  const assistantOptions = [
    { label: 'John Doe', value: 'john' },
    { label: 'Asistente 2', value: 'a2' },
    { label: 'Asistente 3', value: 'a3' },
    { label: 'Asistente 4', value: 'a4' },
  ];

  const handleAssignClick = () => {
    setShowSelect(prev => !prev);
  };

  const handleAssistantChange = (value) => {
    setSelectedAssistant(value);
    setShowSelect(false);
    console.log(`Asistente asignado a ${company.nombre}:`, value);
    // Puedes ejecutar aquí una función onAssign(company, value) si deseas persistir
    onAssign(company, value);
  };

  return (
    <tr className={`text-center align-middle ${!company.activa ? 'inactive-row' : ''}`}>
      <td>{String(index).padStart(4, '0')}</td>
      <td>{company.nrc}</td>
      <td>{company.nombre}</td>
      <td className={company.asignada ? 'text-success' : 'text-secondary'}>
        {company.asignada ? 'Asignada' : 'Sin asignar'}
      </td>
      <td style={{ position: 'relative' }}>
        <CompanyActions
          empresa={company}
          onEdit={() => onEdit(company)}
          onView={() => onView(company)}
          onAccounting={() => onAccounting(company)}
          onAssign={handleAssignClick}
          onToggleStatus={(c, estado) => onToggleStatus(c, estado)}
        />
        
        {/* Select visible si showSelect está activo */}
        {showSelect && (
          <div className="position-absolute z-3" style={{ top: '100%', left: 0, width: '200px' }}>
            <CustomSelect
              options={assistantOptions}
              value={selectedAssistant}
              onChange={handleAssistantChange}
              placeholder="Seleccionar asistente"
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export default CompanyRow;
