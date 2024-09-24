import React, { useState } from 'react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`h-screen bg-purple-700 ${isOpen ? 'w-64' : 'w-16'} duration-300`}>
            <div className="p-4 flex justify-between">
                {/* Aquí irá el ícono de las tres líneas para abrir/cerrar el sidebar */}
                <button onClick={toggleSidebar}>
                    {/* Icono del menú (tres líneas) */}
                    <span className="text-white">&#9776;</span>
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <div className="text-white p-4 hover:bg-purple-600 cursor-pointer">
                    {/* Aquí puedes poner el ícono de Inicio */}
                    Inicio
                </div>
                <div className="text-white p-4 hover:bg-purple-600 cursor-pointer">
                    {/* Aquí puedes poner el ícono de Grupo */}
                    Grupo
                </div>
                <div className="text-white p-4 hover:bg-purple-600 cursor-pointer">
                    {/* Aquí puedes poner el ícono de Perfil */}
                    Ajustes
                </div>
                <div className="text-white p-4 hover:bg-purple-600 cursor-pointer">
                    {/* Aquí puedes poner el ícono de Cerrar Sesión */}
                    Cerrar Sesión
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
