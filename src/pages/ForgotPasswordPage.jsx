import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://dolphin-app-zd9uz.ondigitalocean.app/api/password/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al enviar el correo de recuperación');
            }

            const data = await response.json();
            setSuccess('Correo de recuperación enviado exitosamente');
            setError(null);
            console.log(data);
        } catch (error) {
            setError('Error al enviar el correo de recuperación. Verifica el email ingresado.');
            setSuccess(null);
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-bg">
            <div className="w-full max-w-md bg-secondary-bg rounded-lg shadow-lg p-8">
                <h2 className="text-center text-3xl font-semibold text-black mb-4">Recuperar Contraseña</h2>
                <p className="text-center text-black mb-8">Ingresa tu correo electrónico</p>

                <form className="space-y-6" onSubmit={handlePasswordReset}>
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

                    {/* Botón para enviar el correo de recuperación */}
                    <button
                        type="submit"
                        className="w-full bg-primary-bg text-white py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        Enviar enlace de recuperación
                    </button>

                    {/* Mostrar éxito o error */}
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                </form>

                {/* Opción para regresar a la página de inicio de sesión */}
                <div className="text-center mt-6">
                    <button
                        className="text-purple-600 hover:underline"
                        onClick={() => navigate('/login')}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
