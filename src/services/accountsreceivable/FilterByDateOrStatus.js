import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/accounts-receivable";

const getAuthHeaders = () => {
    const token = sessionStorage.getItem("nubix_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getReceivablesSortedByStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/sorted-by-status`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener cobros ordenados por estado:", error);
        throw error;
    }
};

export const getReceivablesSortedByDate = async () => {
    try {
        const response = await axios.get(`${API_URL}/sorted-by-date`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener cobros ordenados por fecha:", error);
        throw error;
    }
};