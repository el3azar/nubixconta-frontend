import { useEffect, useState } from 'react';
import { getUsersByAssistant } from '../../../services/administration/usersByAssistanService';
import CompanyRow from './CompanyRow';


const CompanyTable = ({
  companies = [],
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus
}) => {
const [assistantOptions, setAssistantOptions] = useState([]);

useEffect(() => {
  const fetchAssistants = async () => {
    const users = await getUsersByAssistant();
    const adaptedOptions = users.map(user => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.userName, 
    }));
    setAssistantOptions(adaptedOptions);
  };

  fetchAssistants();
}, []);


  return (
    <div className="table-responsive shadow-sm rounded border">
      <table className="table table-bordered table-hover align-middle text-center w-100 mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: '5%' }}>N°</th>
            <th style={{ width: '15%' }}>NRC</th>
            <th style={{ width: '20%' }}>DUI/NIT</th>
            <th style={{ width: '35%' }}>Nombre</th>
            <th style={{ width: '15%' }}>Estado</th>
            <th style={{ width: '30%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {companies.length > 0 ? (
            companies.map((company, index) => (
            <CompanyRow
                key={company.id}
                index={index + 1}
                company={company}
                assistantOptions={assistantOptions}
                onEdit={onEdit}
                onView={onView}
                onAccounting={onAccounting}
                onAssign={onAssign}
                onToggleStatus={onToggleStatus}
              />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted py-4">
                No se encontraron empresas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
