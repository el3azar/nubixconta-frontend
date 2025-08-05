import React, { useState, useMemo, useCallback } from 'react';
import Boton from '../elementos/Boton';
import { Link } from 'react-router-dom';
import TableComponent from '../elementos/TableComponent';
import { showSuccess } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';

// 2. Define los datos para la tabla
// En una aplicación real, esto vendría de una llamada a una API.
const datosDeEjemplo = [
  { codigo: 'PROD-001', nombre: 'Monitor Curvo 32"', unidad: 'PZA', existencias: 25, fecha: '2025-08-01', activo: false },
  { codigo: 'PROD-002', nombre: 'Silla Ergonómica', unidad: 'PZA', existencias: 40, fecha: '2025-07-30', activo: false },
  { codigo: 'PROD-003', nombre: 'Mouse Vertical', unidad: 'PZA', existencias: 110, fecha: '2025-07-28', activo: false },
];

const DesableProductView = () => {
    // Guardamos los datos en un estado para que puedan ser modificables
  const [data, setData] = useState(datosDeEjemplo);
  const [filtro, setFiltro] = useState('');

  // Esta es la nueva versión de tu función
  const handleToggleActivo = async (codigoProducto) => {
    const producto = data.find(p => p.codigo === codigoProducto);
    if (!producto) return;

    const isActivo = producto.activo;

    // Define los textos dinámicos para la confirmación
    const title = isActivo ? '¿Desactivar producto?' : '¿Activar producto?';
    const confirmButtonText = isActivo ? 'Sí, desactivar' : 'Sí, activar';

    // Llama a tu servicio de confirmación
    const result = await showConfirmationDialog(title, "El estado del producto cambiará.", confirmButtonText, 'Cancelar');

    // La lógica después de la confirmación sigue igual
    if (result.isConfirmed) {
        showSuccess(isActivo ? '¡Producto desactivado!' : '¡Producto activado!');
        setData(currentData =>
            currentData.map(p =>
            p.codigo === codigoProducto ? { ...p, activo: !isActivo } : p
        )
      );
    }
  };
  
  // 3. Define las columnas usando useMemo para optimizar
  const columns = useMemo(() => [
    {
      header: 'Código',
      accessorKey: 'codigo', // Coincide con la clave en el objeto de datos
    },
    {
      header: 'Nombre',
      accessorKey: 'nombre',
    },
    {
      header: 'Unidad',
      accessorKey: 'unidad',
    },
    {
      header: 'Existencias',
      accessorKey: 'existencias',
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha',
    },
    {
      header: 'Acciones',
      id: 'acciones', // ID único para la columna de acciones
      cell: ({ row }) => (
        // Renderizamos un botón para cada fila
        <div className="d-flex justify-content-center">
          <Boton 
            color={row.original.activo ? "blanco" : "morado"} 
            forma="pastilla"
            onClick={() => handleToggleActivo(row.original.codigo)}
          >
            {row.original.activo ? 'Desactivar' : 'Activar'}
          </Boton>
        </div>
      )
    }
  ], [data]); // El array de dependencias está vacío porque las columnas no cambian

    return (
        <div>
            <h2>Lista de Productos Desactivados</h2>
            <div>
                <Link to="/inventario/productos">
                    <Boton color="morado" forma="pastilla" className="mb-4" >
                        <i class="bi bi-arrow-left-circle-fill me-2"></i>
                        Regresar
                    </Boton>
                </Link>
            </div>
             {/* 4. Renderiza tu BaseTable, pasándole las props necesarias */}
            <TableComponent
                columns={columns}
                data={data}
                globalFilter={filtro}
                onGlobalFilterChange={setFiltro}
                withPagination={true}
            />
        </div>
        
    );
};

export default DesableProductView