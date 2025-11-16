import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/bank-transactions`;

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

    
    const createBankTransaction = async (transactionData) => {
        try {
            
            const response = await axios.post(`${API_URL}/full`, transactionData, getAuthHeader(token));
            return response.data;
        } catch (error) {
            console.error('Error creating full bank transaction:', error);
    
            throw error;
        }
    };

  
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