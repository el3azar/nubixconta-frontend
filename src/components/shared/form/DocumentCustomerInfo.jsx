import React from 'react';
import styles from '../../../styles/shared/DocumentForm.module.css';

/**
 * Componente genérico para mostrar la información de la entidad (Cliente o Proveedor),
 * manteniendo la estructura y el comportamiento de carga del componente original de Ventas.
 * 
 * @param {object} props
 * @param {object} props.entity - El objeto del cliente o proveedor (puede ser undefined).
 * @param {boolean} props.isLoading - La bandera que indica si los datos se están cargando.
 */
export const DocumentCustomerInfo = ({ entity, isLoading }) => {
  // 1. Estado de carga: Muestra un mensaje simple, idéntico al comportamiento original.
  //    Para hacerlo genérico, el texto cambia según la entidad.
  if (isLoading) {
    // Usamos el layout de la captura de pantalla para el estado de carga, ya que es visualmente mejor.
    return (
      <section className={styles.card}>
        <h5 className="mb-3 text-center">Datos de la Entidad</h5>
        <p className="text-center py-3 m-0">Cargando información...</p>
      </section>
    );
  }

  // 2. Si terminó de cargar y no hay datos, no se renderiza nada.
  if (!entity) {
    return null;
  }

  // 3. Detección del tipo de entidad para mostrar el título y los campos correctos.
  const isSupplier = 'supplierName' in entity;
  const entityType = isSupplier ? 'Proveedor' : 'Cliente';

  return (
    <section className={styles.card}>
      <h5 className="mb-3 text-center">Datos del {entityType}</h5>
      <div className="row g-3">
        {/* Nombre o Razón Social */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <label className="form-label">Nombre</label>
          <input className="form-control" value={isSupplier ? entity.supplierName : entity.customerName || ''} readOnly />
        </div>

        {/* Apellido (solo para Clientes tipo Persona Natural) */}
        {!isSupplier && entity.customerLastName && (
          <div className="col-12 col-md-6 col-lg-4 col-xl-3">
            <label className="form-label">Apellido</label>
            <input className="form-control" value={entity.customerLastName} readOnly />
          </div>
        )}

        {/* NRC */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3"> 
          <label className="form-label">NRC</label>
          <input className="form-control" value={entity.ncr || '' || entity.nrc} readOnly />
        </div>

        {/* DUI (Renderiza si existe en cliente O proveedor) */}
        {(entity.customerDui || entity.supplierDui) && (
          <div className="col-12 col-md-6 col-lg-4 col-xl-3">
            <label className="form-label">DUI</label>
            <input className="form-control" value={isSupplier ? entity.supplierDui : entity.customerDui} readOnly />
          </div>
        )}

        {/* NIT (Renderiza si existe en cliente O proveedor) */}
        {(entity.customerNit || entity.supplierNit) && (
          <div className="col-12 col-md-6 col-lg-4 col-xl-3">
            <label className="form-label">NIT</label>
            <input className="form-control" value={isSupplier ? entity.supplierNit : entity.customerNit} readOnly />
          </div>
        )}

        {/* Días de Crédito */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <label className="form-label">Días de Crédito</label>
          <input className="form-control" value={entity.creditDay || ''} readOnly />
        </div>

        {/* Correo */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <label className="form-label">Correo</label>
          <input className="form-control" value={entity.email || ''} readOnly />
        </div>

        {/* Teléfono */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <label className="form-label">Teléfono</label>
          <input className="form-control" value={entity.phone || ''} readOnly />
        </div>
        
        {/* Actividad Comercial */}
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <label className="form-label">Actividad</label>
          <input className="form-control" value={entity.businessActivity || ''} readOnly />
        </div>
      </div>
    </section>
  );
};