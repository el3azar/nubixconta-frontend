import Select from 'react-select';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  return (
    <Select
      options={options}
      value={options.find(opt => opt.value === value)}
      onChange={(selected) => onChange(selected?.value)}
      placeholder={placeholder}
      menuPortalTarget={document.body} // 👈 esto saca el dropdown del contenedor
      styles={{
        container: (base) => ({
          ...base,
          width: '100%',
        }),
        control: (base) => ({
          ...base,
          minHeight: '30px',
          height: '40px',
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
          maxHeight: '150px',   
          overflowY: 'auto',   
          position: 'absolute',  
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        option: (base) => ({
          ...base,
          whiteSpace: 'nowrap',
        }),
      }}
    />
  );
};

export default CustomSelect;
