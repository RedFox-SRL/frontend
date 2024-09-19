import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://dolphin-app-zd9uz.ondigitalocean.app/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la autenticación');
            }

            const data = await response.json();
            // Aquí puedes manejar la respuesta de éxito, por ejemplo, redirigir al usuario
            console.log(data);
            navigate('/home'); // Redirige a la página principal u otra después de iniciar sesión
        } catch (error) {
            setError('Error en la autenticación. Verifica tus credenciales.');
            console.error('Error:', error);
        }
    };

    const handleRegisterClick = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg">
            <div className="w-full max-w-6xl bg-secondary-bg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
                {/* Sección de la izquierda (TrackMaster) */}
                <div className="md:w-1/2 bg-black text-white p-12 flex flex-col justify-center items-center">
                    <h1 className="text-5xl font-bold mb-6">TrackMaster</h1>
                    <p className="text-lg font-medium mb-6">Bienvenido!</p>
                    <button
                        className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition"
                        onClick={handleRegisterClick}
                    >
                        REGISTRAR
                    </button>
                </div>

                {/* Sección de la derecha (Formulario de Inicio de Sesión) */}
                <div className="md:w-1/2 bg-purple-100 p-12 flex flex-col justify-center">
                    <h2 className="text-center text-3xl font-semibold text-black mb-4">Inicia sesión !!</h2>
                    <p className="text-center text-black mb-8">Ingresa tus datos</p>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Input de Email */}
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-purple-600"
                                required
                            />
                        </div>

                        {/* Input de Contraseña */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-purple-600"
                                required
                            />
                        </div>

                        {/* Opciones debajo del input */}
                        <div className="flex items-center justify-between text-gray-500 text-sm">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                Recordar Usuario?
                            </label>
                            <a
                                href="#"
                                className="hover:underline"
                                onClick={() => navigate('/forgot-password')}
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Botón de Ingreso */}
                        <button
                            type="submit"
                            className="w-full bg-primary-bg text-white py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            Ingresar
                        </button>

                        {/* Mostrar error si lo hay */}
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
