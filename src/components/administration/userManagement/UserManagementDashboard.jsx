import React, { useState, useEffect } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
} from "../../../services/administration/userService";
import styles from "../../../styles/administration/UserManagementDashboard.module.css";
import { FaUser, FaEdit,FaEye, FaEyeSlash } from "react-icons/fa";
import {  FiUserPlus } from 'react-icons/fi';
import Swal from "sweetalert2";
import UserForm from "./UserForm";
import { Building,Search } from "lucide-react"
import AssignCompanyModal from "./AssignCompanyModal"


const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToAssignCompany, setUserToAssignCompany] = useState(null);

  /* -------- helpers SweetAlert -------- */
const showSuccess = (msg) =>
    Swal.fire({
      icon: "success",
      title: msg,
      timer: 2000,
      showConfirmButton: false,
    });

  const showError = (msg) =>
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });

  /* -------------- cargar usuarios -------------- */
  const fetchUsers = () =>
    getAllUsers()
    .then((res) => setUsers(res.data))
    .catch((err) => showError("Error al obtener usuarios"));

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
        showSuccess("Usuario guardado correctamente");
        setSelectedUser(null);
        fetchUsers();
      })
      .catch((err) =>
        showError(err.response?.data?.message || err.message)
      );
  };

   const handleAssignCompany = (user) => {
    setUserToAssignCompany(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToAssignCompany(null);
  };

    const handleAssign = (userId, companies) => {
    // Aquí iría la lógica para asignar la empresa al usuario
    console.log(`Asignando empresas al usuario ${userId}:`, companies);
    // Llama a tu servicio para guardar los cambios
    // Por ejemplo: assignCompaniesToUser(userId, companies.map(c => c.id))
    showSuccess("Empresas asignadas correctamente");
  };



  // Función para activar/desactivar un usuario
  const handleToggleActive = (user) => {
    Swal.fire({
      title: "Confirmar acción",
      text: `¿Estás seguro de que deseas ${
        user.status ? "desactivar" : "activar" // Texto dinámico según el estado actual
      } este usuario?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: user.status ? "Desactivar" : "Activar", // Texto del botón de confirmación
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      // Crea un objeto con los datos del usuario, invirtiendo el valor de 'status'
      const updatedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        password: user.password || "", 
        status: !user.status, // ¡Aquí se invierte el estado!
      };

      // Llama a la función updateUser del servicio para enviar los cambios al backend
      updateUser(user.id, updatedUser)
        .then(() => {
          toastSuccess(
            `Usuario ${!user.status ? "activado" : "desactivado"} correctamente`
          );
          fetchUsers(); // Vuelve a cargar la lista de usuarios para reflejar el cambio
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
                        className={`btn btn-outline-${u.status ? "danger" : "success"} me-2`}
                        onClick={() => handleToggleActive(u)}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={u.status ? "Desactivar" : "Activar"}
                      >
                        {/* El icono cambia según el estado del usuario */}
                        {u.status ? <FaEyeSlash /> : <FaEye />}
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
                    <Building/> {/* Icono de ojo */}
                  </button>
                 </>
                 )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && <p>No se encontraron usuarios.</p>}

        {/* Aquí se renderiza el modal */}
      <AssignCompanyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAssignCompany={handleAssign}
        user={userToAssignCompany}
        showSuccess={showSuccess} // <-- ¡Propiedad añadida!
        showError={showError} 
      />
      </div>
    </div>
  );
};

export default UserManagementDashboard;
