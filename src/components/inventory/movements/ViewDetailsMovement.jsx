import React from 'react';
import Boton from '../inventoryelements/Boton';

// AÑADIMOS LAS PROPS: show, onClose y movement
const ViewDetailsMovement = ({ show, onClose, movement }) => {
    // Si show es falso, no renderizamos nada.
    if (!show) {
        return null;
    }

    // Usamos el operador de encadenamiento opcional (?.) para evitar errores si `movement` es nulo
    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
                    <div className="modal-header border-0 pb-0">
                        <h2 className="modal-title text-center w-100">Detalles del Movimiento</h2>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Sección de detalles generales */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Fecha</label>
                                <input type="text" className="form-control" value={movement?.fecha || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Tipo de Movimiento</label>
                                <input type="text" className="form-control" value={movement?.tipo || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Módulo</label>
                                <input type="text" className="form-control" value={movement?.modulo || ''} readOnly /> {/* Asumimos que `module` existe en tus datos */}
                            </div>
                        </div>

                        {/* Sección de observación */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <label className="form-label fw-bold">Observación</label>
                                <textarea className="form-control" rows="4" value={movement?.observacion || ''} readOnly></textarea>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Título y detalles del producto */}
                        <h3 className="text-center mb-4">Detalles del Producto</h3>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Código de Producto</label>
                                <input type="text" className="form-control" value={movement?.codigoProducto || ''} readOnly /> {/* Asumimos `productCode` */}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nombre de Producto</label>
                                <input type="text" className="form-control" value={movement?.productName || ''} readOnly /> {/* Asumimos `productName` */}
                            </div>
                        </div>

                        {/* Botón para cerrar el modal */}
                        <div className="d-flex justify-content-center mt-4">
                            <Boton className="rounded-pill me-2" color="blanco" onClick={onClose}>Cerrar</Boton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewDetailsMovement;