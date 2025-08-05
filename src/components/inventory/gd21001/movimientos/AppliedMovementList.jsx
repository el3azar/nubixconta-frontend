import { Link } from 'react-router-dom';
import { showSuccess, showError, showInfo } from '../alertstoast';
import { showConfirmationDialog } from '../alertsmodalsa';
import { useState, useMemo, useCallback } from 'react';
import Boton from '../elementos/Boton';
import TableComponent from '../elementos/TableComponent';

    // 1. Datos de ejemplo. El 'estado' inicial es 'pendiente'.
const datosAplicados = [
    { id: 201, codigoProducto: 'SKU-25E', fecha: '2025-08-04', tipo: 'Entrada', observacion: 'Venta Mayorista', estado: 'pendiente', isDirty: false },
    { id: 202, codigoProducto: 'SKU-26F', fecha: '2025-08-04', tipo: 'Salida', observacion: 'Compra Proveedor X', estado: 'pendiente', isDirty: false },
    { id: 203, codigoProducto: 'SKU-27G', fecha: '2025-08-03', tipo: 'Ajuste', observacion: 'Ajuste por conteo', estado: 'pendiente', isDirty: false },
    { id: 204, codigoProducto: 'SKU-28H', fecha: '2025-08-03', tipo: 'Entrada', observacion: 'Venta Cliente Y', estado: 'pendiente', isDirty: false },
];


const AppliedMovementList = () => {

    const [listaMovimientos, setListaMovimientos] = useState(datosAplicados);
    const [filtro, setFiltro] = useState('');

    // 2. Un único handler que recibe el nuevo estado ('aceptado' o 'quitado')
    const handleSetEstado = useCallback((movimientoId, nuevoEstado) => {
        setListaMovimientos(currentMovimientos =>
            currentMovimientos.map(mov =>
                mov.id === movimientoId
                    ? { ...mov, estado: nuevoEstado, isDirty: true }
                    : mov
            )
        );
    }, []);

    // 3. Handler 'Guardar' con la lógica y alerta modificadas
    const handleGuardar = async () => {
        const cambiosPendientes = listaMovimientos.filter(mov => mov.isDirty);
        const movimientosAceptados = cambiosPendientes.filter(mov => mov.estado === 'aceptado');

        if (cambiosPendientes.length === 0) {
            showInfo('No hay cambios para guardar.');
            return;
        }
        
        // Alerta de confirmación con el nuevo texto sobre la irreversibilidad
        const result = await showConfirmationDialog(
            'Confirmar Cambios',
            `Se aceptarán ${movimientosAceptados.length} movimiento(s). Una vez aceptados, los cambios son irreversibles.`,
            'Sí, guardar y finalizar',
            'Cancelar'
        );

        if (result.isConfirmed) {
            try {
                // Solo se envían al backend los movimientos ACEPTADOS
                console.log('Enviando al backend (Aceptados):', movimientosAceptados);
                // await api.post('/movimientos/finalizar', movimientosAceptados);
                
                showSuccess('¡Los cambios se han guardado exitosamente!');

                // Lógica post-guardado: los aceptados se bloquean y los quitados se eliminan de la lista
                setListaMovimientos(currentMovimientos =>
                    currentMovimientos
                        .map(mov => {
                            if (mov.isDirty && mov.estado === 'aceptado') {
                                // Se limpian y se podrían marcar como finalizados
                                return { ...mov, isDirty: false }; 
                            }
                            return mov;
                        })
                        .filter(mov => mov.estado !== 'quitado') // Se quitan los rechazados de la vista
                );
            } catch (error) {
                showError('Error al guardar los cambios.');
                console.error(error);
            }
        }
    };

    // 4. Columnas con dos botones de acción y nueva columna de estado
    const columns = useMemo(() => [
        { header: 'Codigo Producto', accessorKey: 'codigoProducto' },
        { header: 'Fecha', accessorKey: 'fecha' },
        { header: 'Tipo', accessorKey: 'tipo' },
        { header: 'Observación', accessorKey: 'observacion' },
        {
            header: 'Estado',
            id: 'estado',
            cell: ({ row }) => {
                const estado = row.original.estado;
                const color = estado === 'aceptado' ? 'success' : estado === 'quitado' ? 'danger' : 'secondary';
                return <span className={`badge bg-${color}`}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
            }
        },
        {
            header: 'Acciones',
            id: 'acciones',
            // --- CAMBIO PRINCIPAL AQUÍ ---
            // Se elimina la lógica 'isPending' para que los botones siempre estén activos
            // a menos que el estado ya sea 'finalizado'.
            cell: ({ row }) => {
                const isFinalizado = row.original.estado === 'finalizado';
                return (
                    <div className="d-flex justify-content-center gap-2">
                        <Boton onClick={() => handleSetEstado(row.original.id, 'aceptado')} color="morado" disabled={isFinalizado} forma="pastilla">
                            <i class="bi bi-check2-all me-2"></i>
                            Aceptar
                        </Boton>
                        <Boton onClick={() => handleSetEstado(row.original.id, 'quitado')} color="blanco" disabled={isFinalizado} forma="pastilla">
                            <i class="bi bi-x-circle me-2"></i>
                            Quitar
                        </Boton>
                    </div>
                );
            },
        },
    ], [handleSetEstado]);

    const hayCambiosPendientes = listaMovimientos.some(mov => mov.isDirty);

    return (
        <div>
            <h2>Lista de Movimientos Aplicados</h2>
            <div className="d-flex justify-content-between mb-4">
                <Link to="/inventario/moves">
                    <Boton color="morado" forma="pastilla">
                        <i className="bi bi-arrow-left-circle-fill me-2"></i>
                        Regresar
                    </Boton>
                </Link>
                <Boton color="blanco" forma="pastilla" onClick={handleGuardar} disabled={!hayCambiosPendientes}>
                    <i class="bi bi-floppy me-2"></i>
                    Guardar
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

export default AppliedMovementList;