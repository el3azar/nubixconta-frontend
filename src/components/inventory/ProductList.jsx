import React, { useState } from 'react';
import ProductSearchBar from './ProductSearchBar';
import RegisterProduct from './RegisterProduct';
import EditProduct from './EditProduct';
import EnableProduct from './EnableProduct';
import DisableProduct from './DisableProduct';
import ProductTable from './ProductTable';
import { showError } from './alerts'; // Asegúrate de que esto apunte bien

const ProductList = () => {
  const [products, setProducts] = useState([
    // Ejemplo de datos
    // { id: 1, correlativo: '1A', codigo: 'A100', nombre: 'Guayabas', unidad: 'Caja', existencias: 5, activo: true },
  ]);

  const [filteredProducts, setFilteredProducts] = useState([]);

  // 🔎 Búsqueda
  const handleSearch = ({ codigo, nombre }) => {
    if ((codigo && codigo.length > 10) || (nombre && nombre.length > 50)) {
      showError('NOTA: La información ingresada es inválida para la búsqueda');
      return;
    }

    const results = products.filter(p => {
      const matchCodigo = codigo ? p.codigo.toLowerCase().includes(codigo.toLowerCase()) : true;
      const matchNombre = nombre ? p.nombre.toLowerCase().includes(nombre.toLowerCase()) : true;
      return matchCodigo && matchNombre;
    });

    if (results.length === 0) {
      showError('NOTA: No se encontraron productos con esa información');
    }

    setFilteredProducts(results);
  };

  // 🧹 Limpieza de filtros
  const handleClearSearch = () => {
    setFilteredProducts([]);
    showInfo('Filtros eliminados, mostrando todos los productos');
  };

  // ➕ Registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const handleSaveProduct = (newProduct) => {
    setProducts(prev => [...prev, { id: prev.length + 1, ...newProduct }]);
  };

  // ✏️ Edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setShowEditModal(false);
  };

  // ✅ Activar / ❌ Desactivar
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);

  const handleToggleClick = (product) => {
    setProductToToggle(product);
    setShowToggleModal(true);
  };

  const handleConfirmToggle = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productToToggle.id ? { ...p, activo: !p.activo } : p
      )
    );
    setShowToggleModal(false);
  };

  // ↕️ Ordenamiento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...(filteredProducts.length > 0 ? filteredProducts : products)].sort((a, b) => {
    const aValue = sortField === 'existencias' ? Number(a[sortField]) : a[sortField];
    const bValue = sortField === 'existencias' ? Number(b[sortField]) : b[sortField];
    if (!aValue || !bValue) return 0;
    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="min-h-screen bg-[#3D3457] text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Lista de productos</h1>

      {/* Buscador */}
      <ProductSearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />

      {/* Botón registrar */}
      <div className="d-flex justify-content-start mt-3" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button
          className="btn"
          onClick={() => setShowRegisterModal(true)}
          style={{
            backgroundColor: '#1B043B',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '10px 20px',
            border: 'none'
          }}
        >
          Registrar Producto
        </button>
      </div>

      {/* Tabla */}
      <ProductTable
        products={sortedProducts}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        onEdit={handleEditClick}
        onToggleStatus={handleToggleClick}
      />

      {/* Modal registro */}
      <RegisterProduct
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSave={handleSaveProduct}
        existingProducts={products}
      />

      {/* Modal edición */}
      <EditProduct
        show={showEditModal}
        product={selectedProduct}
        onSave={handleUpdateProduct}
        onCancel={() => setShowEditModal(false)}
      />

      {/* Modal activar/desactivar */}
      {productToToggle && (
        productToToggle.activo ? (
          <DisableProduct
            show={showToggleModal}
            onConfirm={handleConfirmToggle}
            onCancel={() => setShowToggleModal(false)}
          />
        ) : (
          <EnableProduct
            show={showToggleModal}
            onConfirm={handleConfirmToggle}
            onCancel={() => setShowToggleModal(false)}
          />
        )
      )}
    </div>
  );
};

export default ProductList;
