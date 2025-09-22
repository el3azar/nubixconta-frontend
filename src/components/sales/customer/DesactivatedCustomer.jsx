// src/components/sales/customer/DesactivatedCustomer.jsx

import React from 'react';

// 1. Importamos el componente genérico para la lista de inactivos.
import InactiveEntityListView from '../../shared/InactiveEntityListView';

// 2. Importamos la configuración y el servicio específicos para Clientes.
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useCustomerService } from '../../../services/sales/customerService';

/**
 * Componente Contenedor para la vista de lista de Clientes Desactivados.
 * 
 * Refactorizado para utilizar el componente genérico InactiveEntityListView.
 * Su única responsabilidad es cargar la configuración y el servicio para 'customer'
 * y pasárselos al componente compartido.
 */
const DesactivatedCustomer = () => {
  // Obtenemos la configuración y el servicio.
  const customerConfig = ENTITY_CONFIG.customer;
  const customerService = useCustomerService();

  // Renderizamos el componente compartido.
  return (
    <InactiveEntityListView
      config={customerConfig}
      service={customerService}
    />
  );
};

export default DesactivatedCustomer;