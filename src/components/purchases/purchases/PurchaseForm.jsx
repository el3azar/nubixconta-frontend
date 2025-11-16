import React from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

// Componentes compartidos
import { DocumentCustomerInfo } from '../../shared/form/DocumentCustomerInfo';
import { DocumentTotals } from '../../shared/form/DocumentTotals';
import { DetailsTable } from '../../shared/form/DetailsTable';
import { DocumentHeader } from '../../shared/form/DocumentHeader';
import { Notifier } from '../../../utils/alertUtils';
import styles from '../../../styles/shared/DocumentForm.module.css';
import { useCatalogService } from '../../../services/accounting/CatalogService';

export default function PurchaseForm(props) {
  const {
    title,
    supplier,
    isLoadingSupplier,
    productOptions,
    isLoadingProducts,
    isSaving,
    formLogic,
    onFormSubmit,
    submitButtonText
  } = props;

  const navigate = useNavigate();
  const catalogService = useCatalogService();

  const {
    formMethods,
    fields,
    lineEditor,
    handleEditLine,
    handleDeleteLine
  } = formLogic;
  
  const { register,control, handleSubmit, watch, formState: { errors } } = formMethods;

  const onValidationError = (validationErrors) => {
    console.error('Validación de Zod falló (Compra):', validationErrors);
    Notifier.showError('Formulario Incompleto', 'Por favor, revisa todos los campos marcados en rojo.');
  };

  const handleFormSubmit = async (formData) => {
    const result = await Notifier.confirm({
      title: title.includes('Editar') ? '¿Actualizar Compra?' : '¿Registrar Compra?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: title.includes('Editar') ? 'Sí, actualizar' : 'Sí, registrar'
    });
    if (result.isConfirmed) {
      onFormSubmit(formData);
    }
  };
  
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás toda la información ingresada.',
      confirmButtonText: 'Sí, descartar'
    });
    if (result.isConfirmed) {
      navigate('/compras/compras');
    }
  };

  const loadAccountOptions = async (inputValue) => {
    const accounts = await catalogService.searchCatalogs(inputValue);
    return accounts.map(acc => ({
      value: acc.id,
      label: `${acc.accountCode} - ${acc.accountName}`,
      idCatalog: acc.id,
      codigo: acc.accountCode
    }));
  };

  const tableHeaders = ['Tipo', 'Descripción', 'Código', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Imp.', 'Acciones'];

  const renderPurchaseRow = (field, index) => (
    <tr key={field.id}>
      <td>{field.productId ? 'Producto' : 'Cuenta Contable'}</td>
      <td>{field.lineDescription || field._displayName}</td>
      <td>{field._displayCode || 'N/A'}</td>
      <td>{field.quantity}</td>
      <td>${field.unitPrice.toFixed(2)}</td>
      <td>${field.subtotal.toFixed(2)}</td>
      <td>{field.tax ? '✔' : '✘'}</td>
      <td>
        <button type="button" className={styles.iconBtn}  onClick={() => handleEditLine(index, productOptions)} title="Editar línea"><FaEdit /></button>
        <button type="button" className={styles.iconBtn} onClick={() => handleDeleteLine(index)}><FaTrash /></button>
      </td>
    </tr>
  );

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <DocumentCustomerInfo entity={supplier} isLoading={isLoadingSupplier}  />
      
      <form onSubmit={handleSubmit(handleFormSubmit, onValidationError)}>
        <DocumentHeader register={register} errors={errors} control={control} descriptionFieldName="purchaseDescription" isDateEditable={true} >
           <label className="form-label">Tipo de Ítem</label>
           <select className="form-select" value={lineEditor.tipo} onChange={e => lineEditor.setTipo(e.target.value)}>
             <option value="Producto">Producto</option>
             <option value="Gasto">Cuenta Contable</option>
           </select>
        </DocumentHeader>

        {/* --- INICIO: EDITOR DE LÍNEAS VISUALMENTE CONSISTENTE --- */}
        {/* Esta estructura es un espejo visual del LineItemEditor de Ventas */}
        <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
            <div className="card-body">
                <h5 className="mb-3">{lineEditor.tipo === 'Producto' ? 'Buscar Producto' : 'Buscar Cuenta Contable'}</h5>
                {/* PRIMERA FILA: SELECTORES Y BOTÓN */}
                <div className="row align-items-end mb-3 g-3">
                    <div className="col-12 col-lg-6 col-xl-5">
                        {lineEditor.tipo === 'Producto' ? (
                            <Select
                                options={productOptions}
                                value={lineEditor.selectedProduct}
                                onChange={lineEditor.setSelectedProduct}
                                placeholder="Buscar producto por nombre o código..."
                                isLoading={isLoadingProducts}
                                classNamePrefix="react-select"
                                isClearable
                                styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
                            />
                        ) : (
                            <AsyncSelect
                                key={lineEditor.selectedAccount ? lineEditor.selectedAccount.value : 'async-select'} 
                                cacheOptions
                                defaultOptions
                                loadOptions={loadAccountOptions}
                                value={lineEditor.selectedAccount}
                                onChange={lineEditor.setSelectedAccount}
                                placeholder="Buscar cuenta por nombre o código..."
                                classNamePrefix="react-select"
                                isClearable 
                                styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
                            />
                        )}
                    </div>
                    <div className="col-12 col-md-5 col-lg-3 col-xl-3 ms-lg-auto">
                        <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ minHeight: '70px' }}>
                            <label className="form-label mb-0 text-center" style={{ width: '100%' }}>Impuesto</label>
                            <input type="checkbox" className="form-check-input mt-2" style={{ width: '1.25em', height: '1.25em' }}
                                checked={lineEditor.aplicaImpuesto} onChange={e => lineEditor.setAplicaImpuesto(e.target.checked)} />
                        </div>
                    </div>
                    <div className="col-12 col-md-7 col-lg-3 col-xl-4 mt-4">
                        <div className="d-flex justify-content-center justify-content-xl-end align-items-center" style={{ minHeight: '70px' }}>
                            <button className={styles.actionButton} type="button" onClick={lineEditor.handleAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaPlus className="me-2"/> Añadir
                            </button>
                        </div>
                    </div>
                </div>
                {/* SEGUNDA FILA: INPUTS DE DETALLE */}
               {/* SEGUNDA FILA: INPUTS DE DETALLE - AHORA CON EL LAYOUT MEJORADO */}
                <div className="row g-3 mt-2">
                  
                  {/* --- INICIO DEL CÓDIGO AÑADIDO --- */}
                  {/* Campos extra que aparecen cuando se selecciona un Producto */}
                  {lineEditor.tipo === 'Producto' && (
                    <>
                      <div className="col-12 col-md-6 col-lg-6 col-xl-4">
                        <label className="form-label fw-bold">Nombre Producto</label>
                        <input className="form-control" value={lineEditor.selectedProduct?.label || ''} readOnly />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 col-xl-2">
                        <label className="form-label fw-bold">Código</label>
                        <input className="form-control" value={lineEditor.selectedProduct?.codigo || ''} readOnly />
                      </div>
                    </>
                  )}

                  {/* Campos extra que aparecen cuando se selecciona una Cuenta (Gasto) */}
                  {lineEditor.tipo === 'Gasto' && (
                    <>
                      <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                        <label className="form-label fw-bold">Cuenta Contable</label>
                        {/* Mostramos el 'label' que ya incluye el código y el nombre */}
                        <input className="form-control" value={lineEditor.selectedAccount?.label || ''} readOnly />
                      </div>
                      <div className="col-12 col-md-6 col-lg-2 col-xl-3">
                        <label className="form-label fw-bold">Código Cuenta</label>
                        <input className="form-control" value={lineEditor.selectedAccount?.codigo || ''} readOnly />
                      </div>
                      <div className="col-12 col-md-6 col-lg-5 col-xl-5">
                        <label className="form-label fw-bold">Descripción Específica (Opcional)</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={lineEditor.lineDescription}
                          onChange={e => lineEditor.setLineDescription(e.target.value)}
                          placeholder="Ej: Compra de papelería oficina"
                          maxLength="255"
                        />
                      </div>
                    </>
                  )}
                  {/* --- FIN DEL CÓDIGO AÑADIDO --- */}

                  {/* Campos de Cantidad, Precio y Subtotal (con lógica de clases responsivas) */}
                  <div className={`col-12 col-md-4 col-lg-4 ${lineEditor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}>
                    <label className="form-label fw-bold">Cantidad</label>
                    <input type="number" className="form-control" min={1} value={lineEditor.cantidad} onChange={e => lineEditor.setCantidad(e.target.value)} />
                  </div>
                  <div className={`col-12 col-md-4 col-lg-4 ${lineEditor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}>
                    <label className="form-label fw-bold">Precio Unitario</label>
                    <input type="number" className="form-control" min={0} value={lineEditor.precio} onChange={e => lineEditor.setPrecio(e.target.value)} />
                  </div>
                  <div className={`col-12 col-md-4 col-lg-4 ${lineEditor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}>
                    <label className="form-label fw-bold">Subtotal</label>
                    <input className="form-control" type="text" readOnly value={lineEditor.subtotal} />
                  </div>
                </div>
            </div>
        </section>
        {/* --- FIN: EDITOR DE LÍNEAS VISUALMENTE CONSISTENTE --- */}

        <DetailsTable
          fields={fields}
          errors={errors.purchaseDetails} // Apuntamos al error correcto
          headers={tableHeaders}
          renderRow={renderPurchaseRow}
        />
        
        <DocumentTotals
          watch={watch}
          isSaving={isSaving}
          submitButtonText={submitButtonText}
          onCancel={handleCancel} 
        />
      </form>
    </main>
  );
}