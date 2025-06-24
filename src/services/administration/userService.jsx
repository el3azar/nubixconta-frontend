import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/users";
const token = localStorage.getItem("token");

export const getAllUsers = () =>
  axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

// CREAR USUARIO (envía FormData)
export const createUser = (formData) =>
  axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

// ACTUALIZAR USUARIO (envía FormData)
export const updateUser = (id, formData) =>
  axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

// DESACTIVAR USUARIO (envía JSON simple)
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
