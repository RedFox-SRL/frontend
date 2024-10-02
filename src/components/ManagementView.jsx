import React, { useState, useEffect } from "react";
import { getData, postData, putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clipboard, X } from "lucide-react";
import { Switch } from "@headlessui/react";

export default function ManagementView({ management, onBack }) {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);

    // Estado para los recursos
    const [isResourcesOpen, setIsResourcesOpen] = useState(false); // Desplegable
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal
    const [resourceType, setResourceType] = useState("Recurso"); // Tipo de recurso o anuncio
    const [modalData, setModalData] = useState({
        title: "",
        date: "",
        file: null,
        description: ""
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData({
            title: "",
            date: "",
            file: null,
            description: ""
        });
    };

    const handleModalChange = (e) => {
        setModalData({ ...modalData, [e.target.name]: e.target.value });
    };

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/managements/${management.id}/groups`);
            if (response && response.success && response.data.groups.length > 0) {
                setGroups(response.data.groups);
            } else if (response && response.code === 404) {
                setErrorMessage("No hay grupos registrados en esta gestión.");
            } else {
                setErrorMessage("Error al cargar los grupos.");
            }
        } catch (error) {
            setErrorMessage("No hay grupos registrados en esta gestión.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (management) {
            fetchGroups();
        }
    }, [management]);

    // Manejar el cambio del límite de grupo
    const handleGroupLimitChange = (e) => {
        setNewGroupLimit(e.target.value);
    };

    // Guardar el nuevo límite de grupo
    const saveGroupLimit = async () => {
        try {
            const response = await putData(`/managements/${management.id}/update-group-limit`, {
                group_limit: parseInt(newGroupLimit, 10)
            });
            if (response && response.success) {
                setIsEditingLimit(false);
            } else {
                alert("Error al actualizar el límite de grupos.");
            }
        } catch (error) {
            alert("Error al actualizar el límite de grupos.");
        }
    };

    // Toggle para activar o desactivar el código de la gestión
    const toggleCodeStatus = async () => {
        try {
            const response = await putData(`/managements/${management.id}/toggle-code`);
            if (response && response.success) {
                setIsCodeActive(response.data.management.is_code_active);
            } else {
                alert("Error al actualizar el estado del código.");
            }
        } catch (error) {
            alert("Error al actualizar el estado del código.");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Button onClick={onBack} className="flex items-center mb-4 bg-gray-400 hover:bg-gray-500">
                <ArrowLeft className="mr-2" />
                Volver al Listado
            </Button>

            <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                <h1 className="text-3xl font-bold mb-4 text-purple-700">
                    Gestión {management.semester === "first" ? "1" : "2"}/{new Date(management.start_date).getFullYear()}
                </h1>

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
                            <div className="flex items-center space-x-2">
                                {isEditingLimit ? (
                                    <>
                                        <input
                                            type="number"
                                            value={newGroupLimit}
                                            onChange={handleGroupLimitChange}
                                            className="border rounded p-1"
                                            style={{ width: '60px' }}
                                        />
                                        <Button onClick={saveGroupLimit} className="w-20 bg-purple-600 hover:bg-purple-700">
                                            Guardar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p>{newGroupLimit}</p>
                                        <Button onClick={() => setIsEditingLimit(true)} className="w-20 bg-purple-600 hover:bg-purple-700">
                                            Editar
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Clipboard className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                            <p className="font-semibold">Código de la gestión:</p>
                            <p className="font-bold text-lg">{management.code}</p>
                            <Switch
                                checked={isCodeActive}
                                onChange={toggleCodeStatus}
                                className={`${isCodeActive ? 'bg-purple-600' : 'bg-gray-400'} relative inline-flex items-center h-6 rounded-full w-11`}
                            >
                                <span className="sr-only">Toggle code</span>
                                <span className={`${isCodeActive ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de recursos */}
            <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-purple-700">Recursos</h2>
                    <button onClick={() => setIsResourcesOpen(!isResourcesOpen)} className="text-purple-600">
                        {isResourcesOpen ? "▲" : "▼"}
                    </button>
                </div>

                {isResourcesOpen && (
                    <div className="mt-4 relative">
                        <p className="text-gray-600">Aún no hay recursos publicados.</p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-110 z-50"
                        >
                            +
                        </Button>
                    </div>
                )}
            </div>

            {/* Lista de grupos */}
            <div className="bg-white shadow-md p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-700">Grupos Registrados</h2>
                {errorMessage ? (
                    <p className="mt-4 text-red-500">{errorMessage}</p>
                ) : groups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <div key={group.short_name} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {group.logo ? (
                                            <img src={group.logo} alt={group.short_name} className="h-14 w-14 rounded-full object-cover shadow-md" />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-purple-700 flex items-center justify-center text-lg font-bold text-white shadow-md">
                                                {group.short_name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{group.long_name || group.short_name}</p>
                                        <p className="text-sm text-gray-600">Representante: {group.representative.name} {group.representative.last_name}</p>
                                        <p className="text-sm text-gray-600">Integrantes: {group.members.length}</p>
                                    </div>
                                </div>
                                <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all duration-300">
                                    Evaluar
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay grupos registrados en esta gestión.</p>
                )}
            </div>

            {/* Modal para añadir recursos/anuncios */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl relative w-96 transition-transform transform scale-100 animate-fade-in">
                        {/* Botón de cierre en la esquina superior derecha */}
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={closeModal}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-6 text-purple-700">
                            {resourceType === "Recurso" ? "Añadir recurso" : "Añadir anuncio"}
                        </h2>

                        <form className="space-y-4">
                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    value={resourceType}
                                    onChange={(e) => setResourceType(e.target.value)}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                                >
                                    <option value="Recurso">Recurso</option>
                                    <option value="Anuncio">Anuncio</option>
                                </select>
                            </div>

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={modalData.title}
                                    onChange={handleModalChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                                />
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={modalData.date}
                                    onChange={handleModalChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                                />
                            </div>

                            {/* Archivo o Descripción según el tipo seleccionado */}
                            {resourceType === "Recurso" ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subir archivo</label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={(e) => setModalData({ ...modalData, file: e.target.files[0] })}
                                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        name="description"
                                        value={modalData.description}
                                        onChange={handleModalChange}
                                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-600 focus:border-purple-600"
                                    />
                                </div>
                            )}

                            {/* Botón de enviar */}
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                Enviar
                            </Button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
