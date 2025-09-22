// src/components/shared/EntityListView.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlusCircle, FaEyeSlash } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IMaskInput } from 'react-imask';
import { Notifier } from "../../utils/alertUtils";
import SubMenu from "./SubMenu";
import ViewContainer from "./ViewContainer";
import styles from "../../styles/shared/EntityListView.module.css";

// Iconos (reutilizamos los de ventas)
import CreateSaleIcon from "../../assets/icons/create-sale.svg?react";
import CreditNoteIcon from "../../assets/icons/credit-note.svg?react";

// Helper de formateo de datos
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

const EntityListView = ({ entityType, config, service }) => {
  const { search, desactivate } = service;
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, reset } = useForm();
  const areFiltersActive = Object.keys(filters).length > 0;

  const { data: entities = [], isLoading, isError, error } = useQuery({
    queryKey: [config.queryKey, filters],
    queryFn: () => search(filters),
    onError: (err) => {
      Notifier.error(err.response?.data?.message || `No se pudieron cargar los ${config.entityNamePlural}.`);
    }
  });

  const { mutate: deactivateEntity, isPending: isDeactivating } = useMutation({
    mutationFn: desactivate,
    onSuccess: () => {
      Notifier.success(`El ${config.entityName} ha sido desactivado con éxito.`);
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (err) => {
      Notifier.error('Error', err.response?.data?.message || `No se pudo desactivar el ${config.entityName}.`);
    }
  });

  // Manejadores de eventos (sin cambios)
  const onSearch = (data) => {
    const activeFilters = Object.fromEntries(Object.entries(data).filter(([_, v]) => v && String(v).trim() !== ''));
    setFilters(activeFilters);
  };
  const handleClearAndShowAll = () => {
    reset({ name: '', lastName: '', dui: '', nit: '' });
    setFilters({});
  };
  const handleDeactivate = async (id, name) => {
    const result = await Notifier.confirm({
      title: `¿Desactivar a ${name}?`,
      text: `Esta acción marcará al ${config.entityName} como inactivo.`,
      confirmButtonText: 'Sí, desactivar'
    });
    if (result.isConfirmed) {
      deactivateEntity(id);
    }
  };

  return (
    <div>
      <SubMenu links={config.subMenuLinks} />
      <ViewContainer title={`Gestión de ${config.entityNamePlural}`}>
        {/* El JSX es una réplica exacta de la estructura de ViewCustomers */}
        <section className={styles.mainWrapper}>
          <section className={`${styles.searchBox} mb-4`}>
            <h5 className="fw-bold mb-3">Buscar {config.entityName}</h5>
            <form onSubmit={handleSubmit(onSearch)}>
              {/* Formulario de búsqueda (sin cambios) */}
              <h6 className="fw-bold mb-4">Criterios de Búsqueda:</h6>
              <div className="row mb-3">
                <div className="col-12 col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Nombre:</label><input type="text" className="form-control" {...register("name")} /></div>
                <div className="col-12 col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Apellido:</label><input type="text" className="form-control" {...register("lastName")} /></div>
                <div className="col-12 col-md-6 col-lg-6 mb-3"><label htmlFor="searchDui" className="form-label fw-bold text-black">DUI:</label><Controller name="dui" control={control} render={({ field }) => ( <IMaskInput {...field} id="searchDui" mask="00000000-0" className="form-control" placeholder="########-#" onAccept={(v) => field.onChange(v)} /> )}/></div>
                <div className="col-12 col-md-6 col-lg-6 mb-4"><label htmlFor="searchNit" className="form-label fw-bold text-black">NIT:</label><Controller name="nit" control={control} render={({ field }) => ( <IMaskInput {...field} id="searchNit" mask="0000-000000-000-0" className="form-control" placeholder="####-######-###-#" onAccept={(v) => field.onChange(v)} /> )}/></div>
              </div>
              <div className="row">
                <div className="col-12 d-flex justify-content-center flex-wrap gap-3">
                  <button type="submit" className={`btn ${styles.searchBtn} px-4 py-2 d-flex align-items-center justify-content-center gap-2`}><i className="bi bi-search" />Buscar</button>
                  <button type="button" className={`btn ${styles.searchBtn} px-4 py-2`} onClick={handleClearAndShowAll}>Mostrar Todos</button>
                  {areFiltersActive && (<button type="button" className={`btn ${styles.searchBtn} px-4 py-2 d-flex align-items-center justify-content-center gap-2`} onClick={handleClearAndShowAll}>Limpiar Filtros</button>)}
                </div>
              </div>
            </form>
          </section>

          <section className={`${styles.tableSection} mb-4`}>
            <div className="row g-3 mb-3 align-items-center">
              <div className="col-12 col-md-auto"><h5 className="fw-bold m-0">{config.entityNamePlural} Activos:</h5></div>
              <div className="col-12 col-md d-md-flex justify-content-md-end">
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link to={config.newPath} className={styles.actionButton}><FaPlusCircle className="me-2" /> Nuevo</Link>
                  <Link to={config.inactivePath} className={styles.actionButton}><FaEyeSlash className="me-2" /> Desactivados</Link>
                </div>
              </div>
            </div>

            <div className={styles.tableResponsiveWrapper}>
              <table className="table table-bordered align-middle w-100">
                <thead className={styles.salesTableHeader}>
                  <tr>
                    {/* CORRECCIÓN: Se aplica la clase CSS desde la configuración */}
                    {config.mainViewColumns.map(col => <th key={col.header} className={styles[col.className]}>{col.header}</th>)}
                    <th className={styles.colAcciones}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={config.mainViewColumns.length + 1} className="text-center">Cargando {config.entityNamePlural}...</td></tr>}
                  {isError && <tr><td colSpan={config.mainViewColumns.length + 1} className="text-center text-danger">Error al cargar datos: {error.message}</td></tr>}
                  {!isLoading && entities.length > 0 ? (
                    entities.map((entity) => (
                      <tr key={entity[config.idField]}>
                        {/* CORRECCIÓN: Se aplica la clase CSS desde la configuración */}
                        {config.mainViewColumns.map(col => (
                          <td key={col.accessor} className={styles[col.className]}>
                            {(formatters[col.format] || formatters.default)(entity[col.accessor] || col.default || '')}
                          </td>
                        ))}
                        <td className={styles.colAcciones}>
                          <div className={styles.actionsContainer}>
                            <button className={styles.iconBtn} title="Editar" onClick={() => navigate(config.editPath(entity[config.idField]))}><i className="bi bi-pencil" /></button>
                            <button className={styles.iconBtn} title="Desactivar" onClick={() => handleDeactivate(entity[config.idField], entity[config.nameField])} disabled={isDeactivating}><i className="bi bi-eye-slash" /></button>
                            {entityType === 'customer' && (
                              <>
                                <button className={styles.iconBtn} title="Crear Venta" onClick={() => navigate(`/ventas/nueva/${entity[config.idField]}`)}><CreateSaleIcon /></button>
                                <button className={styles.iconBtn} title="Crear Nota de Crédito" onClick={() => navigate(`/ventas/nueva-nota-credito/${entity[config.idField]}`)}><CreditNoteIcon /></button>
                              </>
                            )}
                             {entityType === 'supplier' && (
                              <>
                                <button className={styles.iconBtn} title="Crear Compra" onClick={() => Notifier.info('Funcionalidad de Crear Compra próximamente.')}><CreateSaleIcon /></button>
                                <button className={styles.iconBtn} title="Crear Nota de Débito" onClick={() => Notifier.info('Funcionalidad de Nota de Débito próximamente.')}><CreditNoteIcon /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    !isLoading && <tr><td colSpan={config.mainViewColumns.length + 1} className="text-center">No hay {config.entityNamePlural} para mostrar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </ViewContainer>
    </div>
  );
};

export default EntityListView;