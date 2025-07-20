import React, { useState,useRef } from 'react';
import CompanyActions from './CompanyActions';
import CustomSelect from './CustomSelect'; // Asegúrate que la ruta sea correcta
import '../../../styles/administration/CompanyRowAdministration.module.css'
import CustomDropdown from './CustomDropdown';

const CompanyRow = ({
  company,
  index,
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus,
   assistantOptions,
}) => {
    const assignButtonRef = useRef(null);
  const [showSelect, setShowSelect] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');


  const handleAssignClick = () => {
    setShowSelect(prev => !prev);
  };

   const handleAssistantChange = (value) => {
    setSelectedAssistant(value);
    setShowSelect(false);
    console.log(`Asistente asignado a ${company.nombre}:`, value);
    onAssign(company, value);
  };

  return (
    <tr className={`text-center align-middle ${!company.activa ? 'inactive-row' : ''}`}>
      <td>{String(index).padStart( '0')}</td>
      <td>{company.nrc}</td>
      <td>{company.dui || company.nit}</td>
      <td>{company.nombre}</td>
<td className={company.asignada ? 'text-success' : 'text-secondary'}>
  {company.asignada ? 'Asignada' : 'Sin asignar'}
</td>
      <td style={{ position: 'relative' }}>
    <div ref={assignButtonRef}>
          <CompanyActions
            empresa={company}
            onEdit={() => onEdit(company)}
            onView={() => onView(company)}
            onAccounting={() => onAccounting(company)}
            onAssign={handleAssignClick}
          />
        </div>
        
        {/* Select visible si showSelect está activo */}
    {showSelect && (
  <div
    style={{
      position: 'fixed',         // 👈 Cambiado de 'absolute' a 'fixed'
      top: assignButtonRef.current?.getBoundingClientRect().bottom + 5 || 0,
      left: assignButtonRef.current?.getBoundingClientRect().left || 0,
      zIndex: 9999,              // 👈 Para que quede encima de todo
      width: '250px',
    }}
  >
    <CustomDropdown
      options={assistantOptions}
      selected={assistantOptions.find(opt => opt.value === selectedAssistant)}
      onSelect={handleAssistantChange}
      placeholder="Seleccionar asistente"
    />
  </div>
)}
      </td>
    </tr>
  );
};

export default CompanyRow;
