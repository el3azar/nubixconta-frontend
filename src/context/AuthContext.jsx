// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authServices"; 

// Claves para sessionStorage (puedes cambiarlas si quieres)
const TOKEN_KEY = "nubix_token";
const ROLE_KEY = "nubix_role";
// Es una buena práctica tener la clave del accessLogId como constante también
const ACCESS_LOG_ID_KEY = "nubix_access_log_id";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado inicial: lee de sessionStorage si existe
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [role, setRole] = useState(() => {
    const stored = sessionStorage.getItem(ROLE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  });

  // Método para guardar token y rol al hacer login
  const login = (jwt, roleValue, accessLogId) => {
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

      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);