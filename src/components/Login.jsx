import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';
import { FaArrowRightToBracket } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; 
import { authService } from '../services/authServices';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useAuth(); // <- Método de tu context

    const loginForm = async (data) => {
        
        const payload = {
            userName: data.userName,
            password: data.password
        };

        const response = await authService.login(payload);
        if (response?.token) {
             // Le pasamos toda la información necesaria al AuthContext.
                // El AuthContext se encargará de:
                //   - Actualizar el estado de React.
                //   - Guardar el token en sessionStorage (según su propia lógica).
                //   - Guardar el rol en sessionStorage.
                //   - Guardar el accessLogId en sessionStorage.
                login(response.token, response.role, response.accessLogId);
            if (response.role === true || response.role === "true") {
                navigate("/admin");
            } else {
                navigate("/empresas");
            }
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    };

    return (
        <div className={styles.formWrapper}>
            <section className={styles.formContainer}>
                <h1 className='text-center mb-4'>
                    Iniciar Sesión
                </h1>
                <form onSubmit={handleSubmit(loginForm)}>
                    <article>
                        <p className='text-white'>
                            <FaInfoCircle className=" me-2" /> Ingresa tus credenciales para acceder al sistema
                        </p>
                    </article>
                    <article className="mb-3">
                        <label htmlFor="userName" className='text-white'>Usuario</label>
                        <input
                            type="text"
                            {...register('userName', { required: "El usuario es obligatorio" })}
                            className={`w-100 ${errors.userName ? styles.inputError : ''}`}
                        />
                        {errors.userName && <p className={styles.errorMessage}>{errors.userName.message}</p>}
                    </article>
                    <article className="mb-3">
                        <label htmlFor="password" className='text-white'>Contraseña</label>
                        <input
                            type="password"
                            {...register('password', { required: "La contraseña es obligatoria" })}
                            className={`w-100 ${errors.password ? styles.inputError : ''}`}
                        />
                        {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
                    </article>
                    <article className="d-flex justify-content-start">
                        <button
                            type="submit"
                            className={`${styles.customBtn} w-100`}>
                            <FaArrowRightToBracket className="me-2" />
                            Iniciar sesión
                        </button>
                    </article>
                </form>
            </section>
        </div>
    );
}
