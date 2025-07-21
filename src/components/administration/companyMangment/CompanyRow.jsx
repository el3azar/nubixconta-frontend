import React, { useState, useRef, useEffect } from 'react';
import CompanyActions from './CompanyActions';
import '../../../styles/administration/CompanyRowAdministration.module.css';
import { getUsersByAssistant } from '../../../services/administration/usersByAssistanService';
import { assignUserToCompany } from '../../../services/administration/assignUserToCompanyService';
import { showSuccess, showError } from '../../inventory/alerts';
import Swal from "sweetalert2";
const CompanyRow = ({
  company,
  index,
  onEdit,
  onView,
  onAccounting,
  onAssign,
}) => {
  const assignButtonRef = useRef(null);
  const selectBoxRef = useRef(null); 
  const [showSelect, setShowSelect] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const buttonRect = assignButtonRef.current?.getBoundingClientRect();
  const [assistantOptions, setAssistantOptions] = useState([]);
  const leftPosition = buttonRect
  ? buttonRect.left + buttonRect.width / 2 - 125 // 125 = mitad del select (250px)
  : 0;
useEffect(() => {
  const fetchAssistants = async () => {
    const users = await getUsersByAssistant();

    const adapted = users.map(user => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.id,
    }));

    setAssistantOptions(adapted);
  };

  fetchAssistants();
}, []);
  const handleAssignClick = () => {
    setShowSelect(prev => !prev);
  };
const handleAssistantChange = async (value) => {
  const selectedUser = assistantOptions.find(opt => opt.value === Number(value));
  const nombreUsuario = selectedUser?.label || value;

  setSelectedAssistant(value);

const confirm = await Swal.fire({
    title: "¿Deseas asignar  esta  empresa?",
    text: `¿Está seguro que desea asignar la contabilidad de la empresa "${company.nombre}" al usuario "${nombreUsuario}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, asignar",
    cancelButtonText: "Cancelar",
  });



if (!confirm.isConfirmed) return;
  try {
    await assignUserToCompany(company.id, selectedUser.value);
     showSuccess("Empresa asignada con exito");
    onAssign({
      ...company,
      asignada: true,
    }, value);
  } catch (error) {
    showError('Ocurrió un error al asignar la empresa. Intente nuevamente.');
  } finally {
    setShowSelect(false);
  }
};


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectBoxRef.current &&
        !selectBoxRef.current.contains(event.target) &&
        !assignButtonRef.current.contains(event.target)
      ) {
        setShowSelect(false);
      }
    };

    if (showSelect) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Limpieza del listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSelect]);

  return (
    <tr className={`text-center align-middle ${!company.activa ? 'inactive-row' : ''}`}>
      <td>{String(index).padStart(2, '0')}</td>
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
        {showSelect && (
          <div
            ref={selectBoxRef} 
            style={{
                position: 'fixed',
                top: assignButtonRef.current?.getBoundingClientRect().bottom + 5 || 0,
                left: (assignButtonRef.current?.getBoundingClientRect().left || 0) + 5,
                zIndex: 9999,
                background: 'transparent', 
                border: 'none',            
                margin: 0,
                padding: 0,
            }}
          >
            <select
              className="form-select"
              value={selectedAssistant}
              onChange={(e) => handleAssistantChange(e.target.value)}
            >
              <option value="">Seleccione un asistente</option>
              {assistantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </td>
    </tr>
  );
};

export default CompanyRow;
