import React, { useState } from "react";
import styles from "../../styles/inventory/ProductRow.module.css";
import { updateProduct } from "../../services/inventory/ProductEditService";
import { showSuccess, showError } from "../../components/inventory/alerts";
import { FaEdit } from "react-icons/fa";

const ProductRow = ({ product, onEdit, onStatusUpdated }) => {
  const [status, setStatus] = useState(product.productStatus);

  const handleStatusChange = async () => {
    const newStatus = !status;
    try {
      await updateProduct(product.idProduct, { productStatus: newStatus });
      setStatus(newStatus);
      if (onStatusUpdated) {
        onStatusUpdated(product.idProduct, newStatus);
      }
      showSuccess("Estado del producto cambiado con éxito");
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
      showError("Ocurrió un error: " + error.message);
    }
  };

  return (
    <tr className={!status ? styles.disabledRow : ""}>
      <td>{product.productCode}</td>
      <td>{product.productName}</td>
      <td>{product.unit}</td>
      <td>{product.stockQuantity}</td>
      <td>{(product.stockQuantity) *2}</td>
      <td>{new Date(product.productDate).toLocaleDateString()}</td>
      <td className="d-flex gap-3 justify-content-center align-items-center">
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={status}
            onChange={handleStatusChange}
          />
          <span className={styles.slider}></span>
        </label>
        <FaEdit
          title="Editar producto"
          style={{ cursor: "pointer", color: "#1B043B" }}
          onClick={() => onEdit(product)}
        />
      </td>
    </tr>
  );
};

export default ProductRow;
