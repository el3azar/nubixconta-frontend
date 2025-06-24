import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import styles from "../../styles/sales/ViewCustomers.module.css";
import { useCustomerService } from "../../services/sales/customerService";
import { useNavigate } from "react-router-dom";

const ViewCustomers = () => {
  const { getAllCustomers, searchCustomers, getInactiveCustomers,desactivateCustomer } = useCustomerService();
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm();

  // Cargar todos al iniciar
  useEffect(() => {
    loadAllCustomers();
  }, []);

  const loadAllCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const onSubmit = async (data) => {
    const hasFilters = Object.values(data).some(value => value && value.trim() !== "");

    try {
      if (hasFilters) {
        const filtered = await searchCustomers(data);
        setCustomers(filtered);
      } else {
        loadAllCustomers();
      }
    } catch (error) {
      console.error("Error al filtrar clientes:", error);
    }
  };

  const handleLoadInactive = async () => {
    try {
      const result = await getInactiveCustomers();
      setCustomers(result);
      reset();
    } catch (error) {
      console.error("Error al cargar desactivados:", error);
    }
  };

  // Mascara DUI
  const handleDuiChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (value.length > 8) {
      value = value.slice(0, 8) + "-" + value.slice(8);
    }
    setValue("dui", value);
  };

  const handleEdit = (id) => {
  navigate(`/ventas/clientes/editar/${id}`);
};

const handleDeactivate = async () => {
   
};

  return (
    <section className={styles.mainWrapper}>
      
      <nav className={`${styles.subnav} mb-4`}>
        <div className="container d-flex justify-content-between flex-wrap">
          <Link to="/ventas/clientes" className={styles.subnavBtn}>Clientes</Link>
          <Link to="/ventas/ventas" className={styles.subnavBtn}>Ventas</Link>
          <Link to="/ventas/nota-credito" className={styles.subnavBtn}>Notas de Crédito</Link>
          <Link to="/ventas/reportes" className={styles.subnavBtn}>Reportes</Link>
        </div>
      </nav>

      <section className={`${styles.searchBox} mb-4`}>
        <h5 className="fw-bold mb-3">Buscar Cliente</h5>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h6 className="fw-bold mb-4">Criterios de Búsqueda:</h6>
          <div className="row mb-3">
            <div className="col-md-6 col-lg-6 mb-3">
              <label className="form-label fw-bold text-black">Nombre:</label>
              <input
                type="text"
                className="form-control"
                {...register("name", {
                  validate: (value) => {
                    const apellido = getValues("lastName");
                    if (value && !apellido) return "Si escribe nombre, debe escribir apellido";
                    return true;
                  },
                })}
              />
            {errors.name && (
              <span className="text-danger">{errors.name.message}</span>
            )}
            </div>
            <div className="col-md-6 col-lg-6 mb-3">
              <label className="form-label fw-bold text-black">Apellido:</label>
              <input
              type="text"
              className="form-control"
              {...register("lastName", {
                validate: (value) => {
                  const nombre = getValues("name");
                  if (value && !nombre) return "Si escribe apellido, debe escribir nombre";
                  return true;
                },
              })}
            />
            {errors.lastName && (
              <span className="text-danger">{errors.lastName.message}</span>
            )}
            </div>
            <div className="col-md-6 col-lg-6 mb-3">
              <label className="form-label fw-bold text-black">DUI:</label>
              <input
                type="text"
                className="form-control"
                placeholder="########-#"
                {...register("dui", {
                  pattern: {
                    value: /^\d{8}-\d$/,
                    message: "Formato inválido (########-#)",
                  },
                })}
                onChange={handleDuiChange}
              />
              {errors.dui && <span className="text-danger">{errors.dui.message}</span>}
            </div>
            <div className="col-md-6 col-lg-6 mb-4">
              <label className="form-label fw-bold text-black">NIT:</label>
              <input type="text" className="form-control" {...register("nit")} />
            </div>
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
          <div className="d-flex gap-2">
            <Link to="/ventas/clientes/nuevo" className={`${styles.searchBtn} btn d-inline-flex align-items-center`}>
            <FaPlusCircle className="me-2" /> Nuevo
            </Link>

           <Link to="/ventas/clientes/desactivated" className={`${styles.searchBtn} btn`}>
            <FaEyeSlash className="me-2" /> Desactivados
          </Link>

          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle w-100">
            <thead>
              <tr className={styles.customHeader}>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DUI</th>
                <th>NIT</th>
                <th>Dirección</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Días de Crédito</th>
                <th>Límite de Crédito</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((cliente) => (
                  <tr key={cliente.clientId}>
                    <td>{cliente.customerName}</td>
                    <td>{cliente.customerLastName}</td>
                    <td>{cliente.customerDui}</td>
                    <td>{cliente.customerNit || "-"}</td>
                    <td>{cliente.address}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.phone}</td>
                    <td>{cliente.creditDay}</td>
                    <td>${cliente.creditLimit?.toFixed(2)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button className={styles.iconBtn} title="Editar" onClick={() => handleEdit(cliente.clientId)}>
                        <i className="bi bi-pencil" /></button>

                        <button className={styles.iconBtn} title="Desactivar" onClick={() => handleDeactivate()}>
                            <i className="bi bi-eye-slash" /></button>
                            

                        <button className={styles.iconBtn}  title="Crear Venta" onClick={() => navigate(`/ventas/nueva/${cliente.clientId}`)}>
                        <i className="bi bi-receipt" /></button>
                        
                        <button className={styles.iconBtn} title="Documentos"><i className="bi bi-receipt" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No hay clientes para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default ViewCustomers;