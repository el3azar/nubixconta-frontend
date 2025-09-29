// src/config/entityConfig.js

import { customerSchema } from '../schemas/customerSchema';
import { supplierSchema } from '../schemas/supplierSchema';
import { salesSubMenuLinks } from './menuConfig';
import { purchasesSubMenuLinks } from './menuConfig';

export const ENTITY_CONFIG = {
  customer: {
    entityName: 'Cliente',
    entityNamePlural: 'Clientes',
    basePath: '/ventas/clientes',
    newPath: '/ventas/clientes/nuevo',
    inactivePath: '/ventas/clientes/desactivated',
    editPath: (id) => `/ventas/clientes/editar/${id}`,
    schema: customerSchema,
    idField: 'clientId',
    nameField: 'customerName',
    lastNameField: 'customerLastName',
    duiField: 'customerDui',
    nitField: 'customerNit',
    nrcField: 'ncr', 
    phoneField: 'phone',
    // ... otros campos mapeados ...
    queryKey: 'customers',
    subMenuLinks: salesSubMenuLinks,
    
    // CORRECCIÓN: Lista de columnas idéntica a la tabla original de ViewCustomers
    mainViewColumns: [
      { header: 'Nombre', accessor: 'customerName', className: 'colNombre' },
      { header: 'Apellido', accessor: 'customerLastName', className: 'colApellido', default: '-' },
      { header: 'DUI', accessor: 'customerDui', className: 'colDui', default: '-' },
      { header: 'NIT', accessor: 'customerNit', className: 'colNit', default: '-' },
      { header: 'Dirección', accessor: 'address', className: 'colDireccion' },
      { header: 'Correo', accessor: 'email', className: 'colCorreo' }, // <- Lógica Extra: Columna "Correo" añadida
      { header: 'Teléfono', accessor: 'phone', className: 'colTelefono', format: 'phone' },
      { header: 'Días de Crédito', accessor: 'creditDay', className: 'colDias' },
      { header: 'Límite de Crédito', accessor: 'creditLimit', className: 'colLimite', format: 'currency' },
    ],
    // CORRECCIÓN: Columnas de inactivos también replicadas fielmente
    inactiveViewColumns: [
      { header: 'Nombre', accessor: 'customerName', className: 'colNombre' },
      { header: 'Apellido', accessor: 'customerLastName', className: 'colApellido', default: '-' },
      { header: 'DUI', accessor: 'customerDui', className: 'colDui', default: '-' },
      { header: 'NIT', accessor: 'customerNit', className: 'colNit', default: '-' },
      { header: 'Dirección', accessor: 'address', className: 'colDireccion' },
      { header: 'Correo', accessor: 'email', className: 'colCorreo' },
      { header: 'Teléfono', accessor: 'phone', className: 'colTelefono', format: 'phone' },
      { header: 'Días de Crédito', accessor: 'creditDay', className: 'colDias' },
      { header: 'Límite de Crédito', accessor: 'creditLimit', className: 'colLimite', format: 'currency' },
    ]
  },

  supplier: {
    entityName: 'Proveedor',
    entityNamePlural: 'Proveedores',
    basePath: '/compras/proveedores',
    newPath: '/compras/proveedores/nuevo',
    inactivePath: '/compras/proveedores/desactivados',
    editPath: (id) => `/compras/proveedores/editar/${id}`,
    schema: supplierSchema,
    idField: 'idSupplier',
    nameField: 'supplierName',
    lastNameField: 'supplierLastName',
    duiField: 'supplierDui',
    nitField: 'supplierNit',
    nrcField: 'nrc',
    phoneField: 'phone',
    // ... otros campos mapeados ...
    queryKey: 'suppliers',
    subMenuLinks: purchasesSubMenuLinks,
    
    // CORRECCIÓN: Columnas para proveedores replicando la estructura completa
    mainViewColumns: [
      { header: 'Nombre/Razón Social', accessor: 'supplierName', className: 'colNombre' },
      { header: 'Apellido', accessor: 'supplierLastName', className: 'colApellido', default: '-' },
      { header: 'DUI', accessor: 'supplierDui', className: 'colDui', default: '-' },
      { header: 'NIT', accessor: 'supplierNit', className: 'colNit', default: '-' },
      { header: 'Dirección', accessor: 'address', className: 'colDireccion' },
      { header: 'Correo', accessor: 'email', className: 'colCorreo' }, // <- Lógica Extra: Columna "Correo" añadida
      { header: 'Teléfono', accessor: 'phone', className: 'colTelefono', format: 'phone' },
      { header: 'Días de Crédito', accessor: 'creditDay', className: 'colDias' },
      { header: 'Límite de Crédito', accessor: 'creditLimit', className: 'colLimite', format: 'currency' },
    ],
    inactiveViewColumns: [
      { header: 'Nombre/Razón Social', accessor: 'supplierName', className: 'colNombre' },
      { header: 'Apellido', accessor: 'supplierLastName', className: 'colApellido', default: '-' },
      { header: 'DUI', accessor: 'supplierDui', className: 'colDui', default: '-' },
      { header: 'NIT', accessor: 'supplierNit', className: 'colNit', default: '-' },
      { header: 'Dirección', accessor: 'address', className: 'colDireccion' },
      { header: 'Correo', accessor: 'email', className: 'colCorreo' },
      { header: 'Teléfono', accessor: 'phone', className: 'colTelefono', format: 'phone' },
      { header: 'Días de Crédito', accessor: 'creditDay', className: 'colDias' },
      { header: 'Límite de Crédito', accessor: 'creditLimit', className: 'colLimite', format: 'currency' },
    ]
  }
};