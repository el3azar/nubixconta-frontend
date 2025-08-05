import React from 'react';
import styles from '../../../styles/sales/AccountingEntry.module.css';

const AccountingEntry = ({ data }) => {
 
  // Datos simulados (pueden venir como props o de una API)
  const entry = data || {
    companyName: 'Nombre Empresa',
    accountingNumber: '545512213',
    date: '2025-07-22',
    purchaseNumber: '001-2025',
    provider: 'Proveedor XYZ',
    type: 'Compra',
    status: 'Pendiente',
    entries: [
      { code: '210201202', name: 'Proveedores locales', debit: '25.00 USD', credit: '0.00 USD' },
      { code: '210201202', name: 'Proveedores locales', debit: '0.00 USD', credit: '20.00 USD' },
      { code: '210201202', name: 'Proveedores locales', debit: '0.00 USD', credit: '5.00 USD' },
    ],
    totals: { debit: '25.00 USD', credit: '25.00 USD' },
    user: 'Usuario Demo',
    datetime: new Date().toLocaleString()
  };

  return (
    <div className="accounting-view p-4">
      <h2 className="text-center mb-4">{entry.companyName}</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <strong>Asiento contable #:</strong> {entry.accountingNumber}
        </div>
        <div className="col-md-6">
          <strong>Fecha:</strong> {entry.date}
        </div>
      </div>

      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#e6e4eb' }}>
        <p><strong>Compra número:</strong> {entry.purchaseNumber}</p>
        <p><strong>Proveedor:</strong> {entry.provider}</p>
        <p><strong>Tipo:</strong> {entry.type}</p>
        <p><strong>Estado:</strong> {entry.status}</p>
      </div>

      <table className="table table-bordered text-center mb-4">
        <thead className="table-secondary">
          <tr>
            <th>Cod. cuenta</th>
            <th>Nombre cuenta</th>
            <th>Debe</th>
            <th>Haber</th>
          </tr>
        </thead>
        <tbody>
          {entry.entries.map((e, i) => (
            <tr key={i}>
              <td>{e.code}</td>
              <td>{e.name}</td>
              <td>{e.debit}</td>
              <td>{e.credit}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-light">
          <tr>
            <td colSpan="2"><strong>Total</strong></td>
            <td>{entry.totals.debit}</td>
            <td>{entry.totals.credit}</td>
          </tr>
        </tfoot>
      </table>

      <div className="row text-center mb-5">
        <div className="col-md-4">
          <p>Hecho por:<br />F. ______________</p>
        </div>
        <div className="col-md-4">
          <p>Revisado por:<br />F. ______________</p>
        </div>
        <div className="col-md-4">
          <p>Autorizado por:<br />F. ______________</p>
        </div>
      </div>

      <p className="text-end small">
        {entry.user} <br />
        {entry.datetime}
      </p>
    </div>
  );
};

export default AccountingEntry;