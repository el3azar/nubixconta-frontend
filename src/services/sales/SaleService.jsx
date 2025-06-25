import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/sales";

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const SaleService = () => {
  const { token } = useAuth();

  // === Ventas ===

  const getAllSales = async () => {
    const res = await axios.get(API_URL, getAuthHeader(token));
    return res.data;
  };

  const getSaleById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader(token));
    return res.data;
  };

  const createSale = async (saleData) => {
    const res = await axios.post(API_URL, saleData, getAuthHeader(token));
    return res.data;
  };

  const updateSale = async (id, updates) => {
    const res = await axios.patch(`${API_URL}/${id}`, updates, getAuthHeader(token));
    return res.data;
  };

  const deleteSale = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader(token));
    return res.data;
  };

  const searchSalesByDate = async (start, end) => {
    const res = await axios.get(`${API_URL}/search?start=${start}&end=${end}`, getAuthHeader(token));
    return res.data;
  };

  const searchSalesByCustomer = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const res = await axios.get(`${API_URL}/client-search?${params}`, getAuthHeader(token));
    return res.data;
  };

  // === Detalles de venta ===

  const getAllSaleDetails = async () => {
    const res = await axios.get(`${API_URL}/details`, getAuthHeader(token));
    return res.data;
  };

  const getSaleDetailsBySaleId = async (saleId) => {
    const res = await axios.get(`${API_URL}/${saleId}/details`, getAuthHeader(token));
    return res.data;
  };

  const getSaleDetailById = async (detailId) => {
    const res = await axios.get(`${API_URL}/details/${detailId}`, getAuthHeader(token));
    return res.data;
  };

  const createSaleDetail = async (saleId, detailData) => {
    const res = await axios.post(`${API_URL}/${saleId}/details`, detailData, getAuthHeader(token));
    return res.data;
  };

  const updateSaleDetail = async (detailId, updates) => {
    const res = await axios.patch(`${API_URL}/details/${detailId}`, updates, getAuthHeader(token));
    return res.data;
  };

  const deleteSaleDetail = async (detailId) => {
    const res = await axios.delete(`${API_URL}/details/${detailId}`, getAuthHeader(token));
    return res.data;
  };

  return {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    searchSalesByDate,
    searchSalesByCustomer,

    getAllSaleDetails,
    getSaleDetailsBySaleId,
    getSaleDetailById,
    createSaleDetail,
    updateSaleDetail,
    deleteSaleDetail,
  };
};

export { SaleService };
