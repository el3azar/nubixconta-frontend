export const searchProducts = async (code, name) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.get(`https://nubixconta-backend-production.up.railway.app/api/v1/products`, {
      params: { code, name },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error buscando productos:", error);
    return [];
  }
};
