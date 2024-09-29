import React, { useState, useEffect } from 'react';
import { getData, putData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Perfil() {
  const { user, updateUser } = useUser();
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    profilePicture: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(true);
        try {
          const response = await getData('/me');
          const { name, last_name, email, profilePicture, role } = response.data.item;
          const newUserData = {
            nombre: name,
            apellido: last_name,
            email: email,
            profilePicture: profilePicture,
            role: role
          };
          setUserData(newUserData);
          updateUser(newUserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError({ general: 'Error al cargar los datos del usuario.' });
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserData({
          nombre: user.name,
          apellido: user.last_name,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role
        });
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, updateUser]);

  useEffect(() => {
    if (message || Object.keys(error).length > 0) {
      const timer = setTimeout(() => {
        setMessage('');
        setError({});
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    let formErrors = {};
    if (userData.nombre.trim() === '') {
      formErrors.nombre = 'El nombre es obligatorio';
    } else if (userData.nombre.trim().length > 15) {
      formErrors.nombre = 'El nombre no debe exceder 15 caracteres';
    }

    if (userData.apellido.trim() === '') {
      formErrors.apellido = 'El apellido es obligatorio';
    } else if (userData.apellido.trim().length > 15) {
      formErrors.apellido = 'El apellido no debe exceder 15 caracteres';
    }

    if (!userData.email.trim()) {
      formErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      formErrors.email = 'Email inválido';
    }

    return formErrors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const formErrors = validateForm();
    setError(formErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      setTouched({
        nombre: true,
        apellido: true,
        email: true
      });
      return;
    }

    try {
      const updatedData = {
        name: userData.nombre,
        last_name: userData.apellido,
        email: userData.email
      };
      const response = await putData('/profile', updatedData);
      setMessage(response.message);
      setError({});
      updateUser({...user, ...updatedData});
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setError(error.response.data.data);
      } else {
        setError({ general: 'Ocurrió un error inesperado.' });
      }
      setMessage('');
    }
  };

  const getInputClassName = (field) => {
    let baseClass = "w-full p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-200";
    if (touched[field] && error[field]) {
      return `${baseClass} border-red-500 focus:ring-red-400`;
    }
    return `${baseClass} focus:ring-purple-400`;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {(message || Object.keys(error).length > 0) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
          {message && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={20} />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage('')} className="text-white">
                <XCircle size={20} />
              </button>
            </div>
          )}
          {(error.general || error.email) && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{error.general || error.email}</span>
              </div>
              <button onClick={() => setError({})} className="text-white">
                <XCircle size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={userData.profilePicture} alt={`${userData.nombre} ${userData.apellido}`} />
          <AvatarFallback>{userData.nombre.charAt(0)}{userData.apellido.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-center text-2xl font-bold mb-2">{userData.nombre} {userData.apellido}</h2>
        {userData.role && (
          <p className="text-center text-gray-500 mb-1">
            {userData.role === 'student' ? 'Estudiante' : userData.role === 'teacher' ? 'Docente' : userData.role}
          </p>
        )}
        <p className="text-center mb-6">{userData.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={userData.nombre}
              onChange={handleInputChange}
              onBlur={() => handleBlur('nombre')}
              className={getInputClassName('nombre')}
              maxLength={15}
            />
            {touched.nombre && error.nombre && <p className="text-red-500 text-sm mt-1">{error.nombre}</p>}
          </div>
          <div>
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={userData.apellido}
              onChange={handleInputChange}
              onBlur={() => handleBlur('apellido')}
              className={getInputClassName('apellido')}
              maxLength={15}
            />
            {touched.apellido && error.apellido && <p className="text-red-500 text-sm mt-1">{error.apellido}</p>}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={userData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              className={getInputClassName('email')}
            />
            {touched.email && error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition duration-300 ease-in-out">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}