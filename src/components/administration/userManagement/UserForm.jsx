import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from "../../../styles/shared/EntityForm.module.css";
import { FaLock } from 'react-icons/fa6';
import formStyles from '../../../styles/shared/EntityListView.module.css';

export default function UserForm({ user, onSubmit, onOpenPasswordModal }){
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        userName: user.userName || '',
      });
    } else {
      reset();
    }
  }, [user, reset]);

  const onFormSubmit = (data) => {
    // Si el usuario es administrador, no permitimos la edición.
    if (user && user.role) { 
        return;
    }
    const userPayload = {
      ...data,
      id: user?.id || undefined // incluir id solo si estás editando
    };
     onSubmit(userPayload);
  };
   // Comprobamos si el usuario es un administrador
 const isUserAdmin = user && user.role;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mb-4 p-3 bg-white rounded shadow-sm">
         <h5>{user ? "Editar Usuario" : "Crear Usuario"}</h5>
       <div className="row">
         <div className="col-md-6 mb-2">
           <input 
           placeholder="Nombre" 
           className="form-control" 
               {...register("firstName")} 
             required 
              readOnly={isUserAdmin} // <--- CAMBIO CLAVE: Solo lectura si es admin
           />
           </div>
           <div className="col-md-6 mb-2">
         <input 
             placeholder="Apellido" 
             className="form-control" 
               {...register("lastName")} 
               required 
               readOnly={isUserAdmin} // <--- CAMBIO CLAVE
                 />
         </div>
         <div className="col-md-6 mb-2">
           <input 
            placeholder="Correo" 
           className="form-control" 
             type="email" 
             {...register("email")} 
             required 
             readOnly={isUserAdmin} // <--- CAMBIO CLAVE
             />
           </div>
           <div className="col-md-6 mb-2">
           <input 
               placeholder="Usuario" 
             className="form-control" 
             {...register("userName")} 
           required 
             readOnly={isUserAdmin} // <--- CAMBIO CLAVE
           />
         </div>
           {!user && (
            <div className="col-md-6 mb-2"> 
             <input placeholder="Contraseña" className="form-control" type="password" {...register("password")} required />
            </div>
           )}

         {user && (
             <div className="col-md-6 mb-2">
             <button
               type="button" 
               className={`btn btn-secondary w-100 ${formStyles.registrar}`}
               onClick={() => onOpenPasswordModal (user)}
               >
                   <FaLock className="me-2" /> Cambiar Contraseña
             </button>
           </div>
         )}
         </div>
       
 <div className="d-flex justify-content-center">
  <button 
    type="submit" 
    className={`btn btn-primary w-30 ${styles.actionButton}`}
    disabled={isUserAdmin}
  >
    Guardar
  </button>
</div>

     </form>
  );
}
