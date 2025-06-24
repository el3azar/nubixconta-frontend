import React, { useState, useEffect } from "react";
import styles from "../../styles/accountsreceivable/AutocompleteSelect.module.css";

const AutocompleteSelect = ({ label, options = [], placeholder, onSelect }) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setFiltered(
      options.filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, options]);

  const handleSelect = (value) => {
    setQuery(value);
    setShowOptions(false);
    onSelect(value);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowOptions(true)}
        className={styles.input}
      />
      {showOptions && filtered.length > 0 && (
        <ul className={styles.dropdown}>
          {filtered.map((opt, idx) => (
            <li key={idx} onClick={() => handleSelect(opt)}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSelect;
