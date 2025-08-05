import React, { useState } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';

export default function UserManagementView() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const handleEdit = (user) => setSelectedUser(user);
  const handleFinish = () => {
    setSelectedUser(null);
    setRefresh(!refresh);
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      <UserForm selectedUser={selectedUser} onFinish={handleFinish} />
      <hr />
      <UserList onEdit={handleEdit} key={refresh} />
    </div>
  );
}
