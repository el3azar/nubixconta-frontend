import React from "react";
import Boton from "../inventory/inventoryelements/Boton";
import { useNavigate } from "react-router-dom";
import SubMenu from "../shared/SubMenu";
import { banksSubMenuLinks } from '../../config/menuConfig';
const Pruebas = () => {

    // 1. Inicializar el hook de navegación
    const navigate = useNavigate();

    // 2. Definir funciones (handlers) para la navegación
    // NOTA: Debes usar las RUTAS (strings) que tienes definidas en tu router
    const handleNew = () => {
        // Ejemplo de ruta para crear una nueva transacción
        navigate('/bancos/nueva'); 
    };
    
    // Asumiendo que necesitas un ID para editar/ver una transacción específica
    const handleEdit = () => {
        // Ejemplo de ruta con un ID
        navigate('/bancos/editar');
    };
    
    const handleView = () => {
        // Ejemplo de ruta con un ID
        navigate('/bancos/ver'); 
    };

    return (
        <>
        <div>
            <SubMenu links={banksSubMenuLinks} />
        </div>
        <div>
            <h1>Pruebas</h1>
        </div>
        <Boton color="morado" forma="pastilla" onClick={handleNew}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva
        </Boton>
        <Boton color="morado" forma="pastilla" onClick={handleEdit}>
            <i className="bi bi-plus-circle me-2"></i>
            Editar
        </Boton>
        <Boton color="morado" forma="pastilla" onClick= {handleView}>
            <i className="bi bi-plus-circle me-2"></i>
            Ver
        </Boton>
        </>
    );
};  

export default Pruebas;

//cuando funcionen las acciones se puede borrar este elemento