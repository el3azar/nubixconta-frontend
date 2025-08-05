import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../elementos/Boton';
import TableComponent from '../elementos/TableComponent';
// 1. Importa TUS funciones de alerta y toast
import { showSuccess } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';

// 2. Define datos de ejemplo para los movimientos pendientes.
// En una aplicación real, esto vendría de una API.
//Enriquecemos los datos iniciales con la 'dirty flag'
const datosMovimientos = [
    { id: 1, codigoProducto: 'SKU-000', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario', aplicado: false, isDirty: false },
    { id: 2, codigoProducto: 'SKU-001', fecha: '2025-08-01', tipo: 'Salida', observacion: 'Venta a cliente B', modulo: 'Ventas', aplicado: false, isDirty: false },
    { id: 3, codigoProducto: 'SKU-002', fecha: '2025-07-31', tipo: 'Ajuste', observacion: 'Corrección de stock', modulo: 'Inventario', aplicado: false, isDirty: false },
    { id: 4, codigoProducto: 'SKU-003', fecha: '2025-07-30', tipo: 'Entrada', observacion: 'Devolución de cliente C', modulo: 'Ventas', aplicado: false, isDirty: false },
    { id: 5, codigoProducto: 'SKU-004', fecha: '2025-08-01', tipo: 'Entrada', observacion: 'Compra a proveedor A', modulo: 'Inventario', aplicado: false, isDirty: false },
];

const PendingInventoryMovements = () => {
    // 3. Guarda los datos en un estado para que sean modificables y añade un estado para el filtro.
  const [movimientos, setMovimientos] = useState(datosMovimientos);
  const [filtro, setFiltro] = useState('');

  // 2. Modificamos esta función. Ya no necesita ser 'async' ni mostrar alertas.
    // Su única responsabilidad es marcar el cambio en el estado local.
    const handleAplicarMovimiento = useCallback((movimientoId) => {
    setMovimientos(currentMovimientos =>
        currentMovimientos.map(mov =>
            mov.id === movimientoId
                ? { ...mov, aplicado: !mov.aplicado, isDirty: true } // Cambia 'aplicado' y marca como 'dirty'
                : mov
        )
    );
    }, []);

    // 3. Añadimos la nueva función para guardar los cambios.
    const handleSaveChanges = async () => {
        const cambiosPendientes = movimientos.filter(mov => mov.isDirty);

        if (cambiosPendientes.length === 0) {
            showInfo('No hay cambios pendientes para guardar.');
            return;
        }
        
        const result = await showConfirmationDialog(
            '¿Guardar Cambios?',
            `Se aplicarán ${cambiosPendientes.length} movimiento(s). ¿Deseas continuar?`,
            'Sí, guardar',
            'Cancelar'
        );

        if (result.isConfirmed) {
            try {
                // Simulación de llamada al backend
                console.log('Enviando al backend:', cambiosPendientes);
                // await api.post('/movimientos/aplicar', cambiosPendientes);

                showSuccess('¡Los cambios se han guardado correctamente!');

                // Limpiamos las 'dirty flags' después de guardar
                setMovimientos(currentMovimientos =>
                    currentMovimientos.map(mov =>
                        mov.isDirty ? { ...mov, isDirty: false } : mov
                    )
                );
            } catch (error) {
                showError('Error al guardar los cambios.');
                console.error(error);
            }
        }
    };

  // 5. Define las columnas para la tabla usando useMemo para optimizar.
  const columns = useMemo(() => [
    {
      header: 'Codigo Producto',
      accessorKey: 'codigoProducto',
    },
    {
      header: 'Fecha',
      accessorKey: 'fecha',
    },
    {
      header: 'Tipo de Movimiento',
      accessorKey: 'tipo',
    },
    {
        header: 'Observación',
        accessorKey: 'observacion',
    },
    {
        header: 'Módulo',
        accessorKey: 'modulo',
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        // La condición es: ¿Está aplicado Y NO está pendiente de guardado?
        const isSavedAndApplied = row.original.aplicado && !row.original.isDirty;
        return (
            <div className="d-flex justify-content-center" title='Aplicar Movimiento'>
            <Boton
                onClick={() => handleAplicarMovimiento(row.original.id)}
                // Se deshabilita si ya fue guardado como aplicado
                disabled={isSavedAndApplied}
                color={row.original.aplicado ? "blanco" : "morado"}
                forma="pastilla"
            >
                {/* Cambia el texto del botón basado en el estado 'aplicado' */}
                {row.original.aplicado ? 'Cancelar' : 'Aplicar'}
            </Boton>
            </div>
        );
      },
    },
  ], [handleAplicarMovimiento]); // Depende de la función para que se actualice si esta cambia.
  // 5. Calculamos si hay cambios pendientes para habilitar/deshabilitar el botón de guardar.
  const hayCambiosPendientes = movimientos.some(mov => mov.isDirty);


  return (
    <div>
      <h2>Movimientos pendientes</h2>
      <div className='d-flex justify-content-between mb-2'>
        <Link to="/inventario/moves">
          <Boton color="morado" forma="pastilla" className="mb-4">
            <i class="bi bi-arrow-left-circle-fill me-2"></i>
            Regresar
          </Boton>
        </Link>
        {/* 6. Añadimos el nuevo botón de "Guardar Cambios" */}
        <Boton
            color="blanco" // Un color diferente para la acción principal
            forma="pastilla"
            onClick={handleSaveChanges}
            disabled={!hayCambiosPendientes}
            className='mb-4'
        >
            <i className="bi bi-check-circle-fill me-2"></i>
            Guardar Cambios
        </Boton>
      </div>
      {/* 6. Renderiza el componente de la tabla con los datos y columnas definidos */}
      <TableComponent
        columns={columns}
        data={movimientos}
        globalFilter={filtro}
        onGlobalFilterChange={setFiltro}
        withPagination={true}
      />
    </div>
  );
};

export default PendingInventoryMovements;