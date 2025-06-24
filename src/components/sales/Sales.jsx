import React, { useState, useEffect } from 'react';
import {
  FaSearch, FaPlusCircle, FaEye, FaPen, FaTrashAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../../styles/sales/Sales.module.css';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { SaleService } from '../../services/sales/SaleService';



const Sales = () => {
  const saleService = SaleService();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadAllSales();
  }, []);

  const loadAllSales = async () => {
    try {
      const data = await saleService.getAllSales();  
      setSales(data);
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar las ventas.', 'error');
    }
  };

  const handleSearch = async () => {
    try {
          console.log("Fecha inicio:", startDate);
    console.log("Fecha fin:", endDate);
      if (startDate && endDate) {
        const data = await saleService.searchSalesByDate(startDate, endDate); 
        console.log("Ventas filtradas:", data);
        setSales(data);
      } else {
        loadAllSales();
      }
    } catch (err) {
      Swal.fire('Error', 'Error al filtrar por fechas.', 'error');
    }
  };

  const handleEdit = (id) => {
    console.log('Editar venta', id);
  };

  const handleView = (id) => {
    console.log('Ver venta', id);
  };
const handleDelete = (id) => {
  Swal.fire({
    title: '¿Eliminar venta?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await saleService.deleteSale(id);
        Swal.fire('Eliminada', 'La venta ha sido eliminada.', 'success');
        loadAllSales();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la venta.', 'error');
      }
    }
  });
};

const handleApprove = (id) => {
  Swal.fire({
    title: '¿Aprobar venta?',
    text: 'Confirmar que la venta pasará a estado APLICADA.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aprobar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await saleService.updateSale(id, { saleStatus: "APLICADA" });
        Swal.fire('Aprobada', 'La venta ha sido aprobada.', 'success');
        loadAllSales();
      } catch (error) {
        Swal.fire('Error', 'No se pudo aprobar la venta.', 'error');
      }
    }
  });
};

const handleCancel = (id) => {
  Swal.fire({
    title: '¿Anular venta?',
    text: 'La venta quedará en estado ANULADA.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, anular',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await saleService.updateSale(id, { saleStatus: "ANULADA" });
        Swal.fire('Anulada', 'La venta ha sido anulada.', 'success');
        loadAllSales();
      } catch (error) {
        Swal.fire('Error', 'No se pudo anular la venta.', 'error');
      }
    }
  });
};


  return (
    <main>
      <h2 className="mb-4">Filtrar Ventas</h2>
      <div className={`row align-items-end ${styles.filter}`}>
        <div className="col-auto">
          <label htmlFor="startDate" className="form-label">Inicio:</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <label htmlFor="endDate" className="form-label">Fin:</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className={`btn ${styles.btnbscr}`} onClick={handleSearch}>
            <FaSearch className="me-1" /> Buscar
          </button>
        </div>
      </div>

      <h3 className="mt-4 mb-3">Ventas</h3>
      <div className="col text-end">
       <Link to="/ventas/clientes" className={`btn ${styles.newbtn}`}>
            <FaPlusCircle className="me-1" /> Nuevo
        </Link>
      </div>

      <div className={styles.tableContainer + ' table-responsive'}>
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Correlativo</th>
              <th>N° de Documento</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Cliente</th>
              <th>Días de Crédito</th>
              <th>Descripción</th>
              <th>Total</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr
                key={sale.saleId}
                className={
                  sale.saleStatus === 'APLICADA'
                    ? 'table-success'
                    : sale.saleStatus === 'ANULADA'
                      ? 'table-danger'
                      : ''
                }
              >
                <td>{sale.saleId}</td>
                <td>{sale.documentNumber}</td>
                <td>{sale.issueDate?.substring(0, 10)}</td>
                <td>{sale.saleStatus}</td>
                <td>{sale.customer?.customerName}</td>
                <td>-</td>
                <td>{sale.saleDescription}</td>
                <td>{sale.totalAmount}</td>
                <td className="text-center">
                  <div className={styles.actions}>
                    {sale.saleStatus === 'PENDIENTE' && (
                      <>
                        <FaPen title="Editar" onClick={() => handleEdit(sale.saleId)} />
                        <FaTrashAlt title="Eliminar" onClick={() => handleDelete(sale.saleId)} />
                        <FaCheckCircle title="Aprobar" onClick={() => handleApprove(sale.saleId)} />
                      </>
                    )}
                    {sale.saleStatus === 'APLICADA' && (
                      <>
                        <FaEye title="Ver documento" onClick={() => handleView(sale.saleId)} />
                        <FaTimesCircle title="Anular" onClick={() => handleCancel(sale.saleId)} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Sales;
