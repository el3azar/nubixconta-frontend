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
    value,
    onChange,
    placeholder = "Escribe para buscar...",
    isDisabled = false,
    onSearchAsync, // Función para búsqueda asíncrona
    options = [], // <--- Prop para opciones estáticas (con valor predeterminado)
    minimumInputLength = 0,
    ...props
}) => {

    const loadOptions = async (inputValue, callback) => {
        if (onSearchAsync) {
            // Lógica para búsqueda asíncrona
            if (inputValue.length < minimumInputLength) {
                callback([]);
                return;
            }
            try {
                const fetchedOptions = await onSearchAsync(inputValue);
                callback(fetchedOptions);
            } catch (error) {
                console.error("Error al cargar opciones en SelectBase (onSearchAsync):", error);
                callback([]);
            }
        } else {
            // Lógica para filtrar opciones estáticas si no hay onSearchAsync
            const filteredOptions = options.filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            callback(filteredOptions);
        }
    };

    // `react-select/async` funciona mejor si `loadOptions` siempre está presente
    // y la lógica de si es "asíncrono real" o "filtrado estático" está dentro de `loadOptions`.
    // Para `defaultOptions`, si hay opciones estáticas, las pasamos.
    // Si es una búsqueda asíncrona real, `defaultOptions` puede ser `false` o `[]`.
    const isActuallyAsync = !!onSearchAsync;

    return (
        <AsyncSelect
            classNamePrefix="custom-select"
            // Solo cachea si realmente es una operación asíncrona de búsqueda.
            // Si son opciones estáticas, no necesitamos cachearlas de esta forma.
            cacheOptions={isActuallyAsync}
            loadOptions={loadOptions} // Siempre pasamos loadOptions, que contiene la lógica
            
            // Si tenemos opciones estáticas, las usamos como defaultOptions.
            // Si es una búsqueda asíncrona (onSearchAsync), no hay defaultOptions iniciales.
            defaultOptions={options.length > 0 ? options : (isActuallyAsync ? [] : true)}
            
            isClearable={!isDisabled}
            placeholder={placeholder}
            loadingMessage={() => "Buscando..."}
            noOptionsMessage={({ inputValue }) =>
                isActuallyAsync && inputValue.length < minimumInputLength
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