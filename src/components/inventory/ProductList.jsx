import React, { useState } from 'react';
import ProductSearchBar from './ProductSearchBar';
import RegisterProduct from './RegisterProduct';
import EditProduct from './EditProduct';
import EnableProduct from './EnableProduct';
import DisableProduct from './DisableProduct';
import ProductTable from './ProductTable';

const ProductList = () => {
  const [products, setProducts] = useState([
    // { id: 1, correlativo: '1A', codigo: '1A-001', nombre: 'Guayabas', unidad: 'Caja', existencias: 5, activo: true },
    // { id: 2, correlativo: '2A', codigo: '1A-002', nombre: 'Kiwis', unidad: 'Paquete', existencias: 0, activo: false },
    // { id: 3, correlativo: '3A', codigo: '1A-003', nombre: 'Producto Karen', unidad: 'Unidad', existencias: 12, activo: true }
  ]);
  // Agregar datos prellenados como arriba es solo agregar los articulos mediante las llaves y separando por comas

  // Modal de registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const handleSaveProduct = (newProduct) => {
    setProducts(prev => [...prev, { id: prev.length + 1, ...newProduct }]);
  };

  // Modal de edición
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

  // Modal activar/desactivar
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

  // Ordenamiento
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

  const sortedProducts = [...products].sort((a, b) => {
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

      {/* Contenedor de búsqueda */}
      <ProductSearchBar />

      {/* Botón registrar producto */}
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

      {/* Tabla de productos */}
      <ProductTable
        products={sortedProducts}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        onEdit={handleEditClick}
        onToggleStatus={handleToggleClick}
      />

      {/* Modal de registro */}
      <RegisterProduct
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSave={handleSaveProduct}
      />

      {/* Modal de edición */}
      <EditProduct
        show={showEditModal}
        product={selectedProduct}
        onSave={handleUpdateProduct}
        onCancel={() => setShowEditModal(false)}
      />

      {/* Modal de activar/desactivar */}
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
