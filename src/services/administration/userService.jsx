import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/users";


const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("nubix_token")}`,
  "Content-Type": "application/json",
})
//const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/users";
export const getAllUsers = () =>
  axios.get(API_URL, {
    headers:getAuthHeaders(),
  });

// CREAR USUARIO (JSON)
export const createUser = (user) =>
  axios.post(API_URL, user, {
    headers: getAuthHeaders(),
  });

// ACTUALIZAR USUARIO (JSON)
export const updateUser = (id, user) =>
  axios.patch(`${API_URL}/${id}`, user, {
    headers: getAuthHeaders(),
  });

// DESACTIVAR USUARIO (JSON)
export const deactivateUser = (id) =>
  axios.put(
    `${API_URL}/${id}`,
    { status: false },
    {
      headers:getAuthHeaders(),
    }
  );
