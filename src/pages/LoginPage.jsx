// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { postData } from '../api/apiService';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await postData('/login', { email, password });
      const { token, role } = response.data;

      // Llamar a la función `login` desde el contexto con token, role y rememberMe
      login(token, role, rememberMe);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Error en la autenticación. Verifica tus credenciales.');
      } else {
        setError('Ocurrió un error. Inténtalo de nuevo más tarde.');
      }
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg">
      <div className="w-full max-w-6xl bg-secondary-bg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 bg-black text-white p-12 flex flex-col justify-center items-center">
          <h1 className="text-5xl font-bold mb-6">TrackMaster</h1>
          <p className="text-lg font-medium mb-6">Bienvenido!</p>
          <button
            type="button"
            onClick={handleRegisterClick}
            className="bg-black border-white text-white px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            ENTRAR
          </button>
        </div>

        <div className="md:w-1/2 bg-purple-100 p-12 flex flex-col justify-center">
          <h2 className="text-center text-3xl font-semibold text-black mb-4">Inicia sesión !!</h2>
          <p className="text-center text-black mb-8">Ingresa tus datos</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-4 py-2 bg-primary-bg text-white rounded-lg focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="ml-2 text-black">Recuérdame</label>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              INICIAR SESIÓN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;