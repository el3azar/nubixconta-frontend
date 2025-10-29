// BankTransactionsView.jsx
import React from 'react';
import SubMenu from '../shared/SubMenu';
import { banksSubMenuLinks } from '../../config/menuConfig';
import styles from '../../styles/banks/Banks.module.css';
import { formatDate } from '../../utils/dateFormatter';
import SearchCardBank from './SearchCardBank';
import Boton from '../inventory/inventoryelements/Boton';
import { useNavigate } from "react-router-dom";

// mocks
const mockBankTransactions = [
  { id: 'BTR-001', correlative: 1001, transactionDate: '2025-10-18T00:00:00Z', referenceNumber: 'REF-BANK-54321', description: 'Pago a Proveedor A por mercadería', amount: 4500.50, status: 'PENDIENTE' },
  { id: 'BTR-002', correlative: 1002, transactionDate: '2025-10-19T00:00:00Z', referenceNumber: 'REF-BANK-54322', description: 'Depósito de Cliente Z', amount: 875.25, status: 'APLICADA' },
];

const mockOtherModuleTransactions = [
  { id: 'OMT-001', correlative: 2001, seatNumber: 'ASN-0123', transactionDate: '2025-10-15T00:00:00Z', originModule: 'Inventario', bankAccountName: 'Cuenta Corriente BAC', referenceNumber: 'INV-45678', description: 'Pago de factura de compra', debit: 1200.00, credit: 0.00 },
  { id: 'OMT-002', correlative: 2002, seatNumber: 'ASN-0124', transactionDate: '2025-10-16T00:00:00Z', originModule: 'Ventas', bankAccountName: 'Cuenta Ahorro Banco X', referenceNumber: 'VNT-90123', description: 'Cobro de venta de servicios', debit: 0.00, credit: 350.75 },
];

const BankTransactionsView = ({ apiDataCodigo }) => {
  // filtros / controles
  const [codigoValue, setCodigoValue] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // tablas y estado
  const [transactions, setTransactions] = React.useState(mockBankTransactions);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [activeModule, setActiveModule] = React.useState('ESTE_MODULO');
  const isEsteModulo = activeModule === 'ESTE_MODULO';

  // navegación
  const navigate = useNavigate();
  const handleNew = () => navigate('/bancos/nueva');
  const handleEdit = () => navigate('/bancos/editar/');
  const handleView = (id) => navigate('/bancos/ver/' + id);

  // acciones (simples por ahora)
  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar registro?')) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
    console.log('Eliminado:', id);
  };
  const handleApprove = (id) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'APLICADA' } : t));
    console.log('Aprobado:', id);
  };
  const handleCancel = (id) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'ANULADA' } : t));
    console.log('Anulado:', id);
  };

  // búsqueda (mock o API)
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // simulación
      await new Promise(r => setTimeout(r, 300));
      if (codigoValue === 'TEST') {
        setTransactions(isEsteModulo ? mockBankTransactions : mockOtherModuleTransactions);
      } else {
        // Aquí iría la llamada real a la API (si la necesitas)
        // Por ahora mantenemos el mock si hay algo en codigoValue, o vaciamos
        setTransactions(codigoValue ? (isEsteModulo ? mockBankTransactions : mockOtherModuleTransactions) : []);
      }
    } catch (err) {
      setError('Error al cargar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCodigoValue('');
    setStartDate('');
    setEndDate('');
    setTransactions([]);
  };

  // columnas simples (solo para render)
  const bankColumns = [
    { header: 'Correlativo', key: 'correlative', style: { width: '80px', textAlign: 'center' } },
    { header: 'Fecha', key: 'transactionDate', style: { width: '130px' } },
    { header: 'Referencia', key: 'referenceNumber', style: { width: '130px', textAlign: 'center' } },
    { header: 'Descripción', key: 'description', style: { flex: 1 } },
    { header: 'Estado', key: 'status', style: { width: '100px', textAlign: 'center' } },
    { header: 'Monto', key: 'amount', style: { width: '120px', textAlign: 'right' } },
  ];

  const otherColumns = [
    { header: 'Correlativo', key: 'correlative', style: { width: '80px', textAlign: 'center' } },
    { header: 'No. asiento', key: 'seatNumber', style: { width: '100px', textAlign: 'center' } },
    { header: 'Fecha', key: 'transactionDate', style: { width: '130px' } },
    { header: 'Modulo', key: 'originModule', style: { width: '120px' } },
    { header: 'Cuenta bancaria', key: 'bankAccountName', style: { width: '150px' } },
    { header: 'Referencia', key: 'referenceNumber', style: { width: '130px' } },
    { header: 'Descripcion', key: 'description', style: { flex: 1 } },
    { header: 'Cargo', key: 'debit', style: { width: '100px', textAlign: 'right' } },
    { header: 'Abono', key: 'credit', style: { width: '100px', textAlign: 'right' } },
  ];

  const currentColumns = isEsteModulo ? bankColumns : otherColumns;

  // render dinámico de acciones (dentro del alcance)
  const renderActionsCell = (doc) => {
    // Normalizamos estado
    const estado = (doc.status || '').toString().toUpperCase();
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Si está pendiente -> Aplicar + Eliminar */}
        {estado === 'PENDIENTE' && (
          <>
            <Boton color="verde" title="Aplicar" size="icon" forma="pastilla" onClick={() => handleApprove(doc.id)}>
              <i className="bi bi-check-circle"></i>
            </Boton>
            <Boton color="rojo" title="Eliminar" size="icon" forma="pastilla" onClick={() => handleDelete(doc.id)}>
              <i className="bi bi-trash"></i>
            </Boton>
            <Boton color="morado" title="Editar" size="icon" forma="pastilla" onClick={handleEdit}>
              <i className="bi bi-pencil me-2 mb-2 mt-2 ms-2"></i>
            </Boton>
          </>
        )}
        {/* Si está aplicada -> Anular */}
        {estado === 'APLICADA' && (
          <Boton color="rojo" title="Anular" size="icon" forma="pastilla" onClick={() => handleCancel(doc.id)}>
            <i className="bi bi-x-circle"></i>
          </Boton>
        )}
        {/* Ver detalles siempre */}
        <Boton color="blanco" title="Ver" size="icon" forma="pastilla" onClick={() => handleView(doc.id)}>
          <i className="bi bi-eye"></i>
        </Boton>
      </div>
    );
  };

  // Si quieres mantener DocumentTable para algo, podemos dejarlo; por ahora renderizamos filas manualmente
  return (
    <>
      <div><SubMenu links={banksSubMenuLinks} /></div>
      <div className={styles.title}><h2>Gestión de Transacciones Bancarias</h2></div>

      <SearchCardBank
        apiDataCodigo={apiDataCodigo}
        codigoValue={codigoValue}
        onCodigoChange={setCodigoValue}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        handleSearch={handleSearch}
        handleClear={handleClear}
      />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 mb-3">
        <div className="d-flex gap-2">
          <Boton color={isEsteModulo ? 'morado' : 'blanco'} forma="pastilla" onClick={() => setActiveModule('ESTE_MODULO')}>Este Modulo</Boton>
          <Boton color={!isEsteModulo ? 'morado' : 'blanco'} forma="pastilla" onClick={() => setActiveModule('OTROS_MODULOS')}>Otros Modulos</Boton>
        </div>
        <div className="d-flex gap-2">
          {isEsteModulo && <Boton color="morado" forma="pastilla" onClick={handleNew}><i className="bi bi-plus-circle me-2"></i> Nueva</Boton>}
          {isEsteModulo && <Boton color="blanco" forma="pastilla" onClick={() => console.log('Ordenar por estado')}>Ordenar Por Estado</Boton>}
          <Boton color="blanco" forma="pastilla" onClick={() => console.log('Ordenar por fecha')}>Ordenar Por Fecha</Boton>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {isLoading && <div>Cargando...</div>}

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr className={styles.table_header}>
              {currentColumns.map(col => (
                <th key={col.header} style={col.style}>{col.header}</th>
              ))}
              {/* columna acciones solo si estamos en ESTE_MODULO */}
              {isEsteModulo && <th style={{ width: 140, textAlign: 'center' }}>Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={currentColumns.length + (isEsteModulo ? 1 : 0)} style={{ textAlign: 'center', padding: '1rem' }}>
                  {isLoading ? 'Cargando...' : 'Utilice el filtro de arriba para buscar transacciones.'}
                </td>
              </tr>
            )}

            {transactions.map(doc => (
              <tr key={doc.id}>
                {currentColumns.map(col => {
                  const value = doc[col.key];
                  // Formateos simples: fecha y numeros
                  if (col.key === 'transactionDate') {
                    return <td key={col.key} style={col.style}>{formatDate(value)}</td>;
                  }
                  if (col.key === 'amount' || col.key === 'debit' || col.key === 'credit') {
                    const num = typeof value === 'number' ? value : 0;
                    return <td key={col.key} style={col.style}>${num.toFixed(2)}</td>;
                  }
                  return <td key={col.key} style={col.style}>{value ?? ''}</td>;
                })}

                {isEsteModulo && <td style={{ textAlign: 'center' }}>{renderActionsCell(doc)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BankTransactionsView;
