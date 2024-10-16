import React, { useState, useEffect } from "react";
import { getData, putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clipboard, X, Mail, Phone } from "lucide-react";
import { Switch } from "@headlessui/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EvaluationView from "./EvaluationView"; // Importar la nueva vista de evaluación
import ParticipantList from "./ParticipantList"; // Importar el nuevo componente

const colorSchemes = [
    { bg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-white", hover: "hover:from-blue-600 hover:to-blue-800" },
    { bg: "bg-gradient-to-br from-green-500 to-green-700", text: "text-white", hover: "hover:from-green-600 hover:to-green-800" },
    { bg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-white", hover: "hover:from-purple-600 hover:to-purple-800" },
    { bg: "bg-gradient-to-br from-red-500 to-red-700", text: "text-white", hover: "hover:from-red-600 hover:to-red-800" },
];

export default function ManagementView({ management, onBack }) {
    const [groups, setGroups] = useState([]);
    const [participants, setParticipants] = useState(null); // Estado para los participantes
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
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

    const fetchParticipants = async () => {
        try {
            const response = await getData(`/managements/${management.id}/students`);
            if (response && response.teacher && response.students) {
                setParticipants(response);
            }
        } catch (error) {
            console.error("Error al cargar los participantes:", error);
        }
    };

    useEffect(() => {
        if (management) {
            fetchGroups();
            fetchParticipants(); // Cargar participantes
        }
    }, [management]);

    const handleGroupLimitChange = (e) => {
        setNewGroupLimit(e.target.value);
    };

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

    const handleEvaluateClick = (groupId) => {
        setSelectedSprint(null);
        setIsEvaluating(true);
        setSelectedGroupId(groupId);
    };

    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {!isEvaluating && (
                <Button onClick={onBack} className="flex items-center mb-4 bg-gray-400 hover:bg-gray-500">
                    <ArrowLeft className="mr-2" />
                    Volver al Listado
                </Button>
            )}

            {isEvaluating ? (
                <EvaluationView groupId={selectedGroupId} onBack={() => setIsEvaluating(false)} />
            ) : (
                <>
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

                    {/* Lista de grupos con nuevo diseño */}
                    <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-purple-700">Grupos Registrados</h2>
                        {errorMessage ? (
                            <p className="mt-4 text-red-500">{errorMessage}</p>
                        ) : groups.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map((group, index) => {
                                    const colorScheme = colorSchemes[index % colorSchemes.length];
                                    return (
                                        <Card key={group.short_name} className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                                            <CardContent className="p-0">
                                                <div className={`${colorScheme.bg} p-4 flex items-center space-x-4`}>
                                                    <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                                                        <AvatarImage src={group.logo || '/placeholder.svg?height=64&width=64'} alt={group.short_name} />
                                                        <AvatarFallback className="text-xl bg-white text-gray-800 font-semibold">
                                                            {getInitials(group.short_name, group.long_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className={`text-xl font-bold ${colorScheme.text}`}>{group.short_name}</h3>
                                                        <p className={`text-sm ${colorScheme.text} opacity-90`}>{group.long_name}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white">
                                                    <div className="space-y-2 mb-4">
                                                        <p className="flex items-center text-sm text-gray-600">
                                                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                                            {group.contact_email || "No disponible"}
                                                        </p>
                                                        <p className="flex items-center text-sm text-gray-600">
                                                            <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                                            {group.contact_phone || "No disponible"}
                                                        </p>
                                                        <p className="flex items-center text-sm text-gray-600">
                                                            <Users className="mr-2 h-4 w-4 text-gray-400" />
                                                            {group.members.length} integrantes
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className={`w-full ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} transition-colors duration-300`}
                                                        onClick={() => handleEvaluateClick(group.id)}
                                                    >
                                                        Evaluar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No hay grupos registrados en esta gestión.</p>
                        )}
                    </div>

                    {/* Mostrar el nuevo componente de participantes */}
                    {participants && (
                        <ParticipantList participants={participants} getInitials={getInitials} />
                    )}
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl relative w-96 transition-transform transform scale-100 animate-fade-in">
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
