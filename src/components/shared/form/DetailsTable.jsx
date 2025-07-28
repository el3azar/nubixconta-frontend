import React from 'react';
import styles from '../../../styles/shared/DocumentForm.module.css';

/**
 * Componente de tabla genérico y reutilizable para mostrar listas de detalles.
 * Utiliza el patrón "Render Prop" (`renderRow`) para máxima flexibilidad.
 */
export const DetailsTable = ({ fields, errors, headers, renderRow }) => {
  return (
    <section>
      <h5 className="mb-2">Detalle del Documento</h5>
      <div className={`table-responsive ${styles.detailsTable}`}>
        <table className="table table-bordered align-middle mb-0">
          {/* Cabecera dinámica */}
          <thead>
            <tr>
              {headers.map(header => <th key={header}>{header}</th>)}
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla */}
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center p-3">
                  No hay ítems para mostrar.
                </td>
              </tr>
            ) : (
              // Delega la renderización de cada fila al componente padre
              fields.map((field, index) => renderRow(field, index))
            )}
          </tbody>
        </table>
        
        {/* Manejo de errores */}
        {errors.details && (
          <p className='text-danger small mt-2'>
            {errors.details.message || errors.details.root?.message}
          </p>
        )}
      </div>
    </section>
  );
};