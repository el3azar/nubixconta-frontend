import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/users";


const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("nubix_token")}`,
  "Content-Type": "application/json",
})

export const getAllUsers = () =>
  axios.get(API_URL, {
    headers:getAuthHeaders(),
  });

// CREAR USUARIO 
export const createUser = (user) =>
  axios.post(API_URL, user, {
    headers: getAuthHeaders(),
  });

// ACTUALIZAR USUARIO 
export const updateUser = (id, user) =>
  axios.patch(`${API_URL}/${id}`, user, {
    headers: getAuthHeaders(),
  });


