import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/apiService';
import { Eye, EyeOff } from 'lucide-react';

const LoginRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const isPasswordSecure = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
    return regex.test(password);
  };

  const validateForm = () => {
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

    if (!email.trim()) {
      formErrors.email = 'Este campo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Email inválido';
    }

    if (!password) {
      formErrors.password = 'Este campo es obligatorio';
    } else if (!isPasswordSecure(password)) {
      formErrors.password = 'La contraseña debe tener entre 8 y 15 caracteres, con al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.';
    }

    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!role) {
      formErrors.role = 'Por favor seleccione un rol';
    }

    return formErrors;
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await postData('/register', {
        name,
        last_name: lastName,
        email,
        password,
        role,
      });

      if (response.success) {
        alert('Registro exitoso');
        navigate('/login');
      } else {
        setErrors(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.data);
      } else {
        setErrors({ api: 'Hubo un error en el registro' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-950 to-indigo-700 animate-gradient-x">
      <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6">TrackMaster</h1>
          <p className="text-lg mb-6">¡Bienvenido!<br/>Ingrese ahora mismo a su cuenta</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-transparent border border-white text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-white hover:text-black">
            ENTRAR
          </button>
          <a
            href="#"
            onClick={() => navigate('/forgot-password')}
            className="mt-6 text-center underline hover:text-purple-200 transition duration-300 ease-in-out">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 rounded-r-lg">
          <h2 className="text-center text-3xl font-semibold text-purple-900 mb-4">Crea tu cuenta</h2>
          <p className="text-center text-purple-700 mb-6">Rellena el formulario</p>

          <form className="space-y-4" onSubmit={handleRegisterClick}>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Nombres"
                className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              <input
                type="text"
                placeholder="Apellidos"
                className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={15}
                required
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              <select
                className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Seleccione su rol</option>
                <option value="student">Estudiante</option>
                <option value="teacher">Docente</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out"
              >
                REGISTRAR
              </button>
            </div>
            {errors.api && <p className="text-red-500 text-center mt-4">{errors.api}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;