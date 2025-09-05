import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authServices";
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = "nubix_token";
const ROLE_KEY = "nubix_role";
const ACCESS_LOG_ID_KEY = "nubix_access_log_id";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);

   // --- CAMBIO: Estado para el objeto de usuario decodificado ---
  const [user, setUser] = useState(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    try {
      return storedToken ? jwtDecode(storedToken) : null;
    } catch (error) {
      console.error("Token inválido en sessionStorage al iniciar:", error);
      return null;
    }
  });



  const [role, setRole] = useState(() => {
    const stored = sessionStorage.getItem(ROLE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  });

  // Método para guardar token y rol al hacer login
  const login = (jwt, roleValue, accessLogId) => {
    try {
      // --- CAMBIO: Al hacer login, decodifica el nuevo token ---
      const decodedUser = jwtDecode(jwt);
       // DEBUG: Para ver qué contiene tu token
      console.log("Token decodificado:", decodedUser); 
      setUser(decodedUser);
    } catch (error) {
      console.error("Error al decodificar el token en login:", error);
      setUser(null);
    }
    setToken(jwt);
    setRole(roleValue);
    sessionStorage.setItem(TOKEN_KEY, jwt);
    sessionStorage.setItem(ROLE_KEY, roleValue); // Guarda boolean como string
    // Guardamos el ID del log para usarlo al cerrar sesión
    if (accessLogId) {
      sessionStorage.setItem(ACCESS_LOG_ID_KEY, accessLogId);
    }
  };

  /**
   * Logout global: Notifica al backend y luego limpia el estado del frontend.
   * Ahora es una función asíncrona.
   */
  const logout = async () => {
    const currentToken = sessionStorage.getItem(TOKEN_KEY);
    const accessLogId = sessionStorage.getItem(ACCESS_LOG_ID_KEY);

    // Usamos un bloque try/finally para asegurar que el frontend siempre se limpie,
    // incluso si la llamada a la API falla.
    try {
      if (currentToken && accessLogId) {
        // 1. Notificar al backend que estamos cerrando sesión.
        await authService.logout({ accessLogId: parseInt(accessLogId, 10) }, currentToken);
      }
    } catch (error) {
      // Generalmente, no necesitamos hacer nada aquí. El error ya se muestra en la consola
      // desde el servicio. Lo más importante es que el usuario SÍ pueda cerrar sesión del frontend.
    } finally {
      // 2. Limpiar todo en el frontend, sin importar el resultado de la API.
      setToken(null);
      setRole(null);
      setUser(null);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem("empresaActiva");
      sessionStorage.removeItem(ACCESS_LOG_ID_KEY); // Limpiamos también el log ID
    }
  };
  
  // Sincroniza el contexto si el storage cambia en otras pestañas/ventanas
  useEffect(() => {
    const syncLogout = () => {
      if (!sessionStorage.getItem(TOKEN_KEY)) {
        setToken(null);
        setRole(null);
        setUser(null); // Sincroniza también el estado del usuario
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);



   // Exponer el 'user' en el valor del contexto ---
  const contextValue = { token, role, user, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);