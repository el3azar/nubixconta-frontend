import React, { useEffect, useState } from "react";
import styles from "../../../styles/administration/AssignCompanyModal.module.css";
import formStyles from '../../../styles/sales/CustomerForm.module.css';
import { FiUserPlus } from 'react-icons/fi';
import { RiUserReceived2Line } from 'react-icons/ri';
import Swal from "sweetalert2";
import { getCompaniesActive } from "../../../services/administration/company/companiesViewServices";
import { assignUserToCompany } from "../../../services/administration/company/assignUserToCompanyService";


const AssignCompanyModal = ({ isOpen, onClose, user, showSuccess, showError, onCompanyAssigned }) => {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompaniesActive();
      const formattedCompanies = data.map(company => ({
        id: company.id,
        name: company.companyName,
        isAssigned: company.userId !== null,
        originalCompany: company
      }));
      setCompanies(formattedCompanies);
    } catch (err) {
      setError("Error al cargar las empresas. Inténtalo de nuevo.");
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e) => setQuery(e.target.value.toLowerCase());
  const handleStatusChange = (e) => setStatusFilter(e.target.value);

  const filteredCompanies = companies.filter((company) => {
    const matchesName = company.name.toLowerCase().includes(query.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === "assigned") {
      matchesStatus = company.isAssigned;
    } else if (statusFilter === "notAssigned") {
      matchesStatus = !company.isAssigned;
    }
    return matchesName && matchesStatus;
  });

  const handleAssignAction = async (company) => {
    const action = company.isAssigned ? "Reasignar" : "Asignar";
    const companyActionText = company.isAssigned ? "Reasignación" : "Asignación";

    const confirm = await Swal.fire({
      title: `¿Deseas ${action.toLowerCase()} esta empresa?`,
      text: `¿Estás seguro que deseas ${action.toLowerCase()} la contabilidad de la empresa "${company.name}" al usuario "${user.userName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${action.toLowerCase()}`,
      cancelButtonText: "Cancelar",
    });

     if (confirm.isConfirmed) {
try {
 // Se realiza la llamada al servicio y se guarda la respuesta
     const response = await assignUserToCompany(company.id, user.id);
     // Verifica que la respuesta sea la esperada antes de mostrar el éxito
     if (response && response.status >= 200 && response.status < 300) {
     showSuccess(`${companyActionText} de empresa realizada correctamente`);
         } else {
             // Si la respuesta no es de éxito pero no generó una excepción
         showError(response.data?.message || `Error en la ${companyActionText.toLowerCase()} de la empresa`);
     }

     await fetchCompanies();
     onCompanyAssigned();
        } catch (err) {
             // Este bloque se ejecuta si la promesa se rechaza (e.g., error de red o HTTP 4xx/5xx)
         showError(err.response?.data?.message || `Error en la ${companyActionText.toLowerCase()} de la empresa`);
        }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.title}>Asignar empresa</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.searchSection}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={query}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.statusDropdown}>
              <span>Estado:</span>
              <select 
                className={styles.statusSelect}
                onChange={handleStatusChange}
                value={statusFilter}
              >
                <option value="all">Todas</option>
                <option value="assigned">Asignadas</option>
                <option value="notAssigned">Sin Asignar</option>
              </select>
            </div>
          </div>
          <table className={styles.companyTable}>
            <thead>
              <tr>
                <th>Nombre de la empresa</th>
                <th className={styles.centerText}>Estado</th>
                <th className={styles.centerActions}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className={styles.centerText}>Cargando empresas...</td></tr>
              ) : error ? (
                <tr><td colSpan="3" className={`${styles.centerText} ${styles.errorMessage}`}>{error}</td></tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td className={styles.centerText}>
                      <span className={company.isAssigned ? styles.assignedText : styles.notAssignedText}>
                        {company.isAssigned ? "Asignada" : "Sin Asignar"}
                      </span>
                    </td>
                    <td className={styles.centerActions}>
                      <button
                        className={styles.actionIcon}
                        title={company.isAssigned ? "Reasignar empresa" : "Asignar empresa"}
                        onClick={() => handleAssignAction(company)}
                      >
                        {company.isAssigned ? <RiUserReceived2Line /> : <FiUserPlus />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className={styles.centerText}>No se encontraron empresas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.modalFooter}>
          <button className={formStyles.cancelar} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCompanyModal;