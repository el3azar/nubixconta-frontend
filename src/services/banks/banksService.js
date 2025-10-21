
// Servicios de transacciones bancarias para la API (revisar y actualizar luego)
const BASE_URL = "http://localhost:8080/api/v1/bank-transactions";

/**
 * Obtiene todas las transacciones bancarias
 */
export const getBankTransactions = async (token) => {
  const response = await fetch(BASE_URL, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error al obtener transacciones: ${message}`);
  }

  return response.json();
};

/**
 * Crea una nueva transacción bancaria
 */
export const createBankTransaction = async (transaction, token) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error al crear transacción: ${message}`);
  }

  return response.json();
};

/**
 * Elimina una transacción bancaria por ID
 */
export const deleteBankTransaction = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error al eliminar transacción: ${message}`);
  }

  return true;
};
