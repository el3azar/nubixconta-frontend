import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";


//import DateRangeFilter from "../accountsreceivable/DateRangeFilter";
import DetailedsPayableTable from "../../components/accountspayable/DetailedPayableTable";

import { Notifier } from "../../utils/alertUtils";
import SubMenu from "../shared/SubMenu"; 
import {AccountPayableSubMenuLinks} from '../../config/menuConfig';
// Styles
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import { useAccountsPayable } from "../../hooks/useAccountsPayable";
import RegisterPayableLiquidacion from "./RegisterPayableLiquidacion";

const DetailedPayableView = () => {
  // 1. Reutilizamos el hook con toda su lógica
  const { data, isLoading, error, actions } = useAccountsPayable('summary');

  // 2. Añadimos todos los estados locales para manejar los modales y selecciones
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [ selectedPurchase, setSelectedPurchase] = useState(null);

  const closeModalAndRefetch = () => {
    setIsRegisterModalOpen(false);
     setSelectedPurchase(null)
    actions.refetch();
  };
  

//FUNCIÓN PARA LIQUIDAR DESDE LA TABLA

  const handleLiquidate = (item) => {
    console.log("Item seleccionado para liquidar:", item);
    setSelectedPurchase(item);
    setIsRegisterModalOpen(true);
  };
  
  // 4. Creamos el objeto 'tableActions' para pasarlo como prop a la tabla
  const tableActions = {
    onLiquidate:handleLiquidate,
  };

  return (
    <>
  <SubMenu links={AccountPayableSubMenuLinks}></SubMenu>
    <section className={styles.container}>
      {/* Puedes cambiar el título si lo deseas */}
      <h2 className={styles.titulo}>GESTIÓN DETALLADA DE COMPRAS</h2>

      {isLoading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Pasamos los datos Y las acciones a la tabla */}
      {!isLoading && !error && <DetailedsPayableTable data={data} actions={tableActions} />}

     {/* 5. Replicamos la renderización de todos los modales */}
      {isRegisterModalOpen && (
        <RegisterPayableLiquidacion
         onClose={closeModalAndRefetch}
          selectedPurchase={selectedPurchase} />
      )}

    </section>
    </>
  );
};

export default DetailedPayableView;