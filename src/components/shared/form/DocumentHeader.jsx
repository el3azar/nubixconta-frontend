import React from 'react';
import { Controller } from 'react-hook-form'; // 1. Importar el Controller
import TextareaAutosize from 'react-textarea-autosize';
import formStyles from '../../../styles/shared/DocumentForm.module.css';

// 2. Añadir "control" a la lista de props que recibe el componente
export const DocumentHeader = ({ register, control, errors, children, descriptionFieldName,isDateEditable = false }) => {
  return (
    <section className={formStyles.card}>
      <div className="card-body p-0">
        <div className="row g-3 align-items-center">
          
          {/* Este input no da problemas, puede seguir usando register */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">N° de Documento</label>
            <input className="form-control" {...register('documentNumber')} />
            {errors.documentNumber && <small className='text-danger'>{errors.documentNumber.message}</small>}
          </div>
          
          {/* 3. Reemplazar el TextareaAutosize con el Controller */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label">Descripción</label>
            <Controller
              name={descriptionFieldName}
              control={control}
              render={({ field }) => (
                <TextareaAutosize
                  minRows={1}
                  maxRows={3}
                  // El 'field' del Controller ya incluye value, onChange, onBlur y la ref correcta
                  {...field}
                  // Asegúrate de que tenga la clase de CSS para que se vea bien
                  className="form-control" 
                />
              )}
            />
            {errors[descriptionFieldName] && <small className='text-danger'>{errors[descriptionFieldName].message}</small>}
          </div>

          {/* Este input tampoco da problemas */}
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Fecha</label>
            <input className="form-control" type="date" {...register('issueDate')} readOnly={!isDateEditable} />
            {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};