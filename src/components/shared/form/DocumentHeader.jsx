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
        <div className="row g-3 ">
          <div className="col-md-3 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">N° de Documento</label>
            <input className="form-control" {...register('documentNumber')} />
            {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
          </div>
          <div className="col-md-4 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">Descripción</label>
            <TextareaAutosize
              minRows={1} // Empieza con la altura de 1 línea
              maxRows={3} // Crecerá hasta un máximo de 3 líneas para no descontrolar el layout
              placeholder="Añade una descripción"
              {...register('saleDescription')} 
            />
            {errors.saleDescription && <small className='text-danger'>{errors.saleDescription.message}</small>}
          </div>
          <div className="col-md-3 col-sm-6 mb-md-0 mb-2">
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" {...register('issueDate')} readOnly />
            {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
          </div>
          {/* 'children' sigue siendo la ranura para el 'Tipo de Ítem' */}
          {children} 
        </div>
      </div>
    </section>
  );
};