import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function UserForm({ user, onSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        password: user.password
      });
      setPreviewUrl(user.photo ? `http://localhost:8080${user.photo}` : null);
    } else {
      reset();
      setPreviewUrl(null);
    }
    setPhotoFile(null);
  }, [user, reset]);

  const onFormSubmit = (data) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    if (photoFile) {
      formData.append('file', photoFile);
    }
    if (user?.id) {
      formData.append('id', user.id);
    }
    onSubmit(formData);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(user?.photo ? `http://localhost:8080${user.photo}` : null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mb-4 p-3 bg-white rounded shadow-sm">
      <h5>{user ? "Editar Usuario" : "Crear Usuario"}</h5>
      <div className="row">
        <div className="col-md-6 mb-2">
          <input placeholder="Nombre" className="form-control" {...register("firstName")} required />
        </div>
        <div className="col-md-6 mb-2">
          <input placeholder="Apellido" className="form-control" {...register("lastName")} required />
        </div>
        <div className="col-md-6 mb-2">
          <input placeholder="Correo" className="form-control" type="email" {...register("email")} required />
        </div>
        <div className="col-md-6 mb-2">
          <input placeholder="Usuario" className="form-control" {...register("userName")} required />
        </div>
        <div className="col-md-6 mb-2">
          <input placeholder="Contraseña" className="form-control" type="password" {...register("password")} required />
        </div>
        <div className="col-md-6 mb-2">
          <input type="file" className="form-control" accept="image/*" onChange={handlePhotoChange} />
        </div>

        {previewUrl && (
          <div className="col-12 mb-3 text-center">
            <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '200px', borderRadius: '10px' }} />
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-success w-100">Guardar</button>
    </form>
  );
}
