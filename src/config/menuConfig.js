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
  { to: '/cuentas/cobros', label: 'cobros' },
  {to:'/cuentas/visualizar_ventas', label: 'Visualizacion de ventas'},
  { to: '/cuentas/reportes', label: 'Reporte' },
  { to: '/cuentas/estado_cuenta', label: 'Estado de cuenta' },
  
];
// En el futuro, cuando añadas más módulos, simplemente los agregas aquí:
/*
export const purchasesSubMenuLinks = [
  { to: '/compras/proveedores', label: 'Proveedores' },
  { to: '/compras/ordenes', label: 'Órdenes de Compra' },
];
*/