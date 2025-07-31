// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { logoutService } from "../services/LogoutService";

// Claves para sessionStorage (puedes cambiarlas si quieres)
const TOKEN_KEY = "nubix_token";
const ROLE_KEY = "nubix_role";
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

  const [accessLogId, setAccessLogId] = useState(() => {
        const storedLogId = sessionStorage.getItem(ACCESS_LOG_ID_KEY);
        return storedLogId && storedLogId !== "undefined" ? Number(storedLogId) : null;
    });
  // Método para guardar token y rol al hacer login
  const login = (jwt, roleValue,logId) => {
    setToken(jwt);
    setRole(roleValue);

    // Convertir logId a número y solo guardar si es válido
    const numericLogId = (logId !== null && logId !== undefined && logId !== "undefined") ? Number(logId) : null;
    setAccessLogId(numericLogId);
    sessionStorage.setItem(TOKEN_KEY, jwt);
    sessionStorage.setItem(ROLE_KEY, roleValue);
     if (numericLogId !== null) {
        sessionStorage.setItem(ACCESS_LOG_ID_KEY, numericLogId.toString()); 
    } else {
        sessionStorage.removeItem(ACCESS_LOG_ID_KEY); 
    }// <-- Guarda el accessLogId
  };


const logout = async () => { 

    if (accessLogId && token) { 
        try {
            await logoutService(token, accessLogId);
            console.log("Sesión registrada como cerrada en el backend.");
        } catch (error) {
            console.error('Error al intentar registrar cierre de sesión en backend:', error);
        }
    }

    
    setToken(null);
    setRole(null);
    setAccessLogId(null); 
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem("empresaActiva");
    sessionStorage.removeItem(ACCESS_LOG_ID_KEY);
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
