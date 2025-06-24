import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import styles from '../../styles/sales/NewSale.module.css';
import Swal from 'sweetalert2';
import makeAnimated from 'react-select/animated';
import { SaleService } from '../../services/sales/SaleService';
import { useProductService } from '../../services/inventory/useProductService';
import { useParams } from 'react-router-dom';
import { useCustomerService } from '../../services/sales/customerService';
import { useNavigate } from 'react-router-dom';


const animatedComponents = makeAnimated();

export default function NewSale() {
  const { createSale, createSaleDetail } = SaleService();
  const { getActiveProducts } = useProductService();
  const { getCustomerById } = useCustomerService();
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [documento, setDocumento] = useState({ numero: '', descripcion: '', tipo: 'Producto' });
  const [nombreServicio, setNombreServicio] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [aplicarImpuesto, setAplicarImpuesto] = useState(true);
  const [lines, setLines] = useState([]);
  const searchWrapperRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    if (clientId) {
      getCustomerById(clientId).then(setClient).catch(console.error);
    }
  }, [clientId]);

  useEffect(() => {
    getActiveProducts().then(products => {
      const formatted = products.map(p => ({
        value: p.idProduct,
        label: p.productName,
        codigo: p.productCode,
        precio: 25,
        idProduct: p.idProduct
      }));
      setProductOptions(formatted);
    });
  }, []);

  useEffect(() => {
    setSelectedProduct(null);
    setNombreServicio('');
    setCantidad(1);
    setAplicarImpuesto(true);
  }, [documento.tipo]);

  const handleAddLine = () => {
    if (documento.tipo === 'Producto' && selectedProduct) {
      setLines([...lines, {
        tipo: 'Producto',
        idProduct: selectedProduct.idProduct || selectedProduct.value,
        nombre: selectedProduct.label,
        codigo: selectedProduct.codigo,
        cantidad,
        precio: selectedProduct.precio,
        impuesto: aplicarImpuesto
      }]);
    } else if (documento.tipo === 'Servicio' && nombreServicio.trim()) {
      setLines([...lines, {
        tipo: 'Servicio', nombre: nombreServicio, codigo: '', cantidad,
        precio: selectedProduct?.precio || 0, impuesto: aplicarImpuesto
      }]);
    }
    setSelectedProduct(null);
    setNombreServicio('');
    setCantidad(1);
    setAplicarImpuesto(true);
  };

  const handleSubmitSale = async () => {
    try {
      const totalAmount = lines.reduce((sum, l) => {
        const sub = l.cantidad * l.precio;
        return sum + sub + (l.impuesto ? sub * 0.13 : 0);
      }, 0);

      const saleData = {
        customer: { clientId: parseInt(clientId) },
        documentNumber: documento.numero.trim(),
        saleStatus: "PENDIENTE",
        issueDate: new Date().toISOString(),
        saleType: "CONTADO",
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        saleDate: new Date().toISOString(),
        saleDescription: documento.descripcion.trim(),
        moduleType: "Ventas"
      };

      const savedSale = await createSale(saleData);
      const saleId = savedSale.saleId;

      const detailPromises = lines.map(line => {
        const subtotal = line.cantidad * line.precio;
        return createSaleDetail(saleId, line.tipo === 'Producto'
          ? { product: { idProduct: line.idProduct }, quantity: line.cantidad, unitPrice: line.precio, subtotal }
          : { serviceName: line.nombre, quantity: line.cantidad, unitPrice: line.precio, subtotal });
      });

      await Promise.all(detailPromises);
Swal.fire({
  icon: 'success',
  title: 'Venta registrada',
  text: `Venta #${saleId} registrada con éxito.`,
  confirmButtonColor: '#49207B'
}).then(() => {
  navigate('/ventas/ventas');
});

    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error al registrar', text: 'Ocurrió un error al guardar la venta o los detalles.', confirmButtonColor: '#E2574C' });
    }
  };

  const handleCancel = () => {
  Swal.fire({
    title: '¿Cancelar venta?',
    text: 'Perderás los datos ingresados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No',
    confirmButtonColor: '#E2574C'
  }).then(result => {
    if (result.isConfirmed) {
      navigate('/ventas/ventas');
    }
  });
};

  // Eliminar línea
const handleDeleteLine = (index) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#E2574C'
  }).then(result => {
    if (result.isConfirmed) {
      setLines(lines.filter((_, i) => i !== index));
    }
  });
};

// Editar línea
const handleEditLine = (index) => {
  const line = lines[index];

  if (line.tipo === 'Producto') {
    setDocumento(prev => ({ ...prev, tipo: 'Producto' }));
    setSelectedProduct({
      value: line.idProduct,
      idProduct: line.idProduct,
      label: line.nombre,
      codigo: line.codigo,
      precio: line.precio
    });
  } else {
    setDocumento(prev => ({ ...prev, tipo: 'Servicio' }));
    setNombreServicio(line.nombre);
    setSelectedProduct({ precio: line.precio });
  }

  setCantidad(line.cantidad);
  setAplicarImpuesto(line.impuesto);
  setLines(lines.filter((_, i) => i !== index));
};


  const total = lines.reduce((sum, l) => {
    const sub = l.cantidad * l.precio;
    return sum + sub + (l.impuesto ? sub * 0.13 : 0);
  }, 0);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Nueva Venta</h1>

      {/* Cliente */}
      {client && (
        <section className={styles.card}>
          <h2>Datos del Cliente</h2>
          <div className={styles.grid2}>
            <div><label>Nombre</label><input value={client.customerName || ''} readOnly /></div>
            <div><label>NRC</label><input value={client.ncr || ''} readOnly /></div>
            {client.customerDui && <div><label>DUI</label><input value={client.customerDui} readOnly /></div>}
            {client.customerNit && <div><label>NIT</label><input value={client.customerNit} readOnly /></div>}
            <div><label>Días de Crédito</label><input value={client.creditDay || ''} readOnly /></div>
            <div><label>Correo Electrónico</label><input value={client.email || ''} readOnly /></div>
            <div><label>Teléfono</label><input value={client.phone || ''} readOnly /></div>
            <div><label>Actividad Comercial</label><input value={client.businessActivity || ''} readOnly /></div>
          </div>
        </section>
      )}

      {/* Documento */}
      <section className={styles.card}>
        <div className={styles.grid2}>
          <div>
            <label>N° de Documento</label>
            <input value={documento.numero} onChange={e => setDocumento({ ...documento, numero: e.target.value })} />
          </div>
          <div>
            <label>Descripción</label>
            <textarea rows={3} value={documento.descripcion} onChange={e => setDocumento({ ...documento, descripcion: e.target.value })} />
          </div>
          <div>
            <label>Tipo</label>
            <select value={documento.tipo} onChange={e => setDocumento({ ...documento, tipo: e.target.value })}>
              <option>Producto</option>
              <option>Servicio</option>
            </select>
          </div>
        </div>
      </section>

      {/* Línea de venta */}
      <section className={styles.card}>
        <h2>{documento.tipo === 'Producto' ? 'Buscar Producto' : 'Nombre del Servicio'}</h2>
        <div className={`${styles.grid2} ${styles.lineGrid}`}>
          <div ref={searchWrapperRef} className={styles.searchRow}>
            {documento.tipo === 'Producto' ? (
              <div className={styles.searchWrapper}>
                <Select
                  ref={selectRef}
                  components={animatedComponents}
                  options={productOptions}
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  placeholder="Buscar producto..."
                  classNamePrefix="react-select"
                />
              </div>
            ) : (
              <div>
                <label>Nombre Servicio</label>
                <input
                  type="text"
                  value={nombreServicio}
                  onChange={e => setNombreServicio(e.target.value)}
                />
              </div>
            )}

            <div className={styles.checkbox}>
              <label>Impuesto</label>
              <input
                type="checkbox"
                checked={aplicarImpuesto}
                onChange={e => setAplicarImpuesto(e.target.checked)}
              />
            </div>
            <button className={styles.addBtn} onClick={handleAddLine}>
              <FaPlus /> Añadir
            </button>
          </div>

          {documento.tipo === 'Producto' && (
  <>
    <div><label>Nombre</label><input value={selectedProduct?.label || ''} readOnly /></div>
    <div><label>Código</label><input value={selectedProduct?.codigo || ''} readOnly /></div>
    <div>
      <label>Cantidad</label>
      <input
        type="number"
        inputMode="decimal"
        value={cantidad}
        onChange={e => setCantidad(Number(e.target.value))}
      />
    </div>
    <div>
      <label>Precio Unitario</label>
      <input
        type="number"
        inputMode="decimal"
        value={selectedProduct?.precio || ''}
        onChange={e =>
          setSelectedProduct({ ...selectedProduct, precio: Number(e.target.value) })
        }
      />
    </div>
    <div>
      <label>Subtotal</label>
      <input
        type="text"
        value={(cantidad * (selectedProduct?.precio || 0)).toFixed(2)}
        readOnly
      />
    </div>
  </>
)}

{documento.tipo === 'Servicio' && (
  <>
    <div>
      <label>Cantidad</label>
      <input
        type="number"
        inputMode="decimal"
        value={cantidad}
        onChange={e => setCantidad(Number(e.target.value))}
      />
    </div>
    <div>
      <label>Precio Unitario</label>
      <input
        type="number"
        inputMode="decimal"
        value={selectedProduct?.precio || ''}
        onChange={e =>
          setSelectedProduct({ ...selectedProduct, precio: Number(e.target.value) })
        }
      />
    </div>
    <div>
      <label>Subtotal</label>
      <input
        type="text"
        value={(cantidad * (selectedProduct?.precio || 0)).toFixed(2)}
        readOnly
      />
    </div>
  </>
)}
        </div>
      </section>

      {/* Tabla */}
      <section className={styles.tableSection}>
        <h2>Detalle de la Venta</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Tipo</th><th>Nombre</th><th>Código</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Imp.</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const subtotal = l.cantidad * l.precio;
                return (
                  <tr key={i}>
                    <td>{l.tipo}</td>
                    <td>{l.nombre}</td>
                    <td>{l.codigo}</td>
                    <td>{l.cantidad}</td>
                    <td>{l.precio}</td>
                    <td>{subtotal.toFixed(2)}</td>
                    <td>{l.impuesto ? '✔' : '✘'}</td>
                    <td>
                      <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => handleEditLine(i)}><FaEdit /></button>
                      <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteLine(i)}><FaTrash /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Total */}
      <footer className={styles.footer}>
        <div className={styles.total}><span>Total:</span> <span>${total.toFixed(2)}</span></div>
        <div className={styles.actions}>
          <button className={styles.register} onClick={handleSubmitSale}>Registrar</button>
         <button className={styles.cancel} onClick={handleCancel}>Cancelar</button>


        </div>
      </footer>
    </main>
  );
}
