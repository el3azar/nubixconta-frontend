import React from 'react';
import { FaSearch } from 'react-icons/fa'; // arriba del archivo

const ProductSearchBar = () => {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: '10000px' }}>
          <h2 className="h5 fw-bold mb-4 text-dark">Buscar Producto</h2>

          <form>
            <div className="row">
              
              <div className="col-md-6 mb-3">
                <label htmlFor="codigo" className="form-label text-dark">Código de producto:</label>
                <input
                  type="text"
                  id="codigo"
                  className="form-control"
                  placeholder="Ej. 1A-001"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="nombre" className="form-label text-dark">Nombre del producto:</label>
                <input
                  type="text"
                  id="nombre"
                  className="form-control"
                  placeholder="Ej. Producto A"
                />
              </div>
              
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-dark d-flex align-items-center gap-2">
                    <FaSearch />
                    Buscar Producto
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
