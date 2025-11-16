import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useCatalogService } from '../../../services/accounting/CatalogService';
import { Notifier } from '../../../utils/alertUtils';
// --- 1. Importamos el nuevo archivo CSS ---
import styles from '../../../styles/accounting/EditModal.module.css';

Modal.setAppElement('#root');

const EditAccountModal = ({ isOpen, onClose, account }) => {
  const { updateAccount } = useCatalogService();
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setCustomName(account.effectiveName);
      setCustomCode(account.effectiveCode);
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAccount(account.id, { customName, customCode });
      Notifier.success('Cuenta actualizada exitosamente.');
      onClose(true);
    } catch (error) {
      Notifier.error('Error al actualizar: ' + (error.response?.data || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!account) return null;

  return (
    // --- 2. Usamos las clases del CSS en lugar del objeto `style` ---
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onClose(false)}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      closeTimeoutMS={300} // Para que coincida con la animación
    >
      <div className={styles.modalHeader}>
        <h2>Editar Cuenta</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="customName">Nombre Personalizado</label>
          <input
            id="customName"
            type="text"
            className={styles.formInput} // Usamos nuestra clase personalizada
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="customCode">Código Personalizado</label>
          <input
            id="customCode"
            type="text"
            className={styles.formInput} // Usamos nuestra clase personalizada
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
          />
        </div>
        <div className={styles.modalActions}>
          {/* Usamos las clases de Bootstrap que ya tienes configuradas */}
         <button
            type="button"
            className={`${styles.actionButton} ${styles.secondary}`} // Botón secundario
            onClick={() => onClose(false)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.actionButton} // Botón primario
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAccountModal;