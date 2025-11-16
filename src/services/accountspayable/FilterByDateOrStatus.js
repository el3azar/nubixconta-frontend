import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/accounts-payable`;

const getAuthHeaders = () => {
    const token = sessionStorage.getItem("nubix_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getPayableSortedByStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/sorted-by-status`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener cobros ordenados por estado:", error);
        throw error;
    }
};

export const getPayableSortedByDate = async () => {
    try {
        const response = await axios.get(`${API_URL}/sorted-by-date`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener cobros ordenados por fecha:", error);
        throw error;
    }
};
export const getPayableFilteredByDateRange = async (startDate, endDate) => {
    try {
        const response = await axios.get(
            `${API_URL}/filter-by-date`,
            {
                params: {
                    startDate: startDate, // Formato YYYY-MM-DD
                    endDate: endDate    // Formato YYYY-MM-DD
                },
                ...getAuthHeaders()
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al filtrar cobros por rango de fechas:", error);
        throw error;
    }
};