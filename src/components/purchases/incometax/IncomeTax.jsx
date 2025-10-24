// src/components/purchases/incometax/IncomeTax.jsx

import React from 'react';
import { DocumentListView } from '../../shared/DocumentListView';
import { useIncomeTaxService } from '../../../services/purchases/IncomeTaxService';
import { formatDate } from '../../../utils/dateFormatter';
import { DefaultFilterComponent, DefaultActionsComponent } from '../../shared/DocumentViewDefaults';
import SubMenu from '../../shared/SubMenu';
import { purchasesSubMenuLinks } from '../../../config/menuConfig';

// 1. Configuración de las columnas para la tabla de retenciones de ISR
//    Esto le dice a DocumentListView qué mostrar y cómo acceder a los datos.
const columns = [
    {
    header: 'Correlativo',
    accessor: 'idIncomeTax'
},
  { 
    header: 'N° de Documento',
    accessor: 'documentNumber' 
  },
  { 
    header: 'Fecha',
    // Usamos una función 'cell' para formatear la fecha correctamente
    cell: (doc) => formatDate(doc.issueDate) 
  },
  { 
    header: 'Estado',
    accessor: 'incomeTaxStatus' 
  },
  { 
    header: 'Proveedor',
    // Usamos navegación segura para acceder a datos anidados
    cell: (doc) => doc.purchase?.supplier?.supplierName || 'N/A'
  },
  { header: 'Compra Afectada', cell: (doc) => doc.purchase?.documentNumber || 'N/A', style: { minWidth: '150px' } },
  { 
    header: 'Descripción',
    accessor: 'description',
    // Aplicamos un estilo para evitar que la descripción ocupe demasiado espacio
    style: { maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
  },
  { 
    header: 'Monto Retenido',
    cell: (doc) => `$${Number(doc.amountIncomeTax || 0).toFixed(2)}`
  },
];

// 2. Definición de las rutas para los botones de "Nuevo" y "Editar"
const routePaths = {
  new: '/compras/proveedores', // Primero se selecciona un proveedor
  edit: '/compras/isr/editar' // DocumentListView añadirá el /:id automáticamente
};

const IncomeTax = () => {
  // 3. Obtenemos el conjunto de funciones de la API para el ISR
  const incomeTaxService = useIncomeTaxService();

  // --- CAMBIO CLAVE: Implementación del Service Adapter ---
  // Creamos el objeto adaptador que traduce nuestro servicio al lenguaje
  // que el componente genérico DocumentListView entiende.
  const serviceAdapter = {
    getAll: (sortBy) => incomeTaxService.getAll(sortBy),
    search: (filters) => incomeTaxService.search(filters),
    approve: (id) => incomeTaxService.approve(id),
    cancel: (id) => incomeTaxService.cancel(id),
    delete: (id) => incomeTaxService.delete(id),
    // Esta es la función que faltaba para la acción de "Ver Asiento Contable"
    getAccountingEntry: (id) => incomeTaxService.getAccountingEntry(id),
  };

  // 4. Renderizamos el SubMenu y el orquestador principal DocumentListView
  //    Le pasamos toda la configuración que necesita para funcionar.
  return (
    <>
      <SubMenu links={purchasesSubMenuLinks} />
      <DocumentListView
        pageTitle="Gestión de Impuesto Sobre la Renta"
        listTitle="Impuesto Sobre la Renta"
        queryKey="incomeTaxes" // Clave única para react-query
        documentService={serviceAdapter}
        columns={columns}
        routePaths={routePaths}
        newDocumentMessage="Redirigiendo para seleccionar un proveedor..."
        FilterComponent={DefaultFilterComponent} // Reutilizamos el filtro estándar
        ActionsComponent={DefaultActionsComponent} // Reutilizamos las acciones estándar
      />
    </>
  );
};

export default IncomeTax;
