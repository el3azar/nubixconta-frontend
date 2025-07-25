import React from 'react';
import Select from 'react-select';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import makeAnimated from 'react-select/animated';
import styles from '../../../styles/sales/SaleForm.module.css'; // Usamos el mismo CSS

const animatedComponents = makeAnimated();

export default function SaleForm({
  // Props de estado y datos
  title,
  client,
  isLoadingClient,
  productOptions,
  isLoadingProducts,
  isSaving,
  
  // Props de React Hook Form
  handleSubmit,
  onFormSubmit,
  register,
  watch,
  errors,
  fields,
  
  // Props para manejar el editor de línea
  editorTipo, setEditorTipo,
  editorSelectedProduct, setEditorSelectedProduct,
  editorNombreServicio, setEditorNombreServicio,
  editorCantidad, setEditorCantidad,
  editorPrecio, setEditorPrecio,
  editorAplicarImpuesto, setEditorAplicarImpuesto,
  
  // Props para los handlers de acciones
  handleAddLine,
  handleEditLine,
  handleDeleteLine,
  handleCancel,
  
  // Texto del botón de envío
  submitButtonText = 'Registrar' 
}) {
  
  return (
    <main className={`${styles.container} container-lg`}>
      <h1 className={`${styles.title} text-center mb-4`}>{title}</h1>

      {isLoadingClient ? <p className="text-center">Cargando cliente...</p> : client && (
        <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
          <div className="card-body pb-2">
            <h5 className="mb-3 text-center">Datos del Cliente</h5>
            <div className="row g-3 mb-2">
              <div className="col-md-3"><label className="form-label">Nombre</label><input className="form-control" value={client.customerName || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">NRC</label><input className="form-control" value={client.ncr || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">DUI</label><input className="form-control" value={client.customerDui || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">NIT</label><input className="form-control" value={client.customerNit || ''} readOnly /></div>
            </div>
            <div className="row g-3">
              <div className="col-md-3"><label className="form-label">Días de Crédito</label><input className="form-control" value={client.creditDay || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">Correo Electrónico</label><input className="form-control" value={client.email || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">Teléfono</label><input className="form-control" value={client.phone || ''} readOnly /></div>
              <div className="col-md-3"><label className="form-label">Actividad Comercial</label><input className="form-control" value={client.businessActivity || ''} readOnly /></div>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)}>
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
                <input className="form-control" type="date" {...register('issueDate')} readOnly/>
                {errors.issueDate && <small className='text-danger'>{errors.issueDate.message}</small>}
              </div>
              <div className="col-md-2 col-sm-6 mb-md-0 mb-2">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={editorTipo} onChange={e => setEditorTipo(e.target.value)}>
                  <option>Producto</option>
                  <option>Servicio</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
          <div className="card-body">
            <h5 className="mb-3">{editorTipo === 'Producto' ? 'Buscar Producto' : 'Servicio'}</h5>
            <div className="row align-items-end mb-3 g-3">
              <div className="col-12 col-md-5">
                {editorTipo === 'Producto' ? (
                  <Select
                    components={animatedComponents} options={productOptions} value={editorSelectedProduct}
                    onChange={setEditorSelectedProduct} placeholder="Buscar producto..."
                    classNamePrefix="react-select" isLoading={isLoadingProducts}
                    styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
                  />
                ) : (
                  <><label className="form-label">Nombre Servicio</label><input type="text" className="form-control" value={editorNombreServicio} onChange={e => setEditorNombreServicio(e.target.value)} /></>
                )}
              </div>
              <div className="col-12 col-md-2 d-flex align-items-center gap-2 justify-content-md-center mt-2 mt-md-0" style={{ minWidth: 120 }}>
                <label className="form-label mb-0">Impuesto</label>
                <input type="checkbox" className="form-check-input mt-0" checked={editorAplicarImpuesto} onChange={e => setEditorAplicarImpuesto(e.target.checked)} />
              </div>
              <div className="col-12 col-md-5 d-flex justify-content-md-end mt-2 mt-md-0">
                 <button className={`${styles.actionButton}`} type="button" onClick={handleAddLine}><FaPlus style={{ marginRight: '8px' }}/> Añadir</button>
              </div>
            </div>
            <div className="row g-3">

               {/* --- RENDERIZADO CONDICIONAL --- */}
  {editorTipo === 'Producto' && (
    <>
      <div className="col-12 col-md-4">
        <label className="form-label fw-bold">Nombre</label>
        <input 
          className="form-control" 
          value={editorSelectedProduct?.label || ''} 
          readOnly 
        />
      </div>
      <div className="col-12 col-md-2">
        <label className="form-label fw-bold">Código</label>
        <input 
          className="form-control" 
          value={editorSelectedProduct?.codigo || ''} 
          readOnly 
        />
      </div>
    </>
  )}
  {/* --- FIN DEL RENDERIZADO CONDICIONAL --- */}

               {/* Los campos de Cantidad, Precio y Subtotal ahora ocupan el espacio restante */}
  <div className={`col-12 ${editorTipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}>
    <label className="form-label fw-bold">Cantidad</label>
    <input 
      type="number" 
      className="form-control" 
      min={1} 
      value={editorCantidad} 
      onChange={e => setEditorCantidad(e.target.value)} 
    />
  </div>
  <div className={`col-12 ${editorTipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}>
    <label className="form-label fw-bold">Precio Unitario</label>
    <input 
      type="number" 
      className="form-control" 
      min={0} 
      value={editorPrecio} 
      onChange={e => setEditorPrecio(e.target.value)} 
    />
  </div>
  <div className={`col-12 ${editorTipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}>
    <label className="form-label fw-bold">Subtotal</label>
    <input 
      className="form-control" 
      type="text" 
      readOnly 
      value={!isNaN(editorCantidad) && !isNaN(editorPrecio) ? (editorCantidad * editorPrecio).toFixed(2) : '0.00'}
    />
  </div>
            </div>
          </div>
        </section>

        <section className="mb-4">
          <h5 className="mb-2">Detalle de la Venta</h5>
          <div className="table-responsive" style={{ background: '#fff', borderRadius: 8 }}>
            <table className={`table table-bordered align-middle mb-0 ${styles.table}`}>
              <thead><tr className={styles.tableHead}><th>Tipo</th><th>Nombre</th><th>Código</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Imp.</th><th>Acciones</th></tr></thead>
              <tbody>
                {fields.map((field, index) => {
                  const nombre = field.productId ? productOptions.find(p => p.value === field.productId)?.label : field.serviceName;
                  const codigo = field.productId ? productOptions.find(p => p.value === field.productId)?.codigo : '';
                  return (
                    <tr key={field.id}>
                      <td>{field.productId ? 'Producto' : 'Servicio'}</td><td>{nombre}</td><td>{codigo}</td><td>{field.quantity}</td>
                      <td>{field.unitPrice.toFixed(2)}</td><td>{field.subtotal.toFixed(2)}</td><td>{field.impuesto ? '✔' : '✘'}</td>
                      <td>
                        <button type="button" className={`${styles.iconBtn} ${styles.editBtn} btn btn-sm me-1`}onClick={() => handleEditLine(index)}><FaEdit /></button>
                        <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn} btn btn-sm`} onClick={() => handleDeleteLine(index)}><FaTrash /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {errors.saleDetails && <p className='text-danger small mt-2'>{errors.saleDetails.message || errors.saleDetails.root?.message}</p>}
          </div>
        </section>

        <div className="d-flex flex-wrap flex-md-nowrap justify-content-end align-items-center mt-4 gap-3">
          <div className={`${styles.total} ms-md-auto`}>
            <span className="fw-normal">Subtotal:</span> <span className="fw-bold">${watch('subtotalAmount').toFixed(2)}</span>
            <span className="fw-normal ms-4">IVA:</span> <span className="fw-bold">${watch('vatAmount').toFixed(2)}</span>
            <span className="fw-normal ms-4">Total:</span> <span className="fw-bold">${watch('totalAmount').toFixed(2)}</span>
          </div>
          <div>
            <button type="submit" className={`${styles.actionButton} me-3`} disabled={isSaving}>
                {isSaving ? 'Guardando...' : submitButtonText}
            </button>
            <button type="button" className={`${styles.actionButton} ${styles.secondary}`} onClick={handleCancel}>
                Cancelar
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}