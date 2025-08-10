import React from 'react';
import AsyncSelect from 'react-select/async';
import './SelectBase.css';

// La función de búsqueda no cambia, pero la movemos dentro para mantener todo junto.
const buscarEnApi = (terminoDeBusqueda, baseDeDatos) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!terminoDeBusqueda) {
        return resolve([]);
      }
      const resultados = baseDeDatos.filter(item =>
        item.label.toLowerCase().includes(terminoDeBusqueda.toLowerCase())
      );
      resolve(resultados);
    }, 500); // Reducido para mejor UX
  });
};

// --- ESTA ES LA VERSIÓN CORREGIDA Y MEJORADA ---
// Ahora es un componente "controlado" puro.
const SelectBase = ({ apiData = [], value, onChange, placeholder = "Escribe para buscar..." }) => {
  
  const loadOptions = (inputValue, callback) => {
    // La búsqueda ahora usará la propiedad correcta para filtrar
    buscarEnApi(inputValue, apiData).then(options => {
      callback(options);
    });
  };

  // ¡SIN ESTADO INTERNO! Recibe 'value' y 'onChange' de su padre.
  return (
    <AsyncSelect
      classNamePrefix="custom-select"
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      isClearable
      placeholder={placeholder}
      loadingMessage={() => "Buscando..."}
      noOptionsMessage={({ inputValue }) => `No se encontraron resultados para "${inputValue}"`}
      // Props clave para un componente controlado
      value={value}
      onChange={onChange}
    />
  );
};

export default SelectBase;