// src/components/shared/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Este componente no renderiza nada visualmente.
 * Su única función es detectar un cambio en la ruta (URL)
 * y ejecutar el comando para mover el scroll al inicio de la página.
 */
export default function ScrollToTop() {
  // El hook 'useLocation' nos da información sobre la ruta actual.
  const { pathname } = useLocation();

  // 'useEffect' se ejecutará cada vez que el 'pathname' cambie.
  useEffect(() => {
    // Esta es la instrucción del navegador para ir a la posición (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // El array de dependencias asegura que solo se ejecute al cambiar de ruta.

  // No devuelve ningún elemento JSX.
  return null;
}