
import React, { useState } from "react";

// Hooks
import { useAccountsPayable } from "../../hooks/useAccountsPayable";

// Components

//import EditReceivableLiquidation from "./EditReceivableLiquidation";
import DateRangeFilter from "../shared/DateRangeFilter";
import SubMenu from "../shared/SubMenu"; 
import {AccountPayableSubMenuLinks } from '../../config/menuConfig';
import {  SortActionsComponent } from '../shared/DocumentViewDefaults';
import AccountingEntryModal from "../shared/AccountingEntryModal";
import { Notifier } from "../../utils/alertUtils";
import RegisterPayableLiquidacion from "./RegisterPayableLiquidacion";
import AccountsPayableTable from "./AccountsPayableTable";
import EditPayableLiquidation from "./EditPayableLiquidation";
// Styles
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import stylesCustomers from "../../styles/shared/EntityListView.module.css";



const AccountsPayable = () => {
  // Hook con la lógica de negocio
  const { data, isLoading, error, actions } = useAccountsPayable('collections');

  // Estados locales para la UI (filtros y modales)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // estado para controlar la selección de ordenamiento
  const [sortBy, setSortBy] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  
  const [selectedPayable, setSelectedPayable] = useState(null);
  const [accountingEntry, setAccountingEntry] = useState(null);
  const [isAccountingEntryLoading, setIsAccountingEntryLoading] = useState(false);


  const handleSearch = () => {
    actions.filterByDateRange(startDate, endDate);
    setSortBy(null);
  };

  const handleSort = (type) => {
        setSortBy(type);
        if (type === 'status') {
            actions.sortByStatus();
        } else if (type === 'date') {
            actions.sortByDate();
        }
    };

  const handleEdit = async (id, documentNumber) => {
    try {
      const detail = await actions.getCollectionDetailById(id);
      detail.documentNumber = documentNumber; // Inyectamos el número de documento
      setSelectedPayable(detail);
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
    setSelectedPayable(null);
    actions.refetch();
  };

  const tableActions = {
    onApply: actions.applyItem,
    onEdit: handleEdit,
    onDelete: actions.deleteItem,
    onView: handleViewAccountingEntry,
    onCancel: actions.cancelItem,
  };
    const filters = {
        startDate: startDate,
        endDate: endDate,
    };

  return (

    <>
     <SubMenu links={AccountPayableSubMenuLinks} />
    <section className={styles.container}>
      
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
      />
  <SortActionsComponent
      listTitle="LIQUIDACIONES"
      setSortBy={handleSort}
      sortBy={sortBy}
      filters={{ startDate, endDate }}
      styles={stylesCustomers}
    />
 

      {isLoading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!isLoading && !error && <AccountsPayableTable data={data} actions={tableActions} />}

        {isRegisterModalOpen && (
        <RegisterPayableLiquidacion onClose={closeModalAndRefetch} />
      )}

      {isEditModalOpen && selectedPayable && (
        <EditPayableLiquidation
          paymentDetail={selectedPayable}
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
    </>
  );
};

export default AccountsPayable;