import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import formStyles from '../../../styles/shared/DocumentForm.module.css';
// Se elimina la importación de 'styles' porque usaremos clases de Bootstrap
// y estilos en línea que ya funcionaban.

export const DocumentHeader = ({ register, errors, children }) => {
  return (
    // Se restaura la estructura y clases originales que controlan el diseño
    <section  className={formStyles.card}>
      <div className="card-body p-0">
      <div className="row g-3 align-items-center">
          {/* Ocupa 12 en móvil, 6 en tablet, 3 en escritorio */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">N° de Documento</label>
            <input className="form-control" {...register('documentNumber')} />
            {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
          </div>
          {/* Ocupa 12 en móvil, 6 en tablet, 4 en escritorio */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label">Descripción</label>
            <TextareaAutosize minRows={1} maxRows={3} {...register('saleDescription')} />
            {errors.saleDescription && <small className='text-danger'>{errors.saleDescription.message}</small>}
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" {...register('issueDate')} readOnly />
            {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
          </div>
          {/* 'children' para el Tipo de Ítem */}
          <div className="col-12 col-md-6 col-lg-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};