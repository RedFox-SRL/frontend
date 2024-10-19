import React, { useState, useEffect, useRef } from "react";
import { getData, putData } from "../api/apiService";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, Clipboard, Megaphone, GraduationCap, TrendingUp } from "lucide-react";
import { Switch } from "@headlessui/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EvaluationView from "./EvaluationView";
import ParticipantList from "./ParticipantList";
import GroupDetails from "./GroupDetail";
import AnnouncementList from "./AnnouncementList";
import CreateAnnouncement from "./CreateAnnouncement";

const colorSchemes = [
    { bg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-white", hover: "hover:from-blue-600 hover:to-blue-800" },
    { bg: "bg-gradient-to-br from-green-500 to-green-700", text: "text-white", hover: "hover:from-green-600 hover:to-green-800" },
    { bg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-white", hover: "hover:from-purple-600 hover:to-purple-800" },
    { bg: "bg-gradient-to-br from-red-500 to-red-700", text: "text-white", hover: "hover:from-red-600 hover:to-red-800" },
];

export default function ManagementView({ management, onBack }) {
    const [groups, setGroups] = useState([]);
    const [participants, setParticipants] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
    const [activeTab, setActiveTab] = useState("announcements");
    const [announcements, setAnnouncements] = useState([]);

    const handleAnnouncementCreated = (newAnnouncement) => {
        setAnnouncements([newAnnouncement, ...announcements]);
    };

    useEffect(() => {
        if (management) {
            fetchGroups();
            fetchParticipants();
            fetchAnnouncements();
        }
    }, [management]);

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

    const fetchAnnouncements = async () => {
        try {
            const response = await getData(`/managements/${management.id}/announcements`);
            if (response && response.success && response.data) {
                setAnnouncements(response.data);
            } else {
                setAnnouncements([]);
            }
        } catch (error) {
            console.error('Error al obtener los anuncios:', error);
            setAnnouncements([]);
        }
    };

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
        setIsEvaluating(true);
        setSelectedGroupId(groupId);
    };

    const handleViewDetails = (group) => {
        setSelectedGroupDetails(group);
    };

    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
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

                    <Card className="bg-white shadow-md p-6 rounded-lg mb-8">
                        <CardHeader className="p-2 sm:p-4">
                            <CardTitle className="text-lg sm:text-xl text-purple-700">Gestión</CardTitle>
                        </CardHeader>
                        <CardContent className="p-1 sm:p-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                                    <TabsTrigger
                                        value="announcements"
                                        className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                                    >
                                        <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline ml-1 sm:ml-2">Anuncios</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="groups"
                                        className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                                    >
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline ml-1 sm:ml-2">Grupos</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="participants"
                                        className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                                    >
                                        <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline ml-1 sm:ml-2">Estudiantes</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="announcements">
                                    <CreateAnnouncement
                                        managementId={management.id}
                                        onAnnouncementCreated={handleAnnouncementCreated}
                                    />
                                    <AnnouncementList announcements={announcements} />
                                </TabsContent>

                                <TabsContent value="groups">
                                    <div className="mt-4">
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
                                                                    <Button
                                                                        className={`w-full mt-2 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} transition-all duration-300`}
                                                                        onClick={() => handleViewDetails(group)}
                                                                    >
                                                                        Ver detalles
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
                                </TabsContent>

                                {/* Participantes */}
                                <TabsContent value="participants">
                                    <div className="mt-4">
                                        {participants && (
                                            <ParticipantList participants={participants} getInitials={getInitials} />
                                        )}
                                    </div>
                                </TabsContent>

                            </Tabs>
                        </CardContent>
                    </Card>

                    {selectedGroupDetails && (
                        <GroupDetails
                            group={selectedGroupDetails}
                            onClose={() => setSelectedGroupDetails(null)}
                            getInitials={getInitials}
                        />
                    )}
                </>
            )}
        </motion.div>
    );
}
