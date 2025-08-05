import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from "../../../styles/sales/ViewCustomers.module.css";

export default function UserForm({ user, onSubmit }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        userName: user.userName || '',
        password: user.password || '',
      });
    } else {
      reset();
    }
  }, [user, reset]);

  const onFormSubmit = (data) => {
    const userPayload = {
      ...data,
      id: user?.id || undefined // incluir id solo si estás editando
    };

    console.log("Payload enviado:", userPayload); // para depuración
    onSubmit(userPayload);
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
      </div>
      <button type="submit" className={`btn w-100 ${styles.actionButton}`}>Guardar</button>
    </form>
  );
}
