// src/components/inventory/inventoryelements/SelectBase.jsx
import React from 'react';
import AsyncSelect from 'react-select/async';
import styles from "../../../styles/inventory/SelectBase.module.css"; // Asegúrate de que este archivo exista y las clases sean correctas

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '38px',
        borderColor: state.isFocused ? '#66afe9' : provided.borderColor,
        boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(102,175,233,.25)' : null,
        '&:hover': {
            borderColor: state.isFocused ? '#66afe9' : provided.borderColor,
        },
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999, // Asegura que el menú esté por encima de otros elementos
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#e8e8e8' : 'white',
        color: 'black',
    }),
};

const SelectBase = ({
    value, // El valor seleccionado actualmente (objeto { value, label })
    onChange, // Función para manejar el cambio de selección
    placeholder = "Escribe para buscar...",
    isDisabled = false,
    onSearchAsync, // <<--- ¡NUEVA PROP! Aquí pasaremos la función de búsqueda real
    minimumInputLength = 0, // Por defecto, puedes buscar desde el inicio, o poner 2 o 3
    ...props // Para cualquier otra prop que quieras pasar a AsyncSelect
}) => {

    const loadOptions = async (inputValue, callback) => {
        // Solo busca si la longitud del input es suficiente
        if (inputValue.length < minimumInputLength) {
            callback([]); // No hay opciones si el input es muy corto
            return;
        }

        if (onSearchAsync) {
            try {
                // Llama a la función asíncrona que viene de las props
                const options = await onSearchAsync(inputValue);
                callback(options); // Pasa las opciones a react-select/async
            } catch (error) {
                console.error("Error al cargar opciones en SelectBase:", error);
                callback([]); // En caso de error, no devuelve opciones
            }
        } else {
            callback([]); // Si no hay función de búsqueda, no hay opciones
        }
    };

    return (
        <AsyncSelect
            classNamePrefix="custom-select"
            cacheOptions // Almacena en caché los resultados de búsqueda para el mismo término
            loadOptions={loadOptions}
            // defaultOptions={false} // No cargues opciones por defecto, espera la búsqueda.
            // Si quieres que al abrir muestre algunas opciones sin escribir nada:
            // defaultOptions={true} // Carga opciones al abrir, con un término vacío o el que defina onSearchAsync
            isClearable={!isDisabled}
            placeholder={placeholder}
            loadingMessage={() => "Buscando..."}
            noOptionsMessage={({ inputValue }) =>
                inputValue.length < minimumInputLength
                    ? `Escribe al menos ${minimumInputLength} caracteres para buscar.`
                    : `No se encontraron resultados para "${inputValue}"`
            }
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            styles={customStyles}
            {...props}
        />
    );
};

export default SelectBase;