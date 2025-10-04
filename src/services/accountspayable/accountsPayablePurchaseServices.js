import axios from 'axios';
//Este enpoint trae todos los registros asociados a accounts-receivable
const BASE_URL = 'http://localhost:8080/api/v1/accounts-payable';

// Endpoint para la vista de Liquidaciones (Collections)
export const fetchPayableDetails = async () => {
    try {
        const token = sessionStorage.getItem('nubix_token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(BASE_URL, { headers, withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error al obtener liquidaciones:', error);
        throw error;
    }
};


// Endpoint para la vista de Ventas Resumidas (Sales Summary)
export const fetchPurchaseSummary = async () => {
    try {
        const token = sessionStorage.getItem('nubix_token');
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${BASE_URL}/purcharse-summary`;
        const response = await axios.get(url, { headers, withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el resumen de las compras:', error);
        throw error;
    }
};
