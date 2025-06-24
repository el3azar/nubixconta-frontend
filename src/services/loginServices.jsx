import axios from "axios";

//metodo para iniciar sesion
const loginService = async (user) => {
  try {
    const response = await axios.post(
      "https://nubixconta-backend-production.up.railway.app/api/v1/auth/login", // <-- cambia el host si es necesario
      user
    );
    return response.data; // Espera: { token, role }
  } catch (error) {
    console.error("Error al autenticarse", error);
    return null;
  }
};

export { loginService };