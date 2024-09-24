import React, { useState, useEffect } from 'react';
import { getData, putData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Loader2 } from "lucide-react";

export default function Ajustes() {
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

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await getData('/me');
        const { name, last_name, email, profilePicture, role } = response.data.item;
        setUserData({
          nombre: name,
          apellido: last_name,
          email: email,
          profilePicture: profilePicture,
          role: role
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: userData.nombre,
        last_name: userData.apellido,
        email: userData.email
      };
      const response = await putData('/profile', updatedData);
      setMessage(response.message);
      setError({});
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setError(error.response.data.data);
      } else {
        setError({ general: 'An unexpected error occurred.' });
      }
      setMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg font-medium text-purple-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarImage src={userData.profilePicture} alt={`${userData.nombre} ${userData.apellido}`} />
        <AvatarFallback>{userData.nombre.charAt(0)}{userData.apellido.charAt(0)}</AvatarFallback>
      </Avatar>
      <h2 className="text-center text-2xl font-bold mb-2">{userData.nombre} {userData.apellido}</h2>
      {userData.role && <p className="text-center text-gray-500 mb-1">{userData.role}</p>}
      <p className="text-center mb-6">{userData.email}</p>
      {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{message}</div>}
      {error.general && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error.general}</div>}
      {error.email && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error.email[0]}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={userData.nombre}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={userData.apellido}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={userData.email}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">Guardar Cambios</button>
      </form>
    </div>
  );
}