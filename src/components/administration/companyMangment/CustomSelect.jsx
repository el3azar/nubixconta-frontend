import React from 'react';
import Select from 'react-select';

const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
}) => {
  // Convertir valor simple a objeto si es necesario
  const selectedOption = options.find(opt => {
    if (typeof opt === 'string') return opt === value;
    return opt.value === value;
  });

  // Normalizar las opciones a objetos { label, value }
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold">{label}</label>}
      <Select
        options={normalizedOptions}
        value={selectedOption}
        onChange={(selected) => onChange(selected?.value || '')}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: '#ccc',
            borderRadius: '0.375rem',
            padding: '2px',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#eee' : 'white',
            color: 'black',
          }),
        }}
      />
    </div>
  );
};

export default CustomSelect;
