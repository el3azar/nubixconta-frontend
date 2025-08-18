import React, { useState } from 'react';
import { showConfirmationDialog } from '../alertsmodalsa';
import { showSuccess } from '../alertstoast';
import styles from '../../../styles/inventory/SwitchBase.module.css'; // Asegúrate de que este archivo exista


/**
 * Componente Switch genérico que muestra un diálogo de confirmación.
 * @param {object} props
 * @param {boolean} props.initialState - El estado inicial del switch.
 * @param {function} props.onToggle - Función que se ejecuta si se confirma el cambio.
 * @param {object} props.configOn - Objeto con los textos para el estado "activar".
 * @param {object} props.configOff - Objeto con los textos para el estado "desactivar".
 */
const SwitchAction = ({ 
  initialState = false, 
  onToggle, 
  configOn, 
  configOff 
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = async () => {
    // Ahora, la configuración se toma directamente de las props
    const config = isOn ? configOff : configOn;

    // Si no se proporcionó una configuración, no se hace nada para evitar errores.
    if (!config) {
      console.error("La configuración para el switch no fue proporcionada.");
      return;
    }

    const result = await showConfirmationDialog(
      config.title,
      config.text,
      config.confirmButtonText,
      config.cancelButtonText
    );

    if (result.isConfirmed) {
      const newState = !isOn;
      setIsOn(newState);
      
      if (onToggle) {
        onToggle(newState);
      }
      
      showSuccess(config.successMessage);
    }
  };

  return (
    <div className={`switch-container ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
      <div className="switch-thumb" />
    </div>
  );
};

export default SwitchAction;