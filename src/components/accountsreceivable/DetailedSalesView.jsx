import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

// Hooks (Reutilizamos el hook existente)
import { useAccountsReceivable } from "../../hooks/useAccountsReceivable";
// Components (Importamos todo lo necesario)
import DateRangeFilter from "../../components/accountsreceivable/DateRangeFilter";
import DetailedSalesTable from "../../components/accountsreceivable/DetailedSalesTable";
import RegisterReceivableLiquidacion from "./RegisterReceivableLiquidacion";
import EditReceivableLiquidation from "./EditReceivableLiquidation";
import AccountingEntryModal from "../shared/AccountingEntryModal";
import { Notifier } from "../../utils/alertUtils";

// Styles
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";

const DetailedSalesView = () => {
  // 1. Reutilizamos el hook con toda su lógica
  const { data, isLoading, error, actions } = useAccountsReceivable('summary');

  // 2. Añadimos todos los estados locales para manejar los modales y selecciones
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [accountingEntry, setAccountingEntry] = useState(null);
  const [isAccountingEntryLoading, setIsAccountingEntryLoading] = useState(false);

  // 3. Replicamos las funciones handler para las acciones de la tabla
  const handleSearch = () => {
    actions.searchByDate(startDate, endDate);
  };
  
  const handleEdit = async (id, documentNumber) => {
    try {
      const detail = await actions.getCollectionDetailById(id);
      detail.documentNumber = documentNumber;
      setSelectedDetail(detail);
      setIsEditModalOpen(true);
    } catch (error) {
      Notifier.error(error.message);
    }
  };

  const handleViewAccountingEntry = async (id) => {
    setIsAccountingEntryLoading(true);
    setIsAccountingModalOpen(true);
    try {
        const entryData = await actions.getAccountingEntry(id);
        setAccountingEntry(entryData);
    } catch (error) {
        setAccountingEntry({ error: error.message });
    } finally {
        setIsAccountingEntryLoading(false);
    }
  };

  const closeModalAndRefetch = () => {
    setIsRegisterModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDetail(null);
     setSelectedSale(null)
    actions.refetch();
  };
//FUNCIÓN PARA LIQUIDAR DESDE LA TABLA
  const handleLiquidate = (item) => {
    setSelectedSale(item);
    setIsRegisterModalOpen(true);
  };
  // 4. Creamos el objeto 'tableActions' para pasarlo como prop a la tabla
  const tableActions = {
    onApply: actions.applyItem,
    onEdit: handleEdit,
    onDelete: actions.deleteItem,
    onView: handleViewAccountingEntry,
    onCancel: actions.cancelItem,
    onLiquidate:handleLiquidate,
  };

  return (
    <section className={styles.container}>
      {/* Puedes cambiar el título si lo deseas */}
      <h2 className={styles.titulo}>GESTIÓN DETALLADA DE VENTAS</h2>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
      />

   

      {isLoading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* Pasamos los datos Y las acciones a la tabla */}
      {!isLoading && !error && <DetailedSalesTable data={data} actions={tableActions} />}

      {/* 5. Replicamos la renderización de todos los modales */}
      {isRegisterModalOpen && (
        <RegisterReceivableLiquidacion
         onClose={closeModalAndRefetch}
         selectedSale={selectedSale} />
      )}

      {isEditModalOpen && selectedDetail && (
        <EditReceivableLiquidation
          collectionDetail={selectedDetail}
          onClose={closeModalAndRefetch}
        />
      )}

      <AccountingEntryModal
        show={isAccountingModalOpen}
        onHide={() => setIsAccountingModalOpen(false)}
        data={accountingEntry}
        isLoading={isAccountingEntryLoading}
        isError={!!accountingEntry?.error}
        error={accountingEntry?.error}
      />
    </section>
  );
};

export default DetailedSalesView;