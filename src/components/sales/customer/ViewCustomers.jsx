import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlusCircle, FaEyeSlash } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import styles from "../../../styles/sales/ViewCustomers.module.css";
import { useCustomerService } from "../../../services/sales/customerService";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notifier } from "../../../utils/alertUtils"; 
import { IMaskInput } from 'react-imask';
import SubMenu from "../../shared/SubMenu"; 
import ViewContainer from "../../shared/ViewContainer"; 
import CreditNoteIcon from "../../../assets/icons/credit-note.svg?react";
import CreateSaleIcon from "../../../assets/icons/create-sale.svg?react";
import { salesSubMenuLinks } from '../../../config/menuConfig';

const ViewCustomers = () => {
  // --- LÓGICA NUEVA ---
  const { searchCustomers, desactivateCustomer } = useCustomerService();
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control,reset } = useForm();

    // Variable computada para saber si hay filtros activos. No necesita ser un estado.
  const areFiltersActive = Object.keys(filters).length > 0;


  // useQuery reemplaza tu useEffect y useState para la lista de clientes
  const { data: customers = [], isLoading, isError, error } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => searchCustomers(filters),
     // --- INICIO DE LA ALERTA RECOMENDADA ---
    onError: (err) => {
      // Si la carga inicial falla, muestra un toast de error.
      Notifier.error(err.response?.data?.message || 'No se pudieron cargar los clientes.');
    }
  // --- FIN DE LA ALERTA RECOMENDADA ---
  });

  // useMutation para la acción de desactivar
  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: desactivateCustomer,
    onSuccess: () => {
      // Usamos el toast de éxito estándar (morado).
      Notifier.success('El cliente ha sido desactivado con éxito.');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      Notifier.error('Error', err.response?.data?.message || 'No se pudo desactivar el cliente.');
    }
  });

  // El nuevo onSubmit para la búsqueda, solo actualiza el estado de los filtros
   const onSearch = (data) => {
    // Filtramos para no enviar llaves con valores vacíos
    const activeFilters = Object.fromEntries(Object.entries(data).filter(([_, v]) => v && String(v).trim() !== ''));
    setFilters(activeFilters);
  };
  // --- CAMBIO: Función única para limpiar y mostrar todos ---
  // Tanto "Mostrar Todos" como "Limpiar Filtros" harán lo mismo.
  const handleClearAndShowAll = () => {
    reset({ name: '', lastName: '', dui: '', nit: '' }); // Limpia los campos del formulario.
    setFilters({}); // Resetea el estado de los filtros, recargando la tabla.
  };
  // --- CAMBIO TERMINA ---

// --- ¡CAMBIO IMPORTANTE! ---
  // 4. Reemplazamos la confirmación con nuestro Notifier.
  const handleDeactivate = async (id, name) => {
    const result = await Notifier.confirm({
      title: `¿Desactivar a ${name}?`,
      text: "Esta acción marcará al cliente como inactivo.",
      confirmButtonText: 'Sí, desactivar'
    });
    
    if (result.isConfirmed) {
      deactivate(id);
    }
  };

  //funcion que le agrega el guio al telefono
   function formatPhone(phone) {
    if (!phone) return "-";
    return phone.length === 8 ? `${phone.slice(0, 4)}-${phone.slice(4)}` : phone;
  }

  // --- JSX (TU DISEÑO ORIGINAL INTACTO) ---
  return (
   
    <div>
      <SubMenu links={salesSubMenuLinks} />

      <ViewContainer title="Gestión de Clientes">
      
        <section className={styles.mainWrapper}>

          <section className={`${styles.searchBox} mb-4`}>
            <h5 className="fw-bold mb-3">Buscar Cliente</h5>
            <form onSubmit={handleSubmit(onSearch)}>
              <h6 className="fw-bold mb-4">Criterios de Búsqueda:</h6>
              <div className="row mb-3">
                <div className="col-12 col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Nombre:</label><input type="text" className="form-control" {...register("name")} /></div>
                <div className="col-12 col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Apellido:</label><input type="text" className="form-control" {...register("lastName")} /></div>
                <div className="col-12 col-md-6 col-lg-6 mb-3">
                    <label htmlFor="searchDui" className="form-label fw-bold text-black">DUI:</label>
                    <Controller
                      name="dui"
                      control={control}
                      // 1. Desestructuramos field para tener más control
                      render={({ field: { onChange, onBlur, value } }) => ( 
                        <IMaskInput
                          id="searchDui"
                          mask="00000000-0"
                          className="form-control"
                          placeholder="########-#"
                          value={value || ''}
                          onBlur={onBlur}
                          // 2. Usamos onAccept para garantizar que el valor con máscara se pase al estado
                          onAccept={(acceptedValue) => onChange(acceptedValue)}
                        />
                      )}
                    />
                  </div>
                {/* --- CAMBIO INICIA: CAMPO DE BÚSQUEDA NIT CON MÁSCARA --- */}
                {/* Se ha aplicado la misma máscara que en el formulario de creación/edición */}
                {/* para mantener la consistencia en la experiencia del usuario. */}
                <div className="col-12 col-md-6 col-lg-6 mb-4">
                  <label htmlFor="searchNit" className="form-label fw-bold text-black">NIT:</label>
                  <Controller name="nit" control={control} render={({ field: { onChange, onBlur, value } }) => (
                      <IMaskInput id="searchNit" mask="0000-000000-000-0" className="form-control" placeholder="####-######-###-#" value={value || ''} onBlur={onBlur} onAccept={(acceptedValue) => onChange(acceptedValue)} />
                  )}/>
                </div>
                {/* --- CAMBIO TERMINA --- */}
              </div>
              {/* --- CAMBIO INICIA: LÓGICA DE TRES BOTONES --- */}
              <div className="row">
                <div className="col-12 d-flex justify-content-center flex-wrap gap-3">
                  
                  {/* 1. Botón "Buscar", siempre visible */}
                  <button type="submit" className={`btn ${styles.searchBtn} px-4 py-2 d-flex align-items-center justify-content-center gap-2`}>
                    <i className="bi bi-search" />Buscar
                  </button>
                  
                  {/* 2. Botón "Mostrar Todos", siempre visible y sin icono */}
                  <button 
                    type="button" 
                    className={`btn ${styles.searchBtn} px-4 py-2`} // Se quita d-flex y gap para alinear el texto
                    onClick={handleClearAndShowAll}
                  >
                    Mostrar Todos
                  </button>

                  {/* 3. Botón "Limpiar Filtros", solo visible si areFiltersActive es true */}
                  {areFiltersActive && (
                    <button 
                      type="button" 
                      className={`btn ${styles.searchBtn} px-4 py-2 d-flex align-items-center justify-content-center gap-2`}
                      onClick={handleClearAndShowAll}
                    >
                    Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>
              {/* --- CAMBIO TERMINA --- */}
            </form>
          </section>

          <section className={`${styles.tableSection} mb-4`}>
            <div className="row g-3 mb-3 align-items-center">
    
    {/* Columna para el Título */}
    <div className="col-12 col-md-auto">
      <h5 className="fw-bold m-0">Clientes Activos:</h5>
    </div>

    {/* Columna para los Botones, empujada a la derecha en escritorio */}
    <div className="col-12 col-md d-md-flex justify-content-md-end">
      <div className="d-flex flex-column flex-sm-row gap-3">
        <Link to="/ventas/clientes/nuevo" className={styles.actionButton}>
          <FaPlusCircle className="me-2" /> Nuevo
        </Link>
        <Link to="/ventas/clientes/desactivated" className={styles.actionButton}>
          <FaEyeSlash className="me-2" /> Desactivados
        </Link>
      </div>
    </div>

  </div>

            <div className={styles.tableResponsiveWrapper}>
              <table className="table table-bordered align-middle w-100">
                <thead>
                <tr>
                  <th className={styles.colNombre}>Nombre</th>
                  <th className={styles.colApellido}>Apellido</th>
                  <th className={styles.colDui}>DUI</th>
                  <th className={styles.colNit}>NIT</th>
                  <th className={styles.colDireccion}>Dirección</th>
                  <th className={styles.colCorreo}>Correo</th>
                  <th className={styles.colTelefono}>Teléfono</th>
                  <th className={styles.colDias}>Días de Crédito</th>
                  <th className={styles.colLimite}>Límite de Crédito</th>
                  <th className={styles.colAcciones}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan="10" className="text-center">Cargando clientes...</td></tr>}
                  {isError && <tr><td colSpan="10" className="text-center text-danger">Error al cargar datos: {error.message}</td></tr>}
                  {!isLoading && !isError && customers.length > 0 ? (
                    customers.map((cliente) => (
                      <tr key={cliente.clientId}>
                            <td className={styles.colNombre}>{cliente.customerName}</td>
                            <td className={styles.colApellido}>{cliente.customerLastName || "-"}</td>
                            <td className={styles.colDui}>{cliente.customerDui || "-"}</td>
                            <td className={styles.colNit}>{cliente.customerNit || "-"}</td>
                            <td className={styles.colDireccion}>{cliente.address}</td>
                            <td className={styles.colCorreo}>{cliente.email}</td>
                            <td className={styles.colTelefono}>{formatPhone(cliente.phone)}</td>
                            <td className={styles.colDias}>{cliente.creditDay}</td>
                            <td className={styles.colLimite}>${cliente.creditLimit?.toFixed(2)}</td>
                            <td className={styles.colAcciones}>
                            <div className={styles.actionsContainer}>
                              <button className={styles.iconBtn} title="Editar" onClick={() => navigate(`/ventas/clientes/editar/${cliente.clientId}`)}>
                                <i className="bi bi-pencil" />
                              </button>
                              <button className={styles.iconBtn} title="Desactivar" onClick={() => handleDeactivate(cliente.clientId, cliente.customerName)} disabled={isDeactivating}>
                                <i className="bi bi-eye-slash" />
                              </button>
                              <button className={styles.iconBtn} title="Crear Venta" onClick={() => navigate(`/ventas/nueva/${cliente.clientId}`)}>
                                <CreateSaleIcon />
                              </button>
                              <button className={styles.iconBtn} title="Crear Nota de Crédito" onClick={() => navigate(`/ventas/nueva-nota-credito/${cliente.clientId}`)}>
                                <CreditNoteIcon /> 
                              </button>
                            </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    !isLoading && <tr><td colSpan="10" className="text-center">No hay clientes para mostrar.</td></tr>
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

export default ViewCustomers;