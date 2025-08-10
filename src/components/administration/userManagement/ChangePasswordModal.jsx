import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import formStyles from '../../../styles/sales/CustomerForm.module.css';
import styles from '../../../styles/administration/UserManagementDashboard.module.css';
import { resetUserPasswordByAdmin } from '../../../services/administration/user/passwordAssistantService';
// Importa el custom hook
import usePasswordLockout from '../userManagement/usePasswordLockout'; 

const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  user, 
  showSuccess, 
  showError,
  navigate // Se sigue necesitando para la redirección
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Usa el custom hook
  const { isLocked, remainingTime, handleFailedAttempt, resetLockoutState, shouldRedirect } = usePasswordLockout();
  
  // Agrega un useEffect para manejar la redirección cuando sea necesario
  useEffect(() => {
    if (shouldRedirect) {
      showError('Demasiados intentos fallidos. Será redirigido a la pantalla de inicio de sesión.');
      onClose(); 
      navigate('/');
    }
  }, [shouldRedirect, onClose, navigate, showError]);

  const handleSave = async () => {
    if (isLocked) {
      showError(`El formulario está bloqueado. Por favor, espere ${remainingTime} minutos.`);
      return;
    }

    if (!adminPassword || !newPassword || !confirmPassword) {
      showError('Todos los campos son obligatorios.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    
    setIsLoading(true);
    try {
      const passwordData = {
        adminPassword,
        newPassword,
        confirmPassword,
      };
      await resetUserPasswordByAdmin(user.id, passwordData);

      showSuccess('Contraseña actualizada exitosamente.');
      resetLockoutState(); // Llama a la función del hook para reiniciar el estado
      onClose();

    } catch (error) {
      const errorMessage = error.response?.data || 'Error al actualizar la contraseña.';
      showError(errorMessage);
      handleFailedAttempt(); // Llama a la función del hook para manejar el intento fallido
    } finally {
      setIsLoading(false);
      setAdminPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar Contraseña para {user?.firstName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña del administrador</Form.Label>
          <Form.Control
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            disabled={isLocked}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nueva Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLocked}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLocked}
          />
        </Form.Group>
        
        {isLocked && (
          <div className="text-center text-danger mt-3">
            <p>Bloqueado: Intente de nuevo en {remainingTime}</p>
          </div>
        )}
      </Modal.Body>
      <div className="d-flex justify-content-end p-3">
        <button type="button" className={`me-2 ${formStyles.cancelar}`} onClick={onClose} disabled={isLoading}>
          Cancelar
        </button>
        <button
          type="button"
          className={`${formStyles.registrar} ${styles.centeredButton}`}
          onClick={handleSave}
          disabled={isLoading || isLocked}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;