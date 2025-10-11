// src/components/sales/customer/ViewCustomers.jsx

import React from 'react';

// 1. Importamos el componente genérico que hará todo el trabajo.
import EntityListView from '../../shared/EntityListView';

// 2. Importamos la configuración y el servicio específicos para Clientes.
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useCustomerService } from '../../../services/sales/customerService';

/**
 * Componente Contenedor para la vista de lista de Clientes.
 * 
 * Este componente ha sido refactorizado para utilizar el componente genérico
 * EntityListView. Su única responsabilidad es cargar la configuración y el 
 * servicio para 'customer' y pasárselos al componente compartido.
 */
const ViewCustomers = () => {
  // Obtenemos la configuración específica para clientes.
  const customerConfig = ENTITY_CONFIG.customer;
  
  // Obtenemos el objeto con las funciones del servicio (search, desactivate, etc.).
  const customerService = useCustomerService();

  // Renderizamos el componente compartido, inyectándole todo lo que necesita.
  return (
    <EntityListView
      entityType="customer"
      config={customerConfig}
      service={customerService}
    />
  );
};

export default ViewCustomers;