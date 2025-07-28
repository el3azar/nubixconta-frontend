import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlusCircle, FaEyeSlash } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import styles from "../../../styles/sales/ViewCustomers.module.css";
import { useCustomerService } from "../../../services/sales/customerService";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { IMaskInput } from 'react-imask';
import SubMenu from "../SubMenu"; 

const ViewCustomers = () => {
  // --- LÓGICA NUEVA ---
  const { searchCustomers, desactivateCustomer } = useCustomerService();
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control } = useForm();

  // useQuery reemplaza tu useEffect y useState para la lista de clientes
  const { data: customers = [], isLoading, isError, error } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => searchCustomers(filters),
  });

  // useMutation para la acción de desactivar
  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: desactivateCustomer,
    onSuccess: () => {
      Swal.fire('Desactivado', 'El cliente ha sido desactivado con éxito.', 'success');
      // Invalida la query para que TanStack Query vuelva a cargar los datos frescos
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo desactivar el cliente.', 'error');
    }
  });

  // El nuevo onSubmit para la búsqueda, solo actualiza el estado de los filtros
   const onSearch = (data) => {
    // Filtramos para no enviar llaves con valores vacíos
    const activeFilters = Object.fromEntries(Object.entries(data).filter(([_, v]) => v && String(v).trim() !== ''));
    setFilters(activeFilters);
  };

const handleDeactivate = (id, name) => {
    Swal.fire({
      title: `¿Desactivar a ${name}?`,
      text: "Esta acción marcará al cliente como inactivo.",
      icon: 'warning',
      showCancelButton: true,

      // PALETA APLICADA: Botón de confirmación (acción importante/de atención)
      confirmButtonColor: '#7D49CC',
      confirmButtonText: 'Sí, desactivar',

      // PALETA APLICADA: Botón de cancelar (acción secundaria)
      cancelButtonColor: '#8581B0',
      cancelButtonText: 'Cancelar'

    }).then((result) => {
      if (result.isConfirmed) {
        deactivate(id);
      }
    });
  };

  //funcion que le agrega el guio al telefono
   function formatPhone(phone) {
    if (!phone) return "-";
    return phone.length === 8 ? `${phone.slice(0, 4)}-${phone.slice(4)}` : phone;
  }

  // --- JSX (TU DISEÑO ORIGINAL INTACTO) ---
  return (
    <>
    <SubMenu />
 
      
    
    <section className={styles.mainWrapper}>

      <section className={`${styles.searchBox} mb-4`}>
        <h5 className="fw-bold mb-3">Buscar Cliente</h5>
        <form onSubmit={handleSubmit(onSearch)}>
          <h6 className="fw-bold mb-4">Criterios de Búsqueda:</h6>
          <div className="row mb-3">
            <div className="col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Nombre:</label><input type="text" className="form-control" {...register("name")} /></div>
            <div className="col-md-6 col-lg-6 mb-3"><label className="form-label fw-bold text-black">Apellido:</label><input type="text" className="form-control" {...register("lastName")} /></div>
             <div className="col-md-6 col-lg-6 mb-3">
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
            <div className="col-md-6 col-lg-6 mb-4"><label className="form-label fw-bold text-black">NIT:</label><input type="text" className="form-control" {...register("nit")} /></div>
          </div>
          <div className="row">
            <div className="col-12 col-md-4 mx-auto d-flex justify-content-center">
              <button type="submit" className={`btn ${styles.searchBtn} w-75 w-md-auto px-4 py-2 d-flex align-items-center justify-content-center gap-2`}>
                <i className="bi bi-search" />Buscar
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className={`${styles.tableSection} mb-4`}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h5 className="fw-bold mb-3 mb-md-0">Clientes:</h5>
          <div className="d-flex gap-3 ">
            <Link to="/ventas/clientes/nuevo"  className={styles.actionButton}><FaPlusCircle className="me-2" /> Nuevo</Link>
            <Link to="/ventas/clientes/desactivated"  className={styles.actionButton}><FaEyeSlash className="me-2" /> Desactivados</Link>
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
                        <div className="d-flex justify-content-center gap-2">
                          <button className={styles.iconBtn} title="Editar" onClick={() => navigate(`/ventas/clientes/editar/${cliente.clientId}`)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className={styles.iconBtn} title="Desactivar" onClick={() => handleDeactivate(cliente.clientId, cliente.customerName)} disabled={isDeactivating}>
                            <i className="bi bi-eye-slash" />
                          </button>
                          <button className={styles.iconBtn} title="Crear Venta" onClick={() => navigate(`/ventas/nueva/${cliente.clientId}`)}>
                            <i className="bi bi-receipt" />
                          </button>
                          <button className={styles.iconBtn} title="Crear Nota de Crédito" onClick={() => navigate(`/ventas/nueva-nota-credito/${cliente.clientId}`)}>
                            <i className="bi bi-file-earmark-text" /> 
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
    
    </>
    
  );
};

export default ViewCustomers;