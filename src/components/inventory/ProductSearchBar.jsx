import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const ProductSearchBar = ({ onSearch, onClear }) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ codigo, nombre });
  };

  const handleClear = () => {
    setCodigo('');
    setNombre('');
    onClear(); // Limpia resultados en el componente padre
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: '10000px' }}>
          <h2 className="h5 fw-bold mb-4 text-dark">Buscar Producto</h2>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="codigo" className="form-label text-dark">Código de producto:</label>
                <input
                  type="text"
                  id="codigo"
                  className="form-control"
                  placeholder="Ej. A100"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength={10}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="nombre" className="form-label text-dark">Nombre del producto:</label>
                <input
                  type="text"
                  id="nombre"
                  className="form-control"
                  placeholder="Ej. Producto A"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-dark d-flex align-items-center gap-2">
                  <FaSearch />
                  Buscar Producto
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClear}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchBar;
