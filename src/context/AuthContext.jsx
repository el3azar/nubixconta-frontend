// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Claves para sessionStorage (puedes cambiarlas si quieres)
const TOKEN_KEY = "nubix_token";
const ROLE_KEY = "nubix_role";

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
  const login = (jwt, roleValue) => {
    setToken(jwt);
    setRole(roleValue);
    sessionStorage.setItem(TOKEN_KEY, jwt);
    sessionStorage.setItem(ROLE_KEY, roleValue); // Guarda boolean como string
  };

  // Logout global: limpia todo
  const logout = () => {
    setToken(null);
    setRole(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem("empresaActiva");
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
