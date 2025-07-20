import React, { useState, useEffect } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
} from "../../../services/administration/userService";
import { FaUser, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import UserForm from "./UserForm";

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
    [u.firstName, u.lastName, u.email, u.userName].some((field) =>
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

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(u)}
                  >
                    <FaEdit /> Editar
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleToggleActive(u)}
                  >
                    <FaTrash /> {u.status ? "Desactivar" : "Activar"}
                  </button>
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
