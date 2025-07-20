import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/users";
const token = localStorage.getItem("token");
//const API_URL = "https://nubixconta-backend-production.up.railway.app/api/v1/users";
export const getAllUsers = () =>
  axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

// CREAR USUARIO (JSON)
export const createUser = (user) =>
  axios.post(API_URL, user, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// ACTUALIZAR USUARIO (JSON)
export const updateUser = (id, user) =>
  axios.put(`${API_URL}/${id}`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// DESACTIVAR USUARIO (JSON)
export const deactivateUser = (id) =>
  axios.put(
    `${API_URL}/${id}`,
    { status: false },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
