import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/apiService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    try {
      await postData('/password/email', { email });
      setSuccess('Correo de recuperación enviado exitosamente');
      setError(null);
    } catch (error) {
      setError('Error al enviar el correo de recuperación. Verifica el email ingresado.');
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-950 to-indigo-700 animate-gradient-x">
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg p-8">
        <h2 className="text-center text-3xl font-semibold text-purple-900 mb-4">Recuperar Contraseña</h2>
        <p className="text-center text-purple-700 mb-6">Ingresa tu email para recuperar tu contraseña</p>

        <form className="space-y-4" onSubmit={handlePasswordReset}>
          <div className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-white text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out"
            >
              Enviar enlace de recuperación
            </button>
          </div>
        </form>

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