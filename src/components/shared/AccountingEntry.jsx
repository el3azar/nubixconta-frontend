import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateFormatter';
// Ya NO importamos ningún archivo .module.css

const AccountingEntry = ({ entryData }) => {
  const entry = entryData;
  const { company } = useCompany();
  const { user } = useAuth();
  
  // Basado en tu token, 'sub' es el nombre de usuario.
  const username = user?.sub || 'No disponible';
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

   // --- CAMBIO CLAVE: Nueva función para formatear la fecha y hora de auditoría ---
  const formatAuditTimestamp = () => {
    const now = new Date(); // Obtiene la hora local del usuario
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // <-- La magia para el formato AM/PM
    };
    return now.toLocaleString('es-ES', options);
  };

  // Lógica para ordenar las filas: debe primero, luego haber.
  const sortedLines = entry ? [...entry.lines].sort((a, b) => b.debit - a.debit) : [];

  if (!entry) return null;

  // --- DISEÑO ORIGINAL RESTAURADO 100% ---
 return (
    <div  id="printable-accounting-entry" className="accounting-view p-4">

       {/* --- INICIO DEL CAMBIO: Cabecera de Auditoría --- */}
      {/* --- CAMBIO CLAVE: Cabecera de Auditoría a la Izquierda --- */}
      {/* Se cambió la clase 'text-end' por 'text-start' para alinearlo a la izquierda. */}
      <div className="text-start small text-muted mb-3">
        <p className="mb-0" style={{ color: "#000" }}>Usuario: {username}</p>
        <p className="mb-0" style={{ color: "#000" }}>{formatAuditTimestamp()}</p>
      </div>
      {/* --- FIN DEL CAMBIO --- */}


      <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#10031C' }}>
        {company.companyName}
      </h2>

      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mt-3 mb-3">
          <div className="d-flex align-items-center">
            <strong className="me-2">Asiento contable #:</strong>
            <span className="border rounded px-3 py-1 bg-white">{entry.accountingEntryId}</span>
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <span className="border rounded px-3 py-1 bg-white">{formatDate(entry.entryDate)}</span>
        </div>
      </div>

      <div className="p-3 rounded mb-3" style={{ backgroundColor: '#E6E4EB', fontSize: '0.8rem'}}>
        {entry.documentType !== 'CONTABILIDAD' && (
          <p><strong>{entry.documentType} número:</strong> {entry.documentNumber}</p>
        )}
        {entry.partnerName && entry.partnerName !== 'N/A' && (
          <p><strong>{entry.partnerLabel}:</strong> {entry.partnerName}</p>
        )}
        <p><strong>Tipo:</strong> {entry.documentType}</p>
        <p><strong>Descripción:</strong> {entry.description}</p>
        <p><strong>Estado:</strong> {entry.documentStatus}</p>
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
          {sortedLines.map((line, i) => (
            <tr key={i}>
              <td>{line.accountCode}</td>
              <td className="text-start">{line.accountName}</td>
              <td className="text-end">{formatCurrency(line.debit)}</td>
              <td className="text-end">{formatCurrency(line.credit)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="table-light">
          <tr>
            <td colSpan="2" className="text-end"><strong>Total</strong></td>
            <td className="text-end"><strong>{formatCurrency(entry.totalDebits)}</strong></td>
            <td className="text-end"><strong>{formatCurrency(entry.totalCredits)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div className="row text-center my-5">
        <div className="col-md-4 "><p>Hecho por:<br />F. ______________</p></div>
        <div className="col-md-4"><p>Revisado por:<br />F. ______________</p></div>
        <div className="col-md-4"><p>Autorizado por:<br />F. ______________</p></div>
      </div>

      
    </div>
  );
};

export default AccountingEntry;
