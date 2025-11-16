// src/config/menuConfig.js

/**
 * Configuraciones centralizadas para los sub-menús de cada módulo.
 * Esto evita la duplicación de las listas de enlaces en múltiples componentes.
 */

export const salesSubMenuLinks = [
  { to: '/ventas/clientes', label: 'Clientes' },
  { to: '/ventas/ventas', label: 'Ventas' },
  { to: '/ventas/notas-credito', label: 'Notas de Crédito' },
  { to: '/ventas/reportes', label: 'Reportes' },
];

export const inventorySubMenuLinks = [
  { to: '/inventario/productos', label: 'Productos' },
  { to: '/inventario/moves', label: 'Movimientos de Inventario' },
  { to: '/inventario/movimientosproductos', label: 'Reportes' },
];


export const AccountReceivableSubMenuLinks = [
  { to: '/cuentas/cobros', label: 'Cobros' },
  { to: '/cuentas/visualizar_ventas', label: 'Visualización de Ventas' },
  { to: '/cuentas/reportes', label: 'Reportes' },
  { to: '/cuentas/estado_cuenta', label: 'Estado de Cuenta' },

];
export const AccountPayableSubMenuLinks = [
  { to: '/cuentas/pagos', label: 'Pagos' },
  { to: '/cuentas/visualizar_pagos', label: 'Visualización de compras' },
  { to: '/cuentas/pagos/reportes', label: 'Reportes' },
  { to: '/cuentas/pagos/estado_cuenta', label: 'Estado de Cuenta' },

];

/**
 * Enlaces para el submenú de navegación del módulo de Compras.
 * Se utilizará en los componentes de vista principal de este módulo.
 */
export const purchasesSubMenuLinks = [
  { to: "/compras/proveedores", label: "Proveedores" },
  { to: "/compras/compras", label: "Compras" },
  { to: "/compras/notas-credito", label: "Notas de Crédito" },
  { to: "/compras/isr", label: "Impuesto sobre la Renta" },
  { to: "/compras/reportes", label: "Reportes" },
];

/**
 * Enlaces para el submenú de navegación del módulo de bancos.
 * Se utilizará en los componentes de vista principal de este módulo.
 */
export const banksSubMenuLinks = [
  { to: "/bancos/transacciones", label: "Transacciones Bancarias" },
  { to: "/bancos/reportes", label: "Reportes" },
];

export const accountingSubMenuLinks = [
  { to: '/contabilidad/gestion-catalogo', label: 'Gestión de Catálogo' },
  { to: '/contabilidad/transacciones', label: 'Transacciones' },
  { to: '/contabilidad/cierres', label: 'Cierre de Períodos' },
  { to: '/contabilidad/estados-financieros', label: 'Estados Financieros' },
];

export const financialStatementsSubMenuLinks = [
  { to: '/contabilidad/estados-financieros/libro-diario', label: 'Libro Diario' },
  { to: '/contabilidad/estados-financieros/libro-mayor', label: 'Libro Mayor' },
  { to: '/contabilidad/estados-financieros/balance-comprobacion', label: 'Balance de Comprobación' },
  { to: '/contabilidad/estados-financieros/estado-resultados', label: 'Estado de Resultados' },
  { to: '/contabilidad/estados-financieros/balance-general', label: 'Balance General' },
];