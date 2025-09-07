import React, { useState } from 'react';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';
import { FaArrowRightToBracket } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; 
import { authService } from '../services/authServices';
// 1. Importamos el objeto 'Notifier' en lugar de las funciones individuales.
import { Notifier } from '../utils/alertUtils';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useAuth(); // <- Método de tu context
    

    const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingToastId = Notifier.loading('Iniciando sesión...');

    try {
      const payload = {
        userName: data.userName,
        password: data.password
      };
      
      const response = await authService.login(payload);

      login(response.token, response.role, response.accessLogId);

      Notifier.dismiss(loadingToastId);
      Notifier.success(`¡Bienvenido a NubixConta, ${data.userName}!`);

      if (response.role === true || response.role === 'true') {
        navigate("/admin");
      } else {
        navigate("/empresas");
      }
    } catch (error) {
      Notifier.dismiss(loadingToastId);

      const errorMessage = error.response?.data || 'No se pudo conectar con el servidor.';

      Notifier.showError('No se pudo iniciar sesión', errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <section className={styles.formContainer}>
        <h1 className='text-center mb-4'>
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit(handleLoginSubmit)}>
          <article>
            <p className='text-white'>
              <FaInfoCircle className=" me-2" /> Ingresa tus credenciales para acceder al sistema
            </p>
          </article>
          <article className="mb-3">
            <label htmlFor="userName" className='text-white'>Usuario</label>
            <input
              type="text"
              id="userName"
              {...register('userName', { required: "El usuario es obligatorio" })}
              className={`w-100 ${errors.userName ? styles.inputError : ''}`}
            />
            {errors.userName && <p className={styles.errorMessage}>{errors.userName.message}</p>}
          </article>
          <article className="mb-3">
            <label htmlFor="password" className='text-white'>Contraseña</label>
            <input
              type="password"
              id="password"
              {...register('password', { required: "La contraseña es obligatoria" })}
              className={`w-100 ${errors.password ? styles.inputError : ''}`}
            />
            {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
          </article>
          <article className="d-flex justify-content-start">
            <button
              type="submit"
              className={`${styles.customBtn} w-100`}
              disabled={isSubmitting}>
              <FaArrowRightToBracket className="me-2" />
              {isSubmitting ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </article>
        </form>
      </section>
    </div>
  );
}