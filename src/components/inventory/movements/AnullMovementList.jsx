import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../inventoryelements/Boton';
import TableComponent from '../inventoryelements/TableComponent';
// 1. Importa TUS funciones de alerta y toast
import { showSuccess } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';

// 1. Datos de ejemplo para movimientos que se pueden anular
const datosAnulados = [
    { id: 101, codigoProducto: 'SKU-11A', fecha: '2025-08-03', tipo: 'Salida', observacion: 'Venta Mayorista', anulado: false, isDirty: false },
    { id: 102, codigoProducto: 'SKU-12B', fecha: '2025-08-02', tipo: 'Entrada', observacion: 'Compra Proveedor X', anulado: true, isDirty: false },
    { id: 103, codigoProducto: 'SKU-13C', fecha: '2025-08-01', tipo: 'Ajuste', observacion: 'Ajuste por conteo', anulado: false, isDirty: false },
    { id: 104, codigoProducto: 'SKU-14D', fecha: '2025-07-31', tipo: 'Salida', observacion: 'Venta Cliente Y', anulado: false, isDirty: false },
];

const AnullMovementList = () => {
    // 2. Estado para manejar la lista de movimientos a anular
    const [listaMovimientos, setListaMovimientos] = useState(datosAnulados);
    const [filtro, setFiltro] = useState('');

    // 3. Handler para alternar el estado 'anulado'
    const handleToggleAnulacion = useCallback((movimientoId) => {
        setListaMovimientos(currentMovimientos =>
            currentMovimientos.map(mov =>
                mov.id === movimientoId
                    ? { ...mov, anulado: !mov.anulado, isDirty: true }
                    : mov
            )
        );
    }, []);

    // 4. Handler para guardar cambios (la lógica es la misma, solo cambian los textos)
    const handleSaveChanges = async () => {
        const cambiosPendientes = listaMovimientos.filter(mov => mov.isDirty);

        if (cambiosPendientes.length === 0) {
            showInfo('No hay cambios pendientes para guardar.');
            return;
        }
        
        const result = await showConfirmationDialog(
            '¿Guardar Cambios?',
            `Se modificará el estado de ${cambiosPendientes.length} movimiento(s). ¿Deseas continuar?`,
            'Sí, guardar',
            'Cancelar'
        );

        if (result.isConfirmed) {
            try {
                console.log('Enviando al backend:', cambiosPendientes);
                // await api.post('/movimientos/actualizar-estado', cambiosPendientes);
                showSuccess('¡Los cambios se han guardado correctamente!');
                setListaMovimientos(currentMovimientos =>
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

    // 5. Columnas adaptadas para la anulación
    const columns = useMemo(() => [
        { header: 'Codigo De Producto', accessorKey: 'codigoProducto' },
        { header: 'Fecha', accessorKey: 'fecha' },
        { header: 'Tipo', accessorKey: 'tipo' },
        { header: 'Observación', accessorKey: 'observacion' },
        {
            header: 'Estado',
            accessorKey: 'anulado',
            cell: ({ row }) => ( // Celda personalizada para mostrar el estado
                <span className={`badge bg-${row.original.anulado ? 'danger' : 'success'}`}>
                    {row.original.anulado ? 'Anulado' : 'Activo'}
                </span>
            )
        },
        /* {
            header: 'Acciones',
            id: 'acciones',
            cell: ({ row }) => (
                <div className="d-flex justify-content-center">
                    <Boton
                        onClick={() => handleToggleAnulacion(row.original.id)}
                        color={row.original.anulado ? "blanco" : "morado"}
                        forma="pastilla"
                    >
                        {row.original.anulado ? 'Reactivar' : 'Anular'}
                    </Boton>
                </div>
            ),
        },*/
    ], [handleToggleAnulacion]);

    const hayCambiosPendientes = listaMovimientos.some(mov => mov.isDirty);

    return (
        <div>
            <h2>Lista de Movimientos Anulados</h2>
            <div className="d-flex justify-content-between mb-4">
                <Link to="/inventario/moves">
                    <Boton color="morado" forma="pastilla">
                        <i className="bi bi-arrow-left-circle-fill me-2"></i>
                        Regresar
                    </Boton>
                </Link>
                <Boton
                    color="blanco"
                    forma="pastilla"
                    onClick={handleSaveChanges}
                    disabled={!hayCambiosPendientes}
                >
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Guardar Cambios
                </Boton>
            </div>
            <TableComponent
                columns={columns}
                data={listaMovimientos}
                globalFilter={filtro}
                onGlobalFilterChange={setFiltro}
                withPagination={true}
            />
        </div>
    )
}; 

export default AnullMovementList;