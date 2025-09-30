import React from 'react';
import Select from 'react-select';
import { FaPlus } from 'react-icons/fa';
import makeAnimated from 'react-select/animated';
// Mantenemos la importación al CSS compartido SÓLO para la clase del botón (.actionButton)
import styles from '../../../../styles/shared/DocumentForm.module.css';

const animatedComponents = makeAnimated();

export const LineItemEditor = ({
  editor,
  productOptions,
  isLoadingProducts
}) => {
  return (
    // Se restaura la estructura y clases originales que controlan el diseño
    <section className="card shadow-sm rounded-4 mb-3 border-0" style={{ background: '#C9C9CE' }}>
      <div className="card-body">
        <h5 className="mb-3">{editor.tipo === 'Producto' ? 'Buscar Producto' : 'Añadir Servicio'}</h5>
        <div className="row align-items-end mb-3 g-3">
          <div className="col-12 col-lg-6 col-xl-5">
            {editor.tipo === 'Producto' ? (
              <Select
                components={animatedComponents}
                options={productOptions}
                value={editor.selectedProduct}
                onChange={editor.setSelectedProduct}
                placeholder="Buscar producto..."
                classNamePrefix="react-select"
                isClearable
                isLoading={isLoadingProducts}
                styles={{ control: base => ({ ...base, borderRadius: '0.5rem', border: '2px solid #49207B', minHeight: 42 })}}
              />
            ) : (
              <>
                <label className="form-label">Nombre Servicio</label>
                <input type="text" className="form-control" value={editor.nombreServicio} onChange={e => editor.setNombreServicio(e.target.value)} />
              </>
            )}
          </div>
            <div className="col-12 col-md-5 col-lg-3 col-xl-3 ms-lg-auto ">
            <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ minHeight: '70px' }}>
              <label className="form-label mb-0 text-center" style={{ width: '100%' }}>Impuesto</label>
              <input type="checkbox" className="form-check-input mt-2" style={{ width: '1.25em', height: '1.25em', display: 'block', margin: '0 auto' }}
                checked={editor.aplicarImpuesto} onChange={e => editor.setAplicarImpuesto(e.target.checked)} />
            </div>
          </div>
          
          {/* Columna del Botón Añadir */}
          <div className="col-12 col-md-7 col-lg-3 col-xl-4 mt-4">
            <div className="d-flex justify-content-center justify-content-xl-end align-items-center" style={{ minHeight: '70px' }}>
            <button className={styles.actionButton} type="button" onClick={editor.handleAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPlus className="me-2"/> Añadir
            </button>
            </div>
          </div>
        </div>
         {/* --- SEGUNDA FILA: Inputs de detalle (Nombre, Cantidad, etc.) --- */}
        <div className="row g-3 mt-2">
          {editor.tipo === 'Producto' && (
            <>
              {/* En XL (escritorio), ocupa 4. En LG (laptop), 12 (fila completa). En MD (tablet), 6 (mitad). */}
              <div className="col-12 col-md-6 col-lg-6 col-xl-4"><label className="form-label fw-bold">Nombre</label><input className="form-control" value={editor.selectedProduct?.label || ''} readOnly /></div>
              {/* En XL, ocupa 2. En otros, se apila. */}
              <div className="col-12 col-md-6 col-lg-6 col-xl-2"><label className="form-label fw-bold">Código</label><input className="form-control" value={editor.selectedProduct?.codigo || ''} readOnly /></div>
            </>
          )}
          {/* Lógica ternaria para las clases, asegurando que el layout siempre sea consistente */}
           <div className={`col-12 col-md-4 col-lg-4 ${editor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}><label className="form-label fw-bold">Cantidad</label><input type="number" className="form-control" min={1} value={editor.cantidad} onChange={e => editor.setCantidad(e.target.value)} /></div>
          <div className={`col-12 col-md-4 col-lg-4 ${editor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}><label className="form-label fw-bold">Precio Unitario</label><input type="number" className="form-control" min={0} value={editor.precio} onChange={e => editor.setPrecio(e.target.value)} /></div>
          <div className={`col-12 col-md-4 col-lg-4 ${editor.tipo === 'Producto' ? 'col-xl-2' : 'col-xl-4'}`}><label className="form-label fw-bold">Subtotal</label><input className="form-control" type="text" readOnly value={editor.subtotal} /></div>
        </div>
      </div>
    </section>
  );
};