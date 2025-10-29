// src/services/accounting/CatalogService.jsx
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8080/api/v1/catalogs';

const getAuthHeader = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const useCatalogService = () => {
    const { token } = useAuth();

    const searchCatalogs = async (term) => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { term: term || '' },
                ...getAuthHeader(token)
            });

        
            return response.data.map(item => ({
                value: String(item.id),       
                label: `${item.accountCode} - ${item.accountName}` 
            }));
            // --- FIN DE LA CORRECCIÓN ---

        } catch (error) {
            console.error("Error searching catalogs:", error);
            throw error; // Propaga el error para que el componente padre lo maneje
        }
    };

    return {
        searchCatalogs,
    };
};