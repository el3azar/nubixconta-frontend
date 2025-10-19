import React from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';

const ViewBankTransaction = () => {
    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();
    const handleReturnTransaction = () => {
        // Ejemplo de ruta para volver a la lista de transacciones
        navigate('/bancos/transacciones'); 
    }
    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h2>Ver Transacción de Banco</h2>
        </div>
        <div>
            <Boton color="morado" forma="pastilla" onClick={handleReturnTransaction}>
                <i className="bi bi-arrow-left me-2"></i>
                Volver
            </Boton>
        </div>
        </>
    )
}   

export default ViewBankTransaction;