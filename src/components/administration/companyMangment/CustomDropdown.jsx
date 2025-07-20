import React, { useState, useRef, useEffect } from "react";
import styles from "../../../styles/administration/CustomDropdown.module.css"; // estilos aparte recomendados

const CustomDropdown = ({ options, selected, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setOpen(!open)}
      >
        {selected ? selected.label : placeholder}
        <i className="bi bi-chevron-down ms-2" />
      </button>

      {open && (
        <ul className={styles.dropdownMenu}>
          {options.map((opt) => (
            <li
              key={opt.value}
              className={styles.dropdownItem}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
