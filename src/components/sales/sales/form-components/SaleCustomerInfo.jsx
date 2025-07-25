import React from 'react';

/**
 * Componente de presentación para mostrar la información del cliente.
 * Es "tonto", solo renderiza los datos que recibe.
 */
export const SaleCustomerInfo = ({ client, isLoading }) => {
  if (isLoading) {
    return <p className="text-center">Cargando cliente...</p>;
  }

  if (!client) {
    return null; // No renderiza nada si no hay cliente
  }

  return (
    <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
      <div className="card-body pb-2">
        <h5 className="mb-3 text-center">Datos del Cliente</h5>
        <div className="row g-3 mb-2">
          <div className="col-md-3"><label className="form-label">Nombre</label><input className="form-control" value={client.customerName || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">NRC</label><input className="form-control" value={client.ncr || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">DUI</label><input className="form-control" value={client.customerDui || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">NIT</label><input className="form-control" value={client.customerNit || ''} readOnly /></div>
        </div>
        <div className="row g-3">
          <div className="col-md-3"><label className="form-label">Días de Crédito</label><input className="form-control" value={client.creditDay || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">Correo Electrónico</label><input className="form-control" value={client.email || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">Teléfono</label><input className="form-control" value={client.phone || ''} readOnly /></div>
          <div className="col-md-3"><label className="form-label">Actividad Comercial</label><input className="form-control" value={client.businessActivity || ''} readOnly /></div>
        </div>
      </div>
    </section>
  );
};