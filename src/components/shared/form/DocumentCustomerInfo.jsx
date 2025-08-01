import React from 'react';
import styles from '../../../styles/shared/DocumentForm.module.css';

export const DocumentCustomerInfo = ({ client, isLoading }) => {
  if (isLoading) {
    return <p className="text-center py-5">Cargando cliente...</p>;
  }
  if (!client) {
    return null;
  }
  return (
    <section className={styles.card}>
      <h5 className="mb-3 text-center">Datos del Cliente</h5>
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label">Nombre</label><input className="form-control" value={client.customerName || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">NRC</label><input className="form-control" value={client.ncr || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">DUI</label><input className="form-control" value={client.customerDui || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">NIT</label><input className="form-control" value={client.customerNit || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">Días de Crédito</label><input className="form-control" value={client.creditDay || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">Correo</label><input className="form-control" value={client.email || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">Teléfono</label><input className="form-control" value={client.phone || ''} readOnly /></div>
        <div className="col-md-3"><label className="form-label">Actividad</label><input className="form-control" value={client.businessActivity || ''} readOnly /></div>
      </div>
    </section>
  );
};