import React, {useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";
import {getData, postData} from "../api/apiService";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {GraduationCap, Loader2, Megaphone, Users, AlertCircle} from 'lucide-react';
import CourseInfo from "./CourseInfo";
import GroupList from "./GroupList";
import ParticipantList from "./ParticipantList";
import GroupDetails from "./GroupDetail";
import AnnouncementListEst from "./AnnouncementListEst";
import InvitationModal from "./InvitationModal";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [isInGroup, setIsInGroup] = useState(false);
    const [groupCode, setGroupCode] = useState(['', '', '', '', '', '', '']);
    const [managementDetails, setManagementDetails] = useState(null);
    const [groups, setGroups] = useState([]);
    const [participants, setParticipants] = useState({
        teacher: null, students: [],
    });
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [activeTab, setActiveTab] = useState("announcements");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        checkManagement();
    }, []);

    const checkManagement = async () => {
        setIsLoading(true);
        try {
            const response = await getData("/student/management");
            if (response && response.success && response.data && response.data.management) {
                setManagementDetails(response.data.management);
                setIsInGroup(true);
                await Promise.all([fetchGroups(response.data.management.id), fetchParticipants(response.data.management.id),]);
            } else {
                setIsInGroup(false);
            }
        } catch (error) {
            console.error("Error al verificar la gestión:", error);
            setIsInGroup(false);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGroups = async (managementId) => {
        try {
            const groupsResponse = await getData(`/managements/${managementId}/groups`);
            if (groupsResponse && groupsResponse.success && groupsResponse.data && groupsResponse.data.groups) {
                setGroups(groupsResponse.data.groups);
            } else {
                setGroups([]);
            }
        } catch (error) {
            console.error("Error al obtener los grupos:", error);
            setGroups([]);
        }
    };

    const fetchParticipants = async (managementId) => {
        try {
            const participantsResponse = await getData(`/managements/${managementId}/students`);
            if (participantsResponse && participantsResponse.success && participantsResponse.data) {
                const {teacher, students} = participantsResponse.data;
                setParticipants({
                    teacher, students,
                });
            } else {
                setParticipants({teacher: null, students: []});
            }
        } catch (error) {
            console.error("Error al obtener los participantes:", error);
            setParticipants({teacher: null, students: []});
        }
    };

    const handleJoinGroup = async () => {
        const code = groupCode.join('');
        if (code.length !== 7) {
            setError("El código debe tener 7 caracteres.");
            return;
        }

        setIsJoining(true);
        setError("");
        setSuccess("");

        try {
            const response = await postData("/managements/join", {
                management_code: code,
            });

            if (response.success) {
                setSuccess("Código válido. Uniéndose al grupo...");
                setTimeout(async () => {
                    await checkManagement();
                }, 2000);
            } else {
                let errorMessage = response.message || "Error al unirse al grupo.";

                if (response.code === 252) {
                    errorMessage = response.data?.management_code?.[0] || "Código de gestión inválido.";
                } else if (response.code === 264) {
                    errorMessage = "El código de gestión aún no está activo. No puedes unirte en este momento.";
                }

                setError(errorMessage);
            }
        } catch (error) {
            console.error("Error al unirse al grupo:", error);
            let errorMessage = "Ocurrió un error al intentar unirse al grupo. Por favor, inténtalo de nuevo.";

            if (error.response) {
                const {data, status} = error.response;
                if (status === 422 && data.code === 252) {
                    errorMessage = data.data?.management_code?.[0] || "Código de gestión inválido.";
                } else if (data.code === 252) {
                    errorMessage = data.data?.management_code?.[0] || "Código de gestión inválido.";
                } else if (data.code === 264) {
                    errorMessage = "El código de gestión aún no está activo. No puedes unirte en este momento.";
                } else {
                    errorMessage = data.message || errorMessage;
                }
            }

            setError(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    const handlePaste = (e, index) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').replace(/\s/g, '');
        const remainingChars = 7 - index;
        const relevantText = pastedText.slice(0, remainingChars);

        const newCode = [...groupCode];
        for (let i = 0; i < relevantText.length; i++) {
            if (index + i < 7) {
                newCode[index + i] = relevantText[i];
            }
        }
        setGroupCode(newCode);

        const nextEmptyIndex = newCode.findIndex((char, i) => i >= index && char === '');
        const focusIndex = nextEmptyIndex === -1 ? 6 : nextEmptyIndex;
        document.getElementById(`code-input-${focusIndex}`)?.focus();
    };

    const handleCodeChange = (index, value) => {
        if (value.length <= 1) {
            const newCode = [...groupCode];
            newCode[index] = value;
            setGroupCode(newCode);

            if (value && index < 6) {
                document.getElementById(`code-input-${index + 1}`)?.focus();
            } else if (!value && index > 0) {
                document.getElementById(`code-input-${index - 1}`)?.focus();
            }
        }
        setError("");
        setSuccess("");
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !groupCode[index] && index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
        }
    };

    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
    };

    const memoizedCourseInfo = useMemo(() => {
        return managementDetails ? (<CourseInfo managementDetails={managementDetails}/>) : null;
    }, [managementDetails]);

    const isCodeComplete = groupCode.every(char => char !== '');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-9 w-9 animate-spin text-purple-600 mr-3"/>
                <span className="font-medium text-purple-600">
                Cargando...
            </span>
            </div>
        );
    }

    if (isInGroup && managementDetails) {
        return (<motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="container mx-auto px-4 py-8 space-y-6"
        >
            <InvitationModal/>
            {memoizedCourseInfo}
            <Card className="w-full shadow-lg">
                <CardContent className="p-1 sm:p-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList
                            className="grid w-full grid-cols-3 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                            <TabsTrigger
                                value="announcements"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">
                                        Anuncios
                                    </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="groups"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">
                                        Grupos ({groups.length})
                                    </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="participants"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">
                                        Estudiantes ({participants.students.length})
                                    </span>
                            </TabsTrigger>
                        </TabsList>
                        <div className="mt-2 sm:mt-4">
                            <TabsContent value="announcements">
                                <AnnouncementListEst managementId={managementDetails.id}/>
                            </TabsContent>
                            <TabsContent value="groups">
                                <GroupList
                                    groups={groups}
                                    onSelectGroup={handleSelectGroup}
                                    getInitials={getInitials}
                                />
                            </TabsContent>
                            <TabsContent value="participants">
                                <ParticipantList
                                    participants={participants}
                                    getInitials={getInitials}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
            <GroupDetails
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
                getInitials={getInitials}
            />
        </motion.div>);
    }

    return (<div className="flex items-start justify-center min-h-screen pt-10 px-4">
        <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-purple-600 text-white p-6">
                <CardTitle className="font-bold">
                    Inscripción a Grupo TIS
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Actualmente no estás inscrito en ningún grupo de la materia TIS (Taller de Ingeniería de
                        Software).
                    </p>
                    <p className="text-gray-700">
                        Para inscribirte, necesitas ingresar el código único de 7 dígitos proporcionado por tu
                        docente.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400"/>
                            </div>
                            <div className="ml-3">
                                <small className="text-yellow-700">
                                    Si no tienes un código, por favor comunícate con tu docente para que te lo
                                    proporcione.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label htmlFor="code-input-0" className="block font-medium text-gray-700">
                        Ingresa el código de tu grupo (7 dígitos):
                    </label>
                    <div className="flex justify-center space-x-2">
                        {groupCode.map((char, index) => (<input
                            key={index}
                            id={`code-input-${index}`}
                            type="text"
                            maxLength="1"
                            className="w-10 h-12 text-center font-bold border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500 bg-white shadow-sm"
                            value={char}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={(e) => handlePaste(e, index)}
                        />))}
                    </div>
                </div>

                {error && (<div className="flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2"/>
                    <small>{error}</small>
                </div>)}
                {success && (<div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2"/>
                    <small>{success}</small>
                </div>)}

                <Button
                    onClick={handleJoinGroup}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition duration-300 ease-in-out"
                    disabled={isJoining || !isCodeComplete}
                >
                    {isJoining ? (<>
                        <Loader2 className="w-5 h-5 animate-spin mr-2 inline"/>
                        Uniéndose...
                    </>) : ("Unirse al Grupo")}
                </Button>
            </CardContent>
        </Card>
    </div>);
}