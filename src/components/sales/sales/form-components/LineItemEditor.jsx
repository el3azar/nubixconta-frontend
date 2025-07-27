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
          <div className="col-12 col-md-5">
            {editor.tipo === 'Producto' ? (
              <Select
                components={animatedComponents}
                options={productOptions}
                value={editor.selectedProduct}
                onChange={editor.setSelectedProduct}
                placeholder="Buscar producto..."
                classNamePrefix="react-select"
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
          <div className="col-12 col-md-2 d-flex align-items-center gap-2 justify-content-md-center mt-2 mt-md-0" style={{ minWidth: 120 }}>
            <label className="form-label mb-0">Impuesto</label>
            <input type="checkbox" className="form-check-input mt-0" checked={editor.aplicarImpuesto} onChange={e => editor.setAplicarImpuesto(e.target.checked)} />
          </div>
          <div className="col-12 col-md-5 d-flex justify-content-md-end mt-2 mt-md-0">
             <button className={styles.actionButton} type="button" onClick={editor.handleAdd}>
               <FaPlus style={{ marginRight: '8px' }}/> Añadir
             </button>
          </div>
        </div>
        <div className="row g-3">
          {editor.tipo === 'Producto' && (
            <>
              <div className="col-12 col-md-4"><label className="form-label fw-bold">Nombre</label><input className="form-control" value={editor.selectedProduct?.label || ''} readOnly /></div>
              <div className="col-12 col-md-2"><label className="form-label fw-bold">Código</label><input className="form-control" value={editor.selectedProduct?.codigo || ''} readOnly /></div>
            </>
          )}
          <div className={`col-12 ${editor.tipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}><label className="form-label fw-bold">Cantidad</label><input type="number" className="form-control" min={1} value={editor.cantidad} onChange={e => editor.setCantidad(e.target.value)} /></div>
          <div className={`col-12 ${editor.tipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}><label className="form-label fw-bold">Precio Unitario</label><input type="number" className="form-control" min={0} value={editor.precio} onChange={e => editor.setPrecio(e.target.value)} /></div>
          <div className={`col-12 ${editor.tipo === 'Producto' ? 'col-md-2' : 'col-md-4'}`}><label className="form-label fw-bold">Subtotal</label><input className="form-control" type="text" readOnly value={editor.subtotal} /></div>
        </div>
      </div>
    </section>
  );
};