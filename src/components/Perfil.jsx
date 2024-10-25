import React, { useState, useEffect } from 'react';
import { getData, putData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { CheckCircle, XCircle, AlertCircle, Camera } from 'lucide-react';
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

  const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
  };

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

    // Solo filtrar los campos 'nombre' y 'apellido' para aceptar únicamente letras y espacios
    if (name === 'nombre') {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, ''); // Solo permite letras y espacios
      setUserData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'apellido') {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, ''); // Solo permite letras y espacios
      setUserData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }

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
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Editar Perfil</h2>
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg">
            <Avatar className="w-full h-full border-2 border-white rounded-full">
              <AvatarImage src={userData.profilePicture || getAvatarUrl(userData.nombre, userData.apellido)} alt={`${userData.nombre} ${userData.apellido}`} />
              <AvatarFallback className="bg-purple-200 text-purple-800 text-xl font-bold">
                {userData.nombre.charAt(0)}{userData.apellido.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-center text-xl font-semibold">{userData.nombre} {userData.apellido}</h3>
          <p className="text-center text-gray-600">{userData.role === 'student' ? 'Estudiante' : userData.role === 'teacher' ? 'Docente' : userData.role}</p>
          <p className="text-center text-gray-600">{userData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
            <input
                id="nombre"
                type="text"
                name="nombre"
                value={userData.nombre}
                onChange={handleInputChange}
                onBlur={() => handleBlur('nombre')}
                className={getInputClassName('nombre')}
                maxLength={15}
            />
            {touched.nombre && error.nombre && <p className="text-red-500 text-sm mt-1">{error.nombre}</p>}
          </div>
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
            <input
                id="apellido"
                type="text"
                name="apellido"
                value={userData.apellido}
                onChange={handleInputChange}
                onBlur={() => handleBlur('apellido')}
                className={getInputClassName('apellido')}
                maxLength={15}
            />
            {touched.apellido && error.apellido && <p className="text-red-500 text-sm mt-1">{error.apellido}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
                id="email"
                type="email"
                name="email"
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

        {(message || Object.keys(error).length > 0) && (
            <div className="mt-4">
              {message && (
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                    <CheckCircle className="inline-block mr-2" size={20} />
                    <span>{message}</span>
                  </div>
              )}
              {(error.general || error.email) && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
                    <AlertCircle className="inline-block mr-2" size={20} />
                    <span>{error.general || error.email}</span>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
