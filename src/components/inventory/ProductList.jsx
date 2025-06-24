import React, { useState, useEffect } from 'react';
import ProductSearchBar from './ProductSearchBar';
import RegisterProduct from './RegisterProduct';
import EditProduct from './EditProduct';
import DisableProduct from './DisableProduct';
import EnableProduct from './EnableProduct';
import ProductTable from './ProductTable';
import { fetchProductList } from '../../services/inventory/productListService';
import { updateProduct } from '../../services/inventory/ProductEditService';
import { showError, showSuccess } from './alerts';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToToggle, setProductToToggle] = useState(null);
  const [showToggleModal, setShowToggleModal] = useState(false);

  // Cargar todos los productos
  const loadProducts = async () => {
    try {
      const data = await fetchProductList();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      showError("Error al cargar productos desde el servidor.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 🔍 Filtro por código y nombre (búsqueda local)
  const handleSearch = ({ codigo, nombre }) => {
    const filtered = products.filter((product) => {
      const codigoMatch = codigo
        ? product.productCode.toLowerCase().includes(codigo.toLowerCase())
        : true;

      const nombreMatch = nombre
        ? product.productName.toLowerCase().includes(nombre.toLowerCase())
        : true;

      return codigoMatch && nombreMatch;
    });

    setFilteredProducts(filtered);
  };

  const handleClearSearch = () => {
    setFilteredProducts(products);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await updateProduct(productToEdit.idProduct, updatedProduct);
      showSuccess("Producto actualizado exitosamente");
      setShowEditModal(false);
      loadProducts();
    } catch (error) {
      showError("Error al actualizar el producto");
    }
  };

  const handleToggleStatus = (product) => {
    setProductToToggle(product);
    setShowToggleModal(true);
  };

  const handleConfirmToggle = () => {
    // Aquí iría la lógica para activar/desactivar producto (ej. patch al backend)
    setShowToggleModal(false);
    setProductToToggle(null);
    loadProducts();
  };

  return (
    <div>
      <ProductSearchBar onSearch={handleSearch} onClear={handleClearSearch} />

      <div className="text-end mb-4">
        <button
          className="btn"
          style={{ backgroundColor: '#1B043B', color: 'white', fontWeight: 'bold' }}
          onClick={() => setShowModal(true)}
        >
          Registrar Producto
        </button>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onToggleStatus={handleToggleStatus}
      />

      {showModal && (
        <RegisterProduct
          show={showModal}
          onClose={() => {
            loadProducts();
            setShowModal(false);
          }}
        />
      )}

      {showEditModal && (
        <EditProduct
          show={showEditModal}
          product={productToEdit}
          onSave={handleUpdateProduct}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {productToToggle && (
        productToToggle.productStatus ? (
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
