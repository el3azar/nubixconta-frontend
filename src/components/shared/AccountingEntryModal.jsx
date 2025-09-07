import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import AccountingEntry from './AccountingEntry';
import styles from '../../styles/AccountingEntryModal.module.css'; // <-- 1. IMPORTAMOS EL NUEVO CSS MODULE

const AccountingEntryModal = ({ show, onHide, data, isLoading, isError, error }) => {
// --- SOLUCIÓN DEFINITIVA PARA LA IMPRESIÓN (MÉTODO IFRAME) ---
  const handlePrint = () => {
    // 1. Encuentra el contenido que SÍ queremos imprimir.
    const printNode = document.getElementById('printable-accounting-entry');
    if (!printNode) return;

    // 2. Crea un iframe en memoria (no es visible en la página).
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    // 3. Añade el iframe al cuerpo del documento para poder interactuar con él.
    document.body.appendChild(iframe);

    // 4. Escribe el contenido y los estilos en el iframe.
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Imprimir Asiento Contable</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
          <style>
            
            @page { size: A4; margin: 25px; }
            body {
              /* 1. SOLUCIÓN PARA EL MARGEN SUPERIOR */
              /* Añade un espacio extra en la parte superior del cuerpo del documento */
              margin-top: 40px;

              /* 2. SOLUCIÓN PARA LOS COLORES DE FONDO */
              /* Esta es la regla mágica que le dice al navegador: "¡Imprime los colores de fondo!" */
              -webkit-print-color-adjust: exact !important; /* Para Chrome, Safari, Edge */
              color-adjust: exact !important; /* Estándar W3C */
            }
            /* Estas reglas fuerzan a que los fondos de la tabla se impriman correctamente */
            .table-secondary { background-color: #dee2e6 !important; }
            .table-light { background-color: #e9ecef !important; }
            .text-center { text-align: center !important; }
            .text-md-end { text-align: right !important; }
            .text-start { text-align: left !important; }
            .mb-3 { margin-bottom: 1rem !important; }
            .mb-4 { margin-bottom: 1.5rem !important; }
            .my-5 { margin-top: 3rem !important; margin-bottom: 3rem !important; }
            .p-3 { padding: 1rem !important; }
            .p-4 { padding: 1.5rem !important; }
            .rounded { border-radius: 0.25rem !important; }
            .small { font-size: .875em; }

            /* El sistema de rejilla (grid) de Bootstrap, simplificado con Flexbox */
            .row {
              display: flex;
              flex-wrap: wrap;
            }
            .col-md-6 {
              flex: 0 0 50%;
              max-width: 50%;
            }
            .col-md-4 {
              flex: 0 0 33.3333%;
              max-width: 33.3333%;
            }
          </style>
        </head>
        <body>
          ${printNode.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Usamos iframe.onload para asegurar que todo esté listo antes de imprimir
    iframe.onload = function() {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    };
  };

  if (!show) {
    return null;
  }
  // Usamos e.stopPropagation() para que al hacer clic DENTRO del modal, no se cierre.
  return (
    <div className={styles.modalOverlay} onClick={onHide}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onHide}>&times;</button>
        
        {isLoading && (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando datos del asiento...</p>
          </div>
        )}
        {isError && <div className="alert alert-danger m-3">{error.response?.data?.message || error.message}</div>}
        
        {/* El contenido del asiento se renderiza aquí */}
        {data && <AccountingEntry entryData={data} />}

        {/* El pie de página con los botones */}
        <div className={styles.modalFooter}>
          <button onClick={onHide} className={styles.cancelar}>
            Cerrar
          </button>
          {/* Llama a nuestra nueva función de impresión */}
          <button onClick={handlePrint} className={styles.registrar}>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountingEntryModal;