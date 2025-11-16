// src/components/accounting/accounting-transaction/AccountingTransactionForm.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { Notifier } from '../../../utils/alertUtils';
import { formatCurrency } from '../../../utils/dateFormatter';
import styles from '../../../styles/shared/DocumentForm.module.css';
import { useCatalogService } from '../../../services/accounting/CatalogService';
import { Controller } from 'react-hook-form';

export default function AccountingTransactionForm(props) {
  const { title, isSaving, formLogic, onFormSubmit, submitButtonText } = props;
  const navigate = useNavigate();
  const catalogService = useCatalogService();
  const { formMethods, fields, lineEditor, handleDeleteLine, handleEditLine } = formLogic;
  const { register, handleSubmit, watch, formState: { errors }, control, getValues } = formMethods; // <-- Obtenemos getValues

  // --- CORRECCIÓN 1: Manejador de errores de Zod más claro ---
  const onValidationError = (validationErrors) => {
    console.error('Errores de validación de Zod:', validationErrors);
    // Zod ya marca los campos en rojo. Solo necesitamos una alerta genérica.
    Notifier.warning('Formulario Incompleto', 'Por favor, corrija los errores marcados en rojo.');
  };

  const handleCancel = () => navigate('/contabilidad/transacciones');

  // --- CORRECCIÓN 2: Lógica de validación movida al manejador de envío ---
  const handleFormSubmit = async (formData) => {
    // Obtenemos los valores más recientes DIRECTAMENTE del formulario
    const { totalDebe, totalHaber, entries } = getValues();

    // VALIDACIÓN 1: ¿Hay al menos dos líneas? (Refuerza la regla de Zod con un mensaje claro)
    if (entries.length < 2) {
      Notifier.warning('Partida Incompleta', 'Una transacción debe tener al menos dos líneas.');
      return; // Detiene el envío
    }

    // VALIDACIÓN 2: ¿La partida está cuadrada?
    // Usamos una pequeña tolerancia para evitar problemas con decimales de punto flotante
    if (Math.abs(totalDebe - totalHaber) > 0.001) {
      Notifier.error('Partida Descuadrada', `Los totales no coinciden. Debe: ${formatCurrency(totalDebe)}, Haber: ${formatCurrency(totalHaber)}.`);
      return; // Detiene el envío
    }

    // VALIDACIÓN 3: ¿La partida está en ceros?
    if (totalDebe === 0 && totalHaber === 0) {
      Notifier.warning('Partida Vacía', 'La transacción no puede tener un valor total de cero.');
      return; // Detiene el envío
    }

    // Si todas las validaciones pasan, mostramos la confirmación
    const result = await Notifier.confirm({
      title: title.includes('Editar') ? '¿Actualizar Transacción?' : '¿Registrar Transacción?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: title.includes('Editar') ? 'Sí, actualizar' : 'Sí, registrar',
    });

    if (result.isConfirmed) {
      onFormSubmit(formData);
    }
  };
  
  const loadAccountOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const accounts = await catalogService.searchCatalogs(inputValue);
      return accounts.map(acc => ({
        value: acc.id,
        label: `${acc.accountCode} - ${acc.accountName}`,
        id: acc.id,
        code: acc.accountCode,
        name: acc.accountName,
      }));
    } catch (error) {
      console.error("Error buscando cuentas", error);
      return [];
    }
  };

  const tableHeaders = ['Código', 'Cuenta Contable', 'Debe', 'Haber', 'Acciones'];
  const { totalDebe, totalHaber } = watch();
  const isBalanced = Math.abs(totalDebe - totalHaber) < 0.001 && totalDebe > 0;

  const renderRow = (field, index) => (
    <tr key={field.id}>
      <td>{field._accountCode}</td>
      <td className="text-start">{field._accountName}</td>
      <td className="text-end">{formatCurrency(field.debit)}</td>
      <td className="text-end">{formatCurrency(field.credit)}</td>
      <td>
        <button type="button" className={styles.iconBtn} onClick={() => handleEditLine(index)} title="Editar línea"><FaEdit /></button>
        <button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}><FaTrash /></button>
      </td>
    </tr>
  );

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      
      {/* El handleSubmit ahora llama a nuestra función de validación `handleFormSubmit` */}
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
        <section className="card shadow-sm rounded-4 mb-3 border-0">
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">Fecha</label>
                        <input type="date" className={`form-control ${errors.transactionDate ? 'is-invalid' : ''}`} {...register('transactionDate')} />
                        {errors.transactionDate && <div className="invalid-feedback">{errors.transactionDate.message}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold">Concepto / Descripción</label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field} rows="1"
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            style={{ resize: 'none', overflowY: 'hidden' }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                          />
                        )}
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                    </div>
                </div>
            </div>
        </section>

        <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
            <div className="card-body">
                <h5 className="mb-3">Añadir Línea al Asiento</h5>
                <div className="row align-items-end g-3">
                    <div className="col-12 col-lg-6">
                      <label className="form-label">Buscar Cuenta Contable</label>
                     <AsyncSelect
                          key={lineEditor.selectedAccount ? lineEditor.selectedAccount.value : 'async-select-acct'} 
                          cacheOptions defaultOptions
                          loadOptions={loadAccountOptions}
                          value={lineEditor.selectedAccount}
                          onChange={lineEditor.setSelectedAccount}
                          placeholder="Buscar por código o nombre..."
                          classNamePrefix="react-select" isClearable
                          styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
                      />
                    </div>
                     <div className="col-6 col-lg-2">
                        <label className="form-label">Debe</label>
                        <input type="number" step="0.01" className="form-control" value={lineEditor.debit} 
                               onChange={e => { lineEditor.setDebit(e.target.value); if (e.target.value > 0) lineEditor.setCredit(''); }}
                               disabled={!!lineEditor.credit && parseFloat(lineEditor.credit) > 0} placeholder="0.00" />
                    </div>
                    <div className="col-6 col-lg-2">
                        <label className="form-label">Haber</label>
                        <input type="number" step="0.01" className="form-control" value={lineEditor.credit}
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
                        <td className="text-end fw-bold">{formatCurrency(totalDebe)}</td>
                        <td className="text-end fw-bold">{formatCurrency(totalHaber)}</td>
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
        
        <div className={styles.footerActions}>
            <div></div>
            <div className={styles.actionButtonsContainer}>
                <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.actionButton} disabled={isSaving}>
                    {isSaving ? 'Guardando...' : submitButtonText}
                </button>
            </div>
        </div>
      </form>
    </main>
  );
}