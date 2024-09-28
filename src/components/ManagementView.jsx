import React, { useState, useEffect } from "react";
import { getData, postData, putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clipboard } from "lucide-react";
import { Switch } from "@headlessui/react";

export default function ManagementView({ management, onBack }) {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit); // Estado para el límite de grupos
    const [isEditingLimit, setIsEditingLimit] = useState(false); // Controla cuándo se puede editar el límite
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/managements/${management.id}/groups`);
            if (response && response.success && response.data.groups.length > 0) {
                setGroups(response.data.groups);
            } else if (response && response.code === 404) {
//                setErrorMessage("No hay grupos registrados en esta gestión.");
            } else {
                setErrorMessage("Error al cargar los grupos.");
            }
        } catch (error) {
//            setErrorMessage("No hay grupos registrados en esta gestion.");
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
        setNewGroupLimit(e.target.value); // Actualiza el valor conforme el usuario lo edita
    };

    // Guardar el nuevo límite de grupo
    const saveGroupLimit = async () => {
        try {
            const response = await putData(`/managements/${management.id}/update-group-limit`, {
                group_limit: parseInt(newGroupLimit, 10)
            });
            if (response && response.success) {
                //alert("Límite de grupo actualizado exitosamente.");
                setIsEditingLimit(false); // Desactivar el modo de edición
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
                //alert("Estado del código de la gestión actualizado.");
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
                        <Calendar className="h-6 w-6 text-purple-600 mr-3"/>
                        <div>
                            <p className="font-semibold">Fecha de inicio:</p>
                            <p>{management.start_date}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-6 w-6 text-purple-600 mr-3"/>
                        <div>
                            <p className="font-semibold">Fecha de fin:</p>
                            <p>{management.end_date}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Users className="h-6 w-6 text-purple-600 mr-3"/>
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
                                            style={{width: '60px'}} // Ancho fijo para que no se expanda mucho
                                        />
                                        <Button onClick={saveGroupLimit}
                                                className="w-20 bg-purple-600 hover:bg-purple-700">
                                            Guardar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p>{newGroupLimit}</p>
                                        <Button onClick={() => setIsEditingLimit(true)}
                                                className="w-20 bg-purple-600 hover:bg-purple-700">
                                            Editar
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center">
                        <Clipboard className="h-6 w-6 text-purple-600 mr-3"/>
                        <div>
                            <p className="font-semibold">Código de la gestión:</p>
                            <p className="font-bold text-lg">{management.code}</p>
                            <Switch
                                checked={isCodeActive}
                                onChange={toggleCodeStatus}
                                className={`${isCodeActive ? 'bg-purple-600' : 'bg-gray-400'} relative inline-flex items-center h-6 rounded-full w-11`}
                            >
                                <span className="sr-only">Toggle code</span>
                                <span
                                    className={`${isCodeActive ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                />
                            </Switch>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <div key={group.short_name}
                                 className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {group.logo ? (
                                            <img src={group.logo} alt={group.short_name}
                                                 className="h-14 w-14 rounded-full object-cover shadow-md"/>
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
                                <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all duration-300" onClick={() => {/* Acción para evaluar */}}>
                                    Evaluar
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay grupos registrados en esta gestión.</p>
                )}
            </div>
        </div>
    );
}