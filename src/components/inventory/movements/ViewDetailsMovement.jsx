import React from 'react';
import Boton from '../inventoryelements/Boton';
import { formatDate } from '../../../utils/dateFormatter'; // ¡IMPORTANTE! Necesitamos formatear la fecha


const ViewDetailsMovement = ({ show, onClose, movement }) => {
    if (!show) {
        return null;
    }

    // Usamos el operador de encadenamiento opcional (?.) para máxima seguridad
    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content text-black p-4 rounded" style={{ backgroundColor: '#6B5E80' }}>
                    <div className="modal-header border-0 pb-0">
                        <h2 className="modal-title text-center w-100">Detalles del Movimiento</h2>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* ================================================================ */}
                        {/* == ESTA ES LA SECCIÓN CORREGIDA CON LOS NOMBRES DE CAMPO REALES == */}
                        {/* ================================================================ */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Fecha</label>
                                <input type="text" className="form-control" value={formatDate(movement?.date) || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Tipo de Movimiento</label>
                                <input type="text" className="form-control" value={movement?.movementType || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Módulo Origen</label>
                                <input type="text" className="form-control" value={movement?.originModule || ''} readOnly />
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-12">
                                <label className="form-label fw-bold">Descripción / Observación</label>
                                <textarea className="form-control" rows="4" value={movement?.description || ''} readOnly></textarea>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <h3 className="text-center mb-4">Detalles del Producto</h3>
                        <div className="row mb-4">
                             <div className="col-md-4">
                                <label className="form-label fw-bold">Código de Producto</label>
                                <input type="text" className="form-control" value={movement?.product?.productCode || ''} readOnly />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-bold">Nombre de Producto</label>
                                <input type="text" className="form-control" value={movement?.product?.productName || ''} readOnly />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Cantidad Movida</label>
                                <input type="text" className="form-control" value={movement?.quantity || ''} readOnly />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Stock Resultante</label>
                                <input type="text" className="form-control" value={movement?.stockAfterMovement || ''} readOnly />
                            </div>
                        </div>


                        {/* --- Botón para cerrar (sin cambios) --- */}
                        <div className="d-flex justify-content-center mt-4">
                            <Boton color="blanco" onClick={onClose}>Cerrar</Boton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewDetailsMovement;