import { useEffect, useState } from 'react';
import { getUsersByAssistant } from '../../../services/administration/company/usersByAssistanService';
import CompanyRow from './CompanyRow';
import styles from '../../../styles/accountsreceivable/AccountsReceivable.module.css';
const CompanyTable = ({
  companies = [],
  onEdit,
  onView,
  onAccounting,
  onAssign,
  onToggleStatus,
  isDeactivatedView = false,
}) => {
const [assistantOptions, setAssistantOptions] = useState([]);

useEffect(() => {
  const fetchAssistants = async () => {
    try{
    const users = await getUsersByAssistant();
    const adaptedOptions = users.map(user => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.id, 
    }));
        setAssistantOptions(adaptedOptions);
    }catch{
      console.error("Error al cargar asistentes:", error);
    }
  };

  fetchAssistants();
}, []);


  return (
<div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
<thead>
  <tr className="text-center">
    <th>N°</th>
    <th  >NRC</th>
    <th >DUI/NIT</th>
    <th >Nombre</th>
    <th >Estado</th>
    <th >Acciones</th>
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
                isDeactivatedView={isDeactivatedView}
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
