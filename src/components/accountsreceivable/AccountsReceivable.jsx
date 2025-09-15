// src/pages/AccountsReceivable.js
import React, { useState } from "react";

// Hooks
import { useAccountsReceivable } from "../../hooks/useAccountsReceivable";

// Components
import RegisterReceivableLiquidacion from "./RegisterReceivableLiquidacion";
import EditReceivableLiquidation from "./EditReceivableLiquidation";
import DateRangeFilter from "../../components/accountsreceivable/DateRangeFilter";
import SubMenu from "../shared/SubMenu"; 
import {AccountReceivableSubMenuLinks } from '../../config/menuConfig';
import {  SortActionsComponent } from '../shared/DocumentViewDefaults';
import AccountsReceivableTable from "../../components/accountsreceivable/AccountsReceivableTable";
import AccountingEntryModal from "../shared/AccountingEntryModal";
import { Notifier } from "../../utils/alertUtils";

// Styles
import styles from "../../styles/accountsreceivable/AccountsReceivable.module.css";
import stylesCustomers from "../../styles/sales/ViewCustomers.module.css";

const AccountsReceivable = () => {
  // Hook con la lógica de negocio
  const { data, isLoading, error, actions } = useAccountsReceivable('collections');

  // Estados locales para la UI (filtros y modales)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // estado para controlar la selección de ordenamiento
  const [sortBy, setSortBy] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [accountingEntry, setAccountingEntry] = useState(null);
  const [isAccountingEntryLoading, setIsAccountingEntryLoading] = useState(false);


  const handleSearch = () => {
    actions.searchByDate(startDate, endDate);
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
        setAccountingEntry({ error: error.message }); // Pasamos el error al modal
    } finally {
        setIsAccountingEntryLoading(false);
    }
  };

  const closeModalAndRefetch = () => {
    setIsRegisterModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDetail(null);
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
     <SubMenu links={AccountReceivableSubMenuLinks} />
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
      {/*<div className={styles.botonNuevaWrapper}>
        <button className={styles.btnNueva} onClick={() => setIsRegisterModalOpen(true)}>
          <FaPlus style={{ marginRight: "0.5rem" }} />
          Nueva
        </button>
      </div>*/}

      {isLoading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!isLoading && !error && <AccountsReceivableTable data={data} actions={tableActions} />}

      
      {isRegisterModalOpen && (
        <RegisterReceivableLiquidacion onClose={closeModalAndRefetch} />
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
    </>
  );
};

export default AccountsReceivable;