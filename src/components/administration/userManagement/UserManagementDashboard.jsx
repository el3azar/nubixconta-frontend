import React, { useState, useEffect } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
} from "../../../services/administration/userService";
import styles from "../../../styles/administration/UserManagementDashboard.module.css";
import { FaUser, FaEdit, FaEye, FaLink, FaEyeSlash } from "react-icons/fa";
import {  FiUserPlus } from 'react-icons/fi';
import Swal from "sweetalert2";
import UserForm from "./UserForm";
import { Building2 } from "lucide-react"

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  /* -------- helpers SweetAlert -------- */
  const toastSuccess = (msg) =>
    Swal.fire({
      icon: "success",
      title: msg,
      timer: 2000,
      showConfirmButton: false,
    });

  const toastError = (msg) =>
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });

  /* -------------- cargar usuarios -------------- */
  const fetchUsers = () =>
    getAllUsers()
    .then((res) => setUsers(res.data))
    .catch((err) => toastError("Error al obtener usuarios"));
    useEffect(() => {
    fetchUsers();
}, []);

  /* -------------- búsqueda segura -------------- */
  const handleSearch = (e) => setQuery(e.target.value.toLowerCase());
  const safe = (v = "") => (v || "").toString().toLowerCase();

  const filteredUsers = users.filter((u) =>
    [u.firstName, u.lastName, u.email, u.userName,u.role].some((field) =>
      safe(field).includes(query)
    )
  );

  /* -------------- CRUD helpers -------------- */
  const handleEdit = (user) => setSelectedUser(user);

  const handleSubmit = (formData) => {
 const promise = formData.id
  ? updateUser(formData.id, formData)
  : createUser(formData);

    promise
      .then(() => {
        toastSuccess("Usuario guardado correctamente");
        setSelectedUser(null);
        fetchUsers();
      })
      .catch((err) =>
        toastError(err.response?.data?.message || err.message)
      );
  };

  const handleToggleActive = (user) => {
    Swal.fire({
      title: "Confirmar acción",
      text: `¿Estás seguro de que deseas ${
        user.status ? "desactivar" : "activar"
      } este usuario?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: user.status ? "Desactivar" : "Activar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

  const updatedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        password: user.password || "",
        status: !user.status
      };

      updateUser(user.id, updatedUser)
   
        .then(() => {
          toastSuccess(
            `Usuario ${!user.status ? "activado" : "desactivado"} correctamente`
          );
          fetchUsers();
        })
        .catch((err) =>
          toastError(err.response?.data?.message || err.message)
        );
    });
  };

  /* -------------- estilos condicionales -------------- */
  const cardStyle = (isActive) =>
    isActive
      ? {}
      : {
          backgroundColor: "#ffcccc", // rojo suave intensificado
        };

  /* -------------- JSX -------------- */
  return (
    <div className="container mt-4">
      <h2 className="mb-4">GESTIÓN DE USUARIOS</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre, apellido, usuario o correo..."
        value={query}
        onChange={handleSearch}
      />

      <UserForm user={selectedUser} onSubmit={handleSubmit} />

      <div className="row">
        {filteredUsers.map((u) => (
          <div className="col-md-4 mb-3" key={u.id}>
            <div className="card shadow-sm h-100" style={cardStyle(u.status)}>
              <div className="card-body">
                <h5 className="card-title">
                  <FaUser /> {u.firstName} {u.lastName}
                </h5>
                <p className="card-text">Correo: {u.email}</p>
                <p className="card-text">Usuario: {u.userName}</p>
                <p className="card-text">
                  Estado:{" "}
                  <strong className={u.status ? "text-success" : "text-danger"}>
                    {u.status ? "Activo" : "Inactivo"}
                  </strong>
                </p>
             <p className="card-text">
                  Rol:{" "}
                  <strong>
                    {u.role ? "Administrador" : "Asistente"}
                  </strong>
                </p>
                <div className="d-flex justify-content-around mt-3"> {/* Cambiado a justify-content-around para distribuir los iconos */}
                  {/* Botón Editar */}
                  <button
                    className={`btn me-2 ${styles.iconButton}`} // me-2 para un pequeño margen a la derecha
                    onClick={() => handleEdit(u)}
                    data-bs-toggle="tooltip" // Atributo para activar el tooltip
                    data-bs-placement="top"  // Posición del tooltip
                    title="Editar"           // Texto del tooltip
                  >
                    <FaEdit />
                  </button>

                  {/* Resto de botones: solo visibles si el rol NO es Administrador (es decir, es Asistente) */}
                 {!u.role && (
                  <>
                  {/* Botón Desactivar/Activar */}
                  <button
                     className={`btn btn-outline-${u.status ? "danger" : "success"} me-2`} // Color dinámico
                    onClick={() => handleToggleActive(u)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={u.status ? "Desactivar" : "Activar"} // Texto dinámico del tooltip
                  >
                    <FaEyeSlash /> {/* Usamos FaTrashAlt como icono */}
                  </button>

                  {/* Botón Asignar Empresa */}
                  <button
                    className={`btn me-2 ${styles.iconButton}`} // Un color diferente para distinguir
                    onClick={() => handleAssignCompany(u)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Asignar empresa"
                  >
                    <FiUserPlus /> {/* Icono de enlace */}
                  </button>

                  {/* Botón Empresas Asignadas */}
                  <button
                    className={`btn me-2 ${styles.iconButton}`} // Otro color
                    onClick={() => handleViewAssignedCompanies(u)}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Empresas asignadas"
                  >
                    <Building2/> {/* Icono de ojo */}
                  </button>
                 </>
                 )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && <p>No se encontraron usuarios.</p>}
      </div>
    </div>
  );
};

export default UserManagementDashboard;
