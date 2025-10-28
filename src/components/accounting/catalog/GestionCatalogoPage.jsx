// src/components/accounting/catalog/GestionCatalogoPage.jsx
// ... (todos los imports y la lógica del componente se mantienen igual)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCatalogService } from '../../../services/accounting/CatalogService';
import { Notifier } from '../../../utils/alertUtils';
import MasterCatalogTree from './MasterCatalogTree';
import CompanyCatalogTree from './CompanyCatalogTree';
import EditAccountModal from './EditAccountModal';
import styles from '../../../styles/accounting/Catalog.module.css';

const GestionCatalogoPage = () => {
  // 1. Obtenemos la nueva función del servicio
  const { getMasterTree, getCompanyTree, activateAccounts, deactivateAccounts } = useCatalogService();

  const [masterTree, setMasterTree] = useState([]);
  const [companyTree, setCompanyTree] = useState([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  // 2. Estados para manejar las selecciones en AMBOS árboles
  const [selectedMasterKeys, setSelectedMasterKeys] = useState([]);
  const [selectedCompanyKeys, setSelectedCompanyKeys] = useState([]);

  // 3. Estados para controlar las acciones en curso
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  const [editingAccount, setEditingAccount] = useState(null);

  // Efecto para cargar el Catálogo Maestro
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        setIsLoadingMaster(true);
        const masterData = await getMasterTree();
        setMasterTree(masterData);
      } catch (error) {
        Notifier.error('No se pudo cargar el Catálogo Maestro.');
      } finally {
        setIsLoadingMaster(false);
      }
    };
    fetchMaster();
  }, [getMasterTree]);

  // Función para (re)cargar el Catálogo de la Empresa, ahora independiente
  const fetchCompanyTree = useCallback(async () => {
    try {
      setIsLoadingCompany(true);
      const companyData = await getCompanyTree();
      setCompanyTree(companyData);
    } catch (error) {
      Notifier.error('No se pudo cargar el catálogo de la empresa.');
    } finally {
      setIsLoadingCompany(false);
    }
  }, [getCompanyTree]);

  // Efecto para la carga inicial del Catálogo de la Empresa
  useEffect(() => {
    fetchCompanyTree();
  }, [fetchCompanyTree]);
  
 // --- SECCIÓN CORREGIDA en la respuesta anterior ---
  const activeMasterIds = useMemo(() => {
    const ids = new Set();
    const collectIds = (nodes) => {
      for (const node of nodes) {
        if (node.masterAccountId) {
          if(node.active){ 
             ids.add(node.masterAccountId);
          }
        }
        if (node.children) {
          collectIds(node.children);
        }
      }
    };
    collectIds(companyTree);
    return ids;
  }, [companyTree]);

  const handleActivate = async () => {
    if (selectedMasterKeys.length === 0) {
      Notifier.warning('Seleccione al menos una cuenta para activar.');
      return;
    }
    setIsActivating(true);
    try {
      await activateAccounts(selectedMasterKeys);
      Notifier.success('Cuentas activadas exitosamente!');
      setSelectedMasterKeys([]);
      await fetchCompanyTree(); // Recargamos el árbol de la empresa
    } catch (error) {
      Notifier.error('Error al activar: ' + (error.response?.data || error.message));
    } finally {
      setIsActivating(false);
    }
  };
  

  const handleDeactivate = async () => {
    if (selectedCompanyKeys.length === 0) {
      Notifier.warning('Seleccione al menos una cuenta de su empresa para desactivar.');
      return;
    }

    const result = await Notifier.confirm({
      title: 'Confirmar Desactivación',
      text: '¿Está seguro? Todas las cuentas hijas de las que seleccione también serán desactivadas. Las cuentas inactivas no podrán ser usadas en nuevas transacciones.',
      confirmButtonText: 'Sí, desactivar'
    });

    if (result.isConfirmed) {
      setIsDeactivating(true);
      try {
        await deactivateAccounts(selectedCompanyKeys);
        Notifier.success('Cuentas desactivadas exitosamente.');
        setSelectedCompanyKeys([]); // Limpiamos la selección
        await fetchCompanyTree();   // Refrescamos la vista
      } catch (error) {
        Notifier.error('Error al desactivar: ' + (error.response?.data || error.message));
      } finally {
        setIsDeactivating(false);
      }
    }
  };
  const handleEdit = (accountNode) => {
    setEditingAccount(accountNode);
  };

  const handleCloseModal = (needsRefresh) => {
    setEditingAccount(null);
    if (needsRefresh) {
      fetchCompanyTree();
    }
  };
// En src/components/accounting/catalog/GestionCatalogoPage.jsx

const handleMasterTreeCheck = (allSelectedKeys) => {
    // El `onCheck` de nuestro hijo (`MasterCatalogTree`) ya nos envía el array combinado.
    // Solo necesitamos eliminar duplicados y actualizar el estado.
    setSelectedMasterKeys([...new Set(allSelectedKeys)]);
  };
  
  return (
    <section className={styles.viewWrapper}>
      <h2 className="mb-4">Gestión de Catálogo Contable</h2>
      <div className={styles.panelsContainer}>
        {/* Panel Izquierdo */}
        <div className={styles.panel}>
          <h3>Catálogo Maestro</h3>
          {isLoadingMaster ? (<p>Cargando...</p>) : (
            <>
               <MasterCatalogTree
                treeData={masterTree} 
                checkedKeys={selectedMasterKeys}
                onSelectionChange={handleMasterTreeCheck}
                activeMasterIds={activeMasterIds}
              />
              <button
                className={styles.activateButton}
                onClick={handleActivate}
                disabled={selectedMasterKeys.length === 0 || isActivating}
              >
                {isActivating ? (
                  <><span className={styles.spinner}></span>Activando...</>
                ) : (
                  `Activar (${selectedMasterKeys.length})`
                )}
              </button>
            </>
          )}
        </div>

               {/* --- EL CAMBIO ESTÁ AQUÍ --- */}
        {/* Panel Derecho */}
        <div className={styles.panel}>
          <h3>Catálogo de Mi Empresa</h3>
          {isLoadingCompany ? (<p>Cargando...</p>) : (
            <>
              <CompanyCatalogTree
                treeData={companyTree}
                onEdit={handleEdit}
                // Añadimos las dos props que faltaban
                selectedKeys={selectedCompanyKeys}
                onSelectionChange={setSelectedCompanyKeys}
              />
              <button
                className={styles.deactivateButton}
                onClick={handleDeactivate}
                disabled={selectedCompanyKeys.length === 0 || isDeactivating}
              >
                {isDeactivating ? (
                  <><span className={styles.spinner}></span>Desactivando...</>
                ) : (
                  `Desactivar (${selectedCompanyKeys.length})`
                )}
              </button>
            </>
          )}
        </div>

      </div>
      
      {editingAccount && (
        <EditAccountModal
            isOpen={!!editingAccount}
            onClose={handleCloseModal}
            account={editingAccount}
        />
      )}
    </section>
  );
};

export default GestionCatalogoPage;