import React, { useState } from 'react';
import ProductSearchBar from './ProductSearchBar';
import RegisterProductButton from './RegisterProductButton';
import ProductTable from './ProductTable';

const ProductList = () => {
  // 🧪 Datos de prueba
  const [products, setProducts] = useState([
    {
      id: 1,
      codigo: '1A-001',
      nombre: 'Guayabas',
      unidad: 'Caja',
      existencias: 5,
      activo: true
    },
    {
      id: 2,
      codigo: '1A-002',
      nombre: 'Kiwis',
      unidad: 'Paquete',
      existencias: 0,
      activo: false
    },
    {
      id: 3,
      codigo: '1A-003',
      nombre: 'Producto Karen',
      unidad: 'Unidad',
      existencias: 12,
      activo: true
    }
  ]);

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
        <RegisterProductButton />
      </div>

      {/* Tabla de productos */}
      <ProductTable
        products={sortedProducts}
        handleSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />

    </div>
  );
};

export default ProductList;
