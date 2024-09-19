import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
    const navigate = useNavigate();

    // Estados para los inputs
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');

    // Estados para mensajes de error
    const [errors, setErrors] = useState({});

    // Función para validar la contraseña
    const isPasswordSecure = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
        return regex.test(password);
    };

    const handleRegisterClick = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario

        // Resetear los errores
        setErrors({});

        // Validaciones
        let formErrors = {};
        if (name.trim() === '') {
            formErrors.name = 'Este campo es obligatorio';
        } else if (name.trim().length > 15) {
            formErrors.name = 'El nombre no debe exceder 15 caracteres';
        }

        if (lastName.trim() === '') {
            formErrors.lastName = 'Este campo es obligatorio';
        } else if (lastName.trim().length > 15) {
            formErrors.lastName = 'Los apellidos no deben exceder 15 caracteres';
        }

        if (!isPasswordSecure(password)) {
            formErrors.password = 'La contraseña debe tener entre 8 y 15 caracteres, con al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.';
        }

        if (password !== confirmPassword) {
            formErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const response = await fetch('https://dolphin-app-zd9uz.ondigitalocean.app/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    last_name: lastName,
                    email,
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registro exitoso');
                navigate('/login'); // Redirige al login después del registro exitoso
            } else if (response.status === 422 && data.errors && data.errors.email) {
                // Si el error viene del campo email (correo ya registrado)
                setErrors({ email: 'El correo ya está en uso' });
            } else {
                alert(data.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            alert('Hubo un error en el registro');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg">
            <div className="w-full max-w-4xl bg-primary-bg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
                {/* Sección de Login */}
                <div className="md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-6">TrackMaster</h1>
                    <p className="text-lg mb-6">¡Bienvenido!<br/>Ingrese ahora mismo a su cuenta</p>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="bg-black border-white text-white px-6 py-2 rounded-lg hover:bg-gray-300">
                        ENTRAR
                    </button>
                    <a
                        href="#"
                        onClick={() => navigate('/forgot-password')}
                        className="mt-6 text-center underline hover:cursor-pointer">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                {/* Sección de Registro */}
                <div className="w-full md:w-1/2 bg-secondary-bg p-8">
                    <h2 className="text-center font-semibold text-black mb-4">Crea tu cuenta</h2>
                    <p className="text-center text-black mb-6">Rellena el formulario</p>

                    <form className="space-y-4" onSubmit={handleRegisterClick}>
                        <div className="flex flex-col space-y-4">
                            <input
                                type="text"
                                placeholder="Nombres"
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={15}
                                required
                            />
                            {errors.name && <p className="text-red-500">{errors.name}</p>}
                            <input
                                type="text"
                                placeholder="Apellidos"
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                maxLength={15}
                                required
                            />
                            {errors.lastName && <p className="text-red-500">{errors.lastName}</p>}
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-red-500">{errors.email}</p>}
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <p className="text-red-500">{errors.password}</p>}
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
                            <select
                                className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="">Seleccione su rol</option>
                                <option value="student">Estudiante</option>
                                <option value="teacher">Docente</option>
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                            >
                                REGISTRAR
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
