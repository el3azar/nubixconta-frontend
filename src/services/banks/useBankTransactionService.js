import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
const API_URL = 'http://localhost:8080/api/v1/bank-transactions';

const getAuthHeader = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const useBankTransactionService = () => {
    const { token } = useAuth();

  
    /**
     * Filtra transacciones bancarias por el nombre o código de una cuenta bancaria,
     * y opcionalmente por rango de fechas.
     * @param {string} accountFilter - Término de búsqueda para la cuenta.
     * @param {string} [startDate] - Fecha de inicio en formato YYYY-MM-DD.
     * @param {string} [endDate] - Fecha de fin en formato YYYY-MM-DD.
     * @returns {Promise<Array>} Lista de TransactionBankDTOs.
     */
    const filterTransactionsByAccount = async (accountFilter, startDate, endDate) => {
        try {
            const params = {
                accountFilter: accountFilter,
            };
           

            const response = await axios.get(`${API_URL}/filter-by-account`, {
                params: params,
                ...getAuthHeader(token)
            });
            return response.data;
        } catch (error) {
            console.error("Error filtering bank transactions by account:", error);
            throw error;
        }
    };

  


    return {
        filterTransactionsByAccount
    };
};