import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8080/api/v1/bank-transactions';

const getAuthHeader = (token) => {
    if (!token) {
        console.warn("No authentication token available for bank transaction service.");
        return {};
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const useBankTransactionService = () => {
    const { token } = useAuth();

    // ... (la función createBankTransaction permanece igual)
    const createBankTransaction = async (transactionData) => {
        // ...
    };

    // --- FUNCIÓN DE FILTRADO CORREGIDA Y ROBUSTA ---
    const filterTransactionsByAccount = async (accountName, startDate, endDate) => {
        try {
            const config = getAuthHeader(token);
            const params = new URLSearchParams();
            
            // Solo añadir los parámetros si tienen un valor
            if (accountName) {
                params.append('accountName', accountName);
            }
            if (startDate) {
                params.append('startDate', startDate);
            }
            if (endDate) {
                params.append('endDate', endDate);
            }

            const response = await axios.get(`${API_URL}/filter?${params.toString()}`, config);
            // Si la respuesta es exitosa pero no hay datos, axios no lanzará un error.
            // El backend podría devolver un array vacío, lo cual es correcto.
            return response.data || []; 
        } catch (error) {
            // Manejar específicamente el caso de "No Content" si el backend lo usa
            if (error.response && error.response.status === 204) {
                return [];
            }
            console.error('Error filtering bank transactions:', error);
            throw error;
        }
    };

    return {
        createBankTransaction,
        filterTransactionsByAccount, // Exportar la función
    };
};