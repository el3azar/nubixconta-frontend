// src/components/shared/InactiveEntityListView.jsx

import React from 'react';
import { FaEye } from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '../../context/CompanyContext';

import { Notifier } from '../../utils/alertUtils';
import SubMenu from "./SubMenu"; 
import ViewContainer from './ViewContainer';

import styles from '../../styles/shared/InactiveEntityListView.module.css';

// Helper de formateo (reutilizado)
const formatters = {
  phone: (phone) => {
    if (!phone) return "-";
    return String(phone).length === 8 ? `${phone.slice(0, 4)}-${phone.slice(4)}` : phone;
  },
  currency: (amount) => {
    const number = Number(amount);
    return isNaN(number) ? "-" : `$${number.toFixed(2)}`;
  },
  default: (value) => value,
};

const InactiveEntityListView = ({ config, service }) => {
  const { getInactive, reactivate } = service;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { company } = useCompany();

  const { data: entities = [], isLoading, isError, error } = useQuery({
    queryKey: [config.queryKey, 'inactive', company],
    queryFn: getInactive,
    enabled: !!company, 
  });

  const { mutate: reactivateEntity, isPending: isReactivating } = useMutation({
    mutationFn: reactivate,
    onSuccess: () => {
      Notifier.success(`¡Reactivado! El ${config.entityName} está activo de nuevo.`);
      queryClient.invalidateQueries({ queryKey: [config.queryKey, 'inactive'] });
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (err) => {
      Notifier.error(err.response?.data?.message || `No se pudo reactivar el ${config.entityName}.`);
    }
  });

  // Manejadores de eventos (sin cambios, ya eran genéricos)
  const handleActivate = async (id, name) => {
    const result = await Notifier.confirm({
      title: `¿Reactivar a ${name}?`,
      text: `El ${config.entityName} volverá a aparecer en la lista principal.`,
      confirmButtonText: 'Sí, reactivar'
    });
    
    if (result.isConfirmed) {
      reactivateEntity(id);
    }
  };
  const handleBack = () => navigate(-1);

  return (
    <>
      <SubMenu links={config.subMenuLinks} />
      <ViewContainer>
        <section className={styles.wrapper}>
          <h2 className={styles.heading}>{config.entityNamePlural} Desactivados:</h2>
          <div className={styles.tableContainer}>
            <table className="table table-striped">
              <thead>
                <tr>
                  {/* Se renderizan las cabeceras desde la configuración */}
                  {config.inactiveViewColumns.map(col => <th key={col.header}>{col.header}</th>)}
                  <th>Activar</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={config.inactiveViewColumns.length + 1} className="text-center">Cargando...</td></tr>}
                {isError && <tr><td colSpan={config.inactiveViewColumns.length + 1} className="text-center text-danger">Error: {error.message}</td></tr>}
                {!isLoading && !isError && entities.length > 0 ? (
                  entities.map(entity => (
                    <tr key={entity[config.idField]}>
                      {/* Se renderizan las celdas aplicando la clase y el formateador */}
                      {config.inactiveViewColumns.map(col => (
                        <td key={col.accessor} className={styles[col.className]}>
                          {(formatters[col.format] || formatters.default)(entity[col.accessor] || col.default || '')}
                        </td>
                      ))}
                      <td className={styles.colAccion}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <FaEye
                            className={styles.eyeIcon}
                            onClick={() => handleActivate(entity[config.idField], entity[config.nameField])}
                            style={{ pointerEvents: isReactivating ? 'none' : 'auto', opacity: isReactivating ? 0.5 : 1 }}
                            title={`Reactivar ${config.entityName}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  !isLoading && <tr><td colSpan={config.inactiveViewColumns.length + 1} className="text-center">No hay {config.entityNamePlural.toLowerCase()} desactivados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="button" className={`btn btn-outline-dark ${styles.backButton}`} onClick={handleBack}>
            <BsArrowLeft style={{fontSize: '1.5rem', marginRight: '0.7rem'}} /> Regresar
          </button>
        </section>
      </ViewContainer>
    </>
  );
};

export default InactiveEntityListView;