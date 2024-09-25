import React, { useState, useEffect } from 'react';
import { getData } from '../api/apiService';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clipboard } from "lucide-react";

export default function ManagementView({ management, onBack }) {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null); // Estado para manejar el grupo seleccionado
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la sidebar

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/managements/${management.id}/groups`);
            if (response && response.success && response.data.groups.length > 0) {
                setGroups(response.data.groups);
            } else if (response && response.code === 404) {
                setErrorMessage('No hay grupos registrados en esta gestión.');
            } else {
                setErrorMessage('Error al cargar los grupos.');
            }
        } catch (error) {
            setErrorMessage('No hay grupos registrados en esta gestion.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (management) {
            fetchGroups();
        }
    }, [management]);

    const handleViewGroupDetails = (group) => {
        setSelectedGroup(group); // Establece el grupo seleccionado
        setIsSidebarOpen(true); // Muestra la sidebar
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedGroup(null); // Limpia el grupo seleccionado cuando se cierra la sidebar
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span>Cargando detalles de la gestión...</span>
            </div>
        );
    }

    if (!management) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span>No se encontró la gestión solicitada</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Botón de regreso */}
            <Button onClick={onBack} className="flex items-center mb-4 bg-gray-400 hover:bg-gray-500">
                <ArrowLeft className="mr-2" />
                Volver al Listado
            </Button>

            {/* Detalles de la gestión */}
            <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                <h1 className="text-3xl font-bold mb-4 text-purple-700">{management.semester}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                        <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-semibold">Fecha de inicio:</p>
                            <p>{management.start_date}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-semibold">Fecha de fin:</p>
                            <p>{management.end_date}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Users className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-semibold">Límite de grupos:</p>
                            <p>{management.group_limit}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Clipboard className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-semibold">Código de la gestión:</p>
                            <p className="font-bold text-lg">{management.code || 'Cargando...'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de grupos */}
            <div className="bg-white shadow-md p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-700">Grupos Registrados</h2>
                {errorMessage ? (
                    <p className="mt-4 text-red-500">{errorMessage}</p>
                ) : groups.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {groups.map((group) => (
                            <li key={group.short_name} className="py-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{group.long_name || group.short_name}</p>
                                        <p className="text-sm text-gray-600">Representante: {group.representative.name} {group.representative.last_name}</p>
                                        <p className="text-sm text-gray-600">Email: {group.contact_email}</p>
                                        <p className="text-sm text-gray-600">Teléfono: {group.contact_phone}</p>
                                        <p className="text-sm text-gray-600">Integrantes: {group.members.length}</p>
                                    </div>
                                    {group.logo && (
                                        <div className="ml-4">
                                            <img src={group.logo} alt={`Logo de ${group.short_name}`} className="h-12 w-12 object-cover rounded-full" />
                                        </div>
                                    )}
                                    <Button onClick={() => handleViewGroupDetails(group)} className="ml-4 bg-purple-600 hover:bg-purple-700 text-white">
                                        Ver Detalles
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay grupos registrados en esta gestión.</p>
                )}
            </div>

            {/* Sidebar de detalles del grupo */}
            {isSidebarOpen && selectedGroup && (
                <div className={`fixed inset-0 flex z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} justify-end`}>
                    <div className="absolute inset-0 bg-black opacity-50" onClick={closeSidebar}></div>
                    <div className="relative bg-white w-80 p-6 overflow-auto shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0">
                        <h2 className="text-xl font-bold mb-4">Detalles del Grupo: {selectedGroup.long_name || selectedGroup.short_name}</h2>
                        <p><strong>Representante:</strong> {selectedGroup.representative.name} {selectedGroup.representative.last_name}</p>
                        <p><strong>Email:</strong> {selectedGroup.contact_email}</p>
                        <p><strong>Teléfono:</strong> {selectedGroup.contact_phone}</p>
                        <p><strong>Integrantes:</strong></p>
                        <ul className="list-disc ml-6">
                            {selectedGroup.members.map((member) => (
                                <li key={member.id}>{member.name} {member.last_name}</li>
                            ))}
                        </ul>
                        {selectedGroup.logo && (
                            <div className="mt-4">
                                <img src={selectedGroup.logo} alt={`Logo de ${selectedGroup.short_name}`} className="h-24 w-24 object-cover rounded-lg" />
                            </div>
                        )}
                        <Button onClick={closeSidebar} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
