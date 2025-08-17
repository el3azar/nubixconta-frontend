// src/components/administration/UserCompaniesDashboard.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompanyCard from "./CompanyCard";
import Swal from "sweetalert2";
import { getCompaniesByUser } from "../../../services/administration/user/companyByUserIdService";
import formStyles from '../../../styles/sales/CustomerForm.module.css';
const UserCompaniesDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showError = (msg) =>
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });

  useEffect(() => {
    const fetchCompanies = async () => {
      if (userId) {
        setLoading(true);
        const data = await getCompaniesByUser(userId);
        setCompanies(data);
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }
  
  return (
    <div className="container mt-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <h2 className="text-center mb-3 mb-md-0">Empresas Asignadas</h2>
                 <button 
                    className={`${formStyles.registrar} mt-3 mt-md-0 d-grid d-md-block`} 
                    onClick={() => navigate(-1)}
                >
                    Volver a Usuarios
                </button>
            </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {companies.length > 0 ? (
          companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        ) : (
          <div className="col-12 text-center">
            <p>No hay empresas asignadas a este usuario.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCompaniesDashboard;