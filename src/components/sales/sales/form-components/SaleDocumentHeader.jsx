// src/components/sales/form-components/SaleDocumentHeader.jsx
import React from 'react';

/**
 * Componente de presentación para los campos de la cabecera del documento (Venta).
 */
export const SaleDocumentHeader = ({ register, errors, editorTipo, setEditorTipo }) => {
  return (
    <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-3 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">N° de Documento</label>
            <input className="form-control" {...register('documentNumber')} />
            {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
          </div>
          <div className="col-md-4 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">Descripción</label>
            <input className="form-control" {...register('saleDescription')} />
            {errors.saleDescription && <small className='text-danger'>{errors.saleDescription.message}</small>}
          </div>
          <div className="col-md-3 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" {...register('issueDate')} readOnly />
            {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
          </div>
          <div className="col-md-2 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">Tipo de Ítem</label>
            <select className="form-select" value={editorTipo} onChange={e => setEditorTipo(e.target.value)}>
              <option>Producto</option>
              <option>Servicio</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};