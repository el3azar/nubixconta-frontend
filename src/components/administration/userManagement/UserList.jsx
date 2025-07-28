/*import React, { useEffect, useState } from "react";
import { getUsersByAssistant } from "../../../services/administration/company/usersByAssistanService";


const UserList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsersByAssistant()
      .then((res) => {
        setUsers(res);
      })
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  return (
    <div>
      <h2>Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.userName}</td>
              <td>
                <button onClick={() => onEdit(u)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
*/
