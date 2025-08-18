import React, { useState } from 'react';
// 1. Importa los servicios que necesitas
import { showConfirmationDialog } from '../alertsmodalsa'; // Asegúrate que la ruta sea correcta
import { showSuccess } from '../alertstoast'; // Asegúrate que la ruta sea correcta
import styles from "../../../styles/inventory/SwitchBase.module.css"; // Asegúrate de que este archivo exista

/**
 * Componente Switch que muestra un diálogo de confirmación antes de cambiar de estado.
 * @param {object} props
 * @param {boolean} props.initialState - El estado inicial del switch.
 * @param {function} props.onToggle - Función que se ejecuta solo si el usuario confirma el cambio.
 */
const SwitchAction = ({ initialState = false, onToggle }) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = async () => {
    // 2. Define los mensajes para activar y desactivar
    const config = isOn
      ? { // Configuración para DESACTIVAR
          title: '¿Desactivar el producto?',
          text: 'El producto se desactivará.',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          successMessage: '¡Desactivado correctamente!'
        }
      : { // Configuración para ACTIVAR
          title: '¿Activar el producto?',
          text: 'El producto volverá a estar activo.',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          successMessage: '¡Activado correctamente!'
        };

    // 3. Muestra el diálogo de confirmación usando el servicio
    const result = await showConfirmationDialog(
      config.title,
      config.text,
      config.confirmButtonText,
      config.cancelButtonText
    );

    // 4. Si el usuario confirma la acción...
    if (result.isConfirmed) {
      const newState = !isOn;
      setIsOn(newState); // Cambia el estado visual del switch
      
      if (onToggle) {
        onToggle(newState); // Notifica al componente padre sobre el cambio
      }
      
      // Muestra el toast de éxito
      showSuccess(config.successMessage);
    }
    // Si el usuario cancela, no se hace nada.
  };

  return (
    <div className={`switch-container ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
      <div className="switch-thumb" />
    </div>
  );
};

export default SwitchAction;
