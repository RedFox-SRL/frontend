import React, { useState } from 'react'

export default function Ajustes() {
  const [userData, setUserData] = useState({
    nombre: 'Oliver',
    apellido: 'Alandia',
    email: 'oliveralandia@gmail.com'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Updating user data:', userData)
    // Implement API call to update user data
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="w-24 h-24 bg-purple-600 rounded-full mx-auto mb-4"></div>
      <h2 className="text-center text-2xl font-bold mb-2">{userData.nombre} {userData.apellido}</h2>
      <p className="text-center text-gray-500 mb-1">Estudiante</p>
      <p className="text-center mb-6">{userData.email}</p>
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
  )
}