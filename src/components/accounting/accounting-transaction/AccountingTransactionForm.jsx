import React from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { DetailsTable } from '../../shared/form/DetailsTable';
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';
import { useCatalogService } from '../../../services/accounting/CatalogService';
import { Controller } from 'react-hook-form';

export default function AccountingTransactionForm(props) {
  const { title, isSaving, formLogic, onFormSubmit, submitButtonText } = props;
  const navigate = useNavigate();
  const catalogService = useCatalogService();
  const { formMethods, fields, lineEditor, handleDeleteLine, handleEditLine } = formLogic;
  const { register, handleSubmit, watch, formState: { errors }, control } = formMethods;

  const onValidationError = (validationErrors) => {
    console.error('Error de validación:', validationErrors);
    const firstError = Object.values(validationErrors)[0];
    const message = firstError.message || (firstError.root && firstError.root.message) || 'Por favor, revise los campos.';
    Notifier.showError('Formulario Incompleto', message);
  };

  // --- INICIO CORRECCIÓN: Alertas de Guardado y Título Dinámico ---
  const handleFormSubmit = async (formData) => {
    // 1. Doble validación de partida cuadrada antes de continuar.
    if (!isBalanced) {
      Notifier.error('La partida está descuadrada. Por favor, revise los totales.');
      return;
    }

    // 2. Título de confirmación dinámico, como en Compras/Ventas.
    const result = await Notifier.confirm({
      title: title.includes('Editar') ? '¿Actualizar Transacción?' : '¿Registrar Transacción?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: title.includes('Editar') ? 'Sí, actualizar' : 'Sí, registrar',
    });
    if (result.isConfirmed) onFormSubmit(formData);
  };
  
  const handleCancel = () => navigate('/contabilidad/transacciones');

 const loadAccountOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const accounts = await catalogService.searchCatalogs(inputValue);
      // Mapeamos usando 'accountCode' y 'accountName' en lugar de 'code' y 'name'.
      return accounts.map(acc => ({
        value: acc.id,
        label: `${acc.accountCode} - ${acc.accountName}`, // <-- CORREGIDO
        id: acc.id,
        code: acc.accountCode, // <-- CORREGIDO y consistente
        name: acc.accountName, // <-- CORREGIDO y consistente
      }));
    } catch (error) {
      console.error("Error buscando cuentas", error);
      return [];
    }
  };

  const tableHeaders = ['Código', 'Cuenta Contable', 'Debe', 'Haber', 'Acciones'];
  const { totalDebe, totalHaber } = watch();
  const isBalanced = totalDebe === totalHaber && totalDebe > 0;

  const renderRow = (field, index) => (
    <tr key={field.id}>
      <td>{field._accountCode}</td>
      <td className="text-start">{field._accountName}</td>
      <td className="text-end">${field.debit.toFixed(2)}</td>
      <td className="text-end">${field.credit.toFixed(2)}</td>
      <td>
        <button type="button" className={styles.iconBtn} onClick={() => handleEditLine(index)} title="Editar línea"><FaEdit /></button>
        <button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}><FaTrash /></button>
      </td>
    </tr>
  );

  return (
    // --- CORRECCIÓN 1: Estructura de Layout principal replicada ---
    // Usamos <main> con la clase .container para el fondo gris claro y el padding.
    <main className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
        {/* TARJETA 1: Cabecera (Fecha y Descripción) */}
        <section className="card shadow-sm rounded-4 mb-3 border-0">
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">Fecha</label>
                        <input type="date" className={`form-control ${errors.transactionDate ? 'is-invalid' : ''}`} {...register('transactionDate')} />
                    </div>
                    {/* CORRECCIÓN 2: Textarea auto-ajustable con Controller */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Concepto / Descripción</label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows="1" // Inicia con una fila
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            style={{ resize: 'none', overflowY: 'hidden' }} // Estilos para el comportamiento
                            // Evento que ajusta la altura dinámicamente
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              const scrollHeight = e.target.scrollHeight;
                              // Limitamos el crecimiento a un aproximado de 3-4 líneas
                              const maxHeight = 120; 
                              e.target.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
                            }}
                          />
                        )}
                      />
                    </div>
                </div>
            </div>
        </section>

        {/* TARJETA 2: Editor de Líneas (con fondo gris oscuro) */}
        <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
            <div className="card-body">
                <h5 className="mb-3">Añadir Línea al Asiento</h5>
                <div className="row align-items-end g-3">
                    <div className="col-12 col-lg-6">
                      <label className="form-label">Buscar Cuenta Contable</label>
                     <AsyncSelect
                          key={lineEditor.selectedAccount ? lineEditor.selectedAccount.value : 'async-select-acct'} 
                          cacheOptions
                          defaultOptions
                          loadOptions={loadAccountOptions}
                          value={lineEditor.selectedAccount}
                          onChange={lineEditor.setSelectedAccount}
                          placeholder="Buscar por código o nombre..."
                          classNamePrefix="react-select"
                          isClearable
                          // Esta prop restaura el estilo redondeado y el borde.
                          styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
                      />
                    </div>
                     <div className="col-6 col-lg-2">
                        <label className="form-label">Debe</label>
                        <input type="number" className="form-control" value={lineEditor.debit} 
                               onChange={e => { lineEditor.setDebit(e.target.value); if (e.target.value > 0) lineEditor.setCredit(''); }}
                               disabled={!!lineEditor.credit && parseFloat(lineEditor.credit) > 0} placeholder="0.00" />
                    </div>
                    <div className="col-6 col-lg-2">
                        <label className="form-label">Haber</label>
                        <input type="number" className="form-control" value={lineEditor.credit}
                               onChange={e => { lineEditor.setCredit(e.target.value); if (e.target.value > 0) lineEditor.setDebit(''); }}
                               disabled={!!lineEditor.debit && parseFloat(lineEditor.debit) > 0} placeholder="0.00" />
                    </div>
                    <div className="col-12 col-lg-2 d-flex justify-content-center justify-content-lg-end">
                        <button className={styles.actionButton} type="button" onClick={lineEditor.handleAdd}>
                            <FaPlus className="me-2"/> Añadir
                        </button>
                    </div>
                </div>
            </div>
        </section>
        
        {/* CORRECCIÓN 3: Tabla de Detalles (una sola tabla) */}
        <h4 className="mt-4 mb-3">Detalle del Documento</h4>
        <div className={styles.detailsTable}>
            <table className="table table-hover align-middle">
                <thead>
                    <tr>
                        {tableHeaders.map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {fields.length === 0 ? (
                        <tr><td colSpan={tableHeaders.length} className="text-center p-4">Aún no se han añadido líneas.</td></tr>
                    ) : (
                        fields.map((field, index) => renderRow(field, index))
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2" className="text-end fw-bold">Totales:</td>
                        <td className="text-end fw-bold">${totalDebe.toFixed(2)}</td>
                        <td className="text-end fw-bold">${totalHaber.toFixed(2)}</td>
                        <td></td>
                    </tr>
                    {fields.length > 0 && (
                        <tr>
                            <td colSpan="5" className={`text-center fw-bold ${isBalanced ? 'text-success' : 'text-danger'}`}>
                                {isBalanced ? 'PARTIDA CUADRADA' : 'PARTIDA DESCUADRADA'}
                            </td>
                        </tr>
                    )}
                </tfoot>
            </table>
        </div>
        
        {/* CORRECCIÓN 4: Botones de Acción con estilo replicado */}
        <div className={styles.footerActions}>
            <div></div> {/* Div vacío para alinear los botones a la derecha */}
            <div className={styles.actionButtonsContainer}>
                <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.actionButton} disabled={isSaving || !isBalanced}>
                    {isSaving ? 'Guardando...' : submitButtonText}
                </button>
            </div>
        </div>
      </form>
    </main>
  );
}