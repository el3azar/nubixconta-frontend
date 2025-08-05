// src/utils/dateFormatter.js

/**
 * Formatea una fecha (objeto Date o string ISO) al formato DD/MM/YYYY.
 * Si la fecha es inválida o nula, devuelve un placeholder.
 * @param {Date|string} dateInput - La fecha a formatear.
 * @returns {string} La fecha formateada como "DD/MM/YYYY" o un texto de fallback.
 */
export const formatDate = (dateInput) => {
  // Si no hay fecha de entrada, devuelve un placeholder.
  if (!dateInput) {
    return 'N/A';
  }

  // Crea un objeto Date. Esto funciona si dateInput es ya un objeto Date
  // o si es un string como "2025-07-20T10:30:00".
  const date = new Date(dateInput);

  // Comprueba si la fecha creada es válida.
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  // Extrae los componentes de la fecha LOCAL del usuario.
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Se suma 1 porque los meses en JS van de 0 a 11
  const year = date.getFullYear();

  // Devuelve el string formateado.
  return `${day}/${month}/${year}`;
};