import axios from "axios";
//Este enpoint trae el listado de todos los usuarios asistentes
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/users/assistant`;
export const getUsersByAssistant = async () => {
  try {
    const token = sessionStorage.getItem("nubix_token");
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las usuarios:", error);
    return [];
  }
};