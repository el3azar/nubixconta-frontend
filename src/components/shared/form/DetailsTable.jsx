import React from 'react';
import styles from '../../../styles/shared/DocumentForm.module.css';

/**
 * Componente de tabla genérico para mostrar detalles.
 * Ahora recibe la porción exacta del objeto de errores que le corresponde.
 */
export const DetailsTable = ({ fields, errors, headers, renderRow }) => {
  return (
    <section>
      <h5 className="mb-2">Detalle del Documento</h5>
      <div className={`table-responsive ${styles.detailsTable}`}>
        <table className="table table-bordered align-middle mb-0">
          <thead>
            <tr>
              {headers.map(header => <th key={header}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center p-3">
                  No hay ítems para mostrar.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => renderRow(field, index))
            )}
          </tbody>
        </table>
        
        {/* CAMBIO CLAVE: Lee el mensaje directamente del objeto 'errors' recibido. */}
        {errors && (
          <p className='text-danger small mt-2'>
            {errors.message || errors.root?.message}
          </p>
        )}
      </div>
    </section>
  );
};