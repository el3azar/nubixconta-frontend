// src/components/purchases/supplier/ViewSuppliers.jsx

import React from 'react';

// 1. Importamos el nuevo componente genérico.
import EntityListView from '../../shared/EntityListView';

// 2. Importamos la configuración centralizada y el servicio específico de proveedores.
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useSupplierService } from '../../../services/purchases/supplierService';

/**
 * Componente Contenedor para la vista de lista de Proveedores.
 * 
 * Responsabilidades:
 *   - Cargar la configuración específica para 'supplier'.
 *   - Instanciar el hook de servicio para 'supplier'.
 *   - Renderizar el componente genérico 'EntityListView' pasándole
 *     la configuración y el servicio correspondientes.
 */
const ViewSuppliers = () => {
  // Obtenemos la configuración específica para proveedores.
  const supplierConfig = ENTITY_CONFIG.supplier;
  
  // Obtenemos el objeto con todas las funciones del servicio (search, desactivate, etc.).
  const supplierService = useSupplierService();

  // Renderizamos el componente compartido, inyectándole todo lo que necesita.
  return (
    <EntityListView
      entityType="supplier"
      config={supplierConfig}
      service={supplierService}
    />
  );
};

export default ViewSuppliers;