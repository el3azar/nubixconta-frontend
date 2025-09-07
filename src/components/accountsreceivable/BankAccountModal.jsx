import styles from "../../styles/accountsreceivable/BankAccountModal.module.css";

const BankAccountModal = ({ isOpen, onClose, accounts }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Cuentas bancarias</h3>
          <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}>
                <td>{acc.generatedCode}</td>
                <td>{acc.accountName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <button className={styles.acceptButton} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default BankAccountModal;
