// src/components/administration/CompanyCard.js
import React from 'react';
import { Building, MapPin, Tag, Briefcase, FileText } from 'lucide-react';
import styles from "../../../styles/administration/CompanyCard.module.css"; // Se puede crear un archivo de estilos específico si es necesario

const CompanyCard = ({ company }) => {
  const cardStyle = company.activeStatus ? {} : { backgroundColor: "#ffcccc" }; // Estilo para empresas inactivas

  return (
    <div className="col">
      <div className="card shadow-sm h-100" style={cardStyle}>
        {company.imageUrl && (
          <img
            src={company.imageUrl}
            className={`card-img-top ${styles.companyLogo}`}
            alt={`${company.companyName} logo`}
          />
        )}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
            <Building className="me-2" />
            {company.companyName}
          </h5>
          <p className="card-text mb-1">
            <FileText size={16} className="me-2" />
            NIT: {company.companyNit || 'N/A'}
          </p>
          <p className="card-text mb-1">
            <Tag size={16} className="me-2" />
            NRC: {company.companyNrc || 'N/A'}
          </p>
          <p className="card-text mb-1">
            <MapPin size={16} className="me-2" />
            Dirección: {company.address || 'N/A'}
          </p>
          <p className="card-text mb-1">
            <Briefcase size={16} className="me-2" />
            Giro: {company.turnCompany || 'N/A'}
          </p>
          <p className="card-text mt-auto">
            Estado:{" "}
            <strong className={company.activeStatus ? "text-success" : "text-danger"}>
              {company.activeStatus ? "Activa" : "Inactiva"}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;