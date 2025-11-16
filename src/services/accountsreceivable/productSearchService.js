export const searchProducts = async (code, name) => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/products`, {
      params: { code, name },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error buscando productos:", error);
    return [];
  }
};
