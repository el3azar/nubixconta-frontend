import React from 'react';

// 1. Importamos el nuevo componente genérico.
import InactiveEntityListView from '../../shared/InactiveEntityListView';

// 2. Importamos la configuración y el servicio.
import { ENTITY_CONFIG } from '../../../config/entityConfig';
import { useSupplierService } from '../../../services/purchases/supplierService';

const DesactivatedSupplier = () => {
  // 3. Obtenemos la config y el servicio para 'supplier'.
  const supplierConfig = ENTITY_CONFIG.supplier;
  const supplierService = useSupplierService();

  // 4. Renderizamos el componente genérico, pasándole las props.
  return (
    <InactiveEntityListView
      config={supplierConfig}
      service={supplierService}
    />
  );
};

export default DesactivatedSupplier;