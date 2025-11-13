import React from 'react';
import SubMenu from '../../shared/SubMenu';
import ViewContainer from '../../shared/ViewContainer';
import { financialStatementsSubMenuLinks } from '../../../config/menuConfig';

const EstadoResultados = () => {
  return (
    <div>
      <SubMenu links={financialStatementsSubMenuLinks} />
      <ViewContainer>
        <h1 className="text-center">Estado de Resultados</h1>
        <p className="text-center mt-3">
          Componente listo para ser implementado por el equipo de Estados Financieros.
        </p>
      </ViewContainer>
    </div>
  );
};

export default EstadoResultados;