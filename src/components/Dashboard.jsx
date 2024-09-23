import React, {useState, useEffect} from 'react';
import {getData, postData} from '../api/apiService';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Users, Mail, Phone, X} from "lucide-react";

export default function Dashboard() {
    const [isInGroup, setIsInGroup] = useState(false);
    const [groupCode, setGroupCode] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [managementDetails, setManagementDetails] = useState(null);
    const [groups, setGroups] = useState([]);
    const [participants, setParticipants] = useState({teacher: null, students: []});
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        const checkManagement = async () => {
            try {
                const response = await getData('/student/management');
                if (response && response.success && response.data && response.data.management) {
                    setManagementDetails(response.data.management);
                    setIsInGroup(true);
                    fetchGroupsAndParticipants(response.data.management.id);
                } else {
                    setIsInGroup(false);
                }
            } catch (error) {
                console.error('Error checking management:', error);
                setIsInGroup(false);
            }
        };

        checkManagement();
    }, []);

    const fetchGroupsAndParticipants = async (managementId) => {
        try {
            // Fetch groups for the management
            const groupsResponse = await getData(`/managements/${managementId}/groups`);
            if (groupsResponse && groupsResponse.success && groupsResponse.data && groupsResponse.data.groups) {
                setGroups(groupsResponse.data.groups);
            } else {
                setGroups([]); // Si no hay grupos, establecer una lista vacía
            }
        } catch (error) {
            if (error.response && (error.response.status === 404 || error.response.data.code === 267)) {
                // Manejar el caso de 404 o código de error 267 para grupos
                setGroups([]);
            } else {
                console.error('Error fetching groups:', error);
            }
        }

        try {
            // Fetch students and teacher for the management
            const participantsResponse = await getData(`/managements/${managementId}/students`);
            if (participantsResponse && participantsResponse.teacher && participantsResponse.students) {
                setParticipants({
                    teacher: participantsResponse.teacher,
                    students: participantsResponse.students
                });
            } else {
                setParticipants({teacher: null, students: []}); // Si no hay participantes, establecer valores por defecto
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Manejar el caso de 404 para participantes
                setParticipants({teacher: null, students: []});
            } else {
                console.error('Error fetching participants:', error);
            }
        }
    };

    const handleJoinGroup = async () => {
        try {
            const response = await postData('/managements/join', {management_code: groupCode});
            if (response && response.success && response.data && response.data.management) {
                setAlertMessage('Te has unido al grupo exitosamente.');
                setIsError(false);
                setIsInGroup(true);
                setManagementDetails(response.data.management);
                fetchGroupsAndParticipants(response.data.management.id);
            } else {
                setAlertMessage('Error al unirse al grupo.');
                setIsError(true);
            }
        } catch (error) {
            setAlertMessage('Error al unirse al grupo.');
            setIsError(true);
        } finally {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    };

    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (isInGroup && managementDetails) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl text-purple-700">Información del Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="font-semibold">Fecha de Inicio</p>
                                <p>{managementDetails.start_date}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Fecha de Fin</p>
                                <p>{managementDetails.end_date}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Límite por Grupo</p>
                                <p>{managementDetails.group_limit}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mostrar grupos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {groups.map((group, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative h-40">
                                    <img
                                        src={group.logo || '/placeholder.svg?height=160&width=320'}
                                        alt=""
                                        className="w-full h-40 object-cover"/>
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <Avatar className="w-20 h-20 border-4 border-white">
                                            <AvatarFallback
                                                className="text-3xl">{getInitials(group.short_name, group.long_name)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold mb-2">{group.short_name}</h3>
                                    <p className="flex items-center mb-1">
                                        <Mail className="mr-2 h-4 w-4"/>
                                        {group.contact_email}
                                    </p>
                                    <p className="flex items-center mb-1">
                                        <Phone className="mr-2 h-4 w-4"/>
                                        {group.contact_phone}
                                    </p>
                                    <p className="flex items-center mb-4">
                                        <Users className="mr-2 h-4 w-4"/>
                                        {Object.keys(group.members).length} integrantes
                                    </p>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        onClick={() => setSelectedGroup(group)}>
                                        Ver Detalles
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mostrar participantes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-purple-700">Participantes del Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-4">
                                {/* Mostrar profesor */}
                                {participants.teacher && (
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">Profesor</h3>
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(participants.teacher.name, participants.teacher.last_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{`${participants.teacher.name} ${participants.teacher.last_name}`}</p>
                                                <p className="text-sm text-gray-500">{participants.teacher.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mostrar estudiantes */}
                                {participants.students && participants.students.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Estudiantes</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {participants.students.map((student) => (
                                                <div key={student.id} className="flex items-center space-x-4">
                                                    <Avatar>
                                                        <AvatarFallback>{getInitials(student.name, student.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{`${student.name} ${student.last_name}`}</p>
                                                        <p className="text-sm text-gray-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Detalles del grupo seleccionado */}
                {selectedGroup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                        <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{selectedGroup.short_name}</h3>
                                <Button variant="ghost" onClick={() => setSelectedGroup(null)}>
                                    <X className="h-6 w-6"/>
                                </Button>
                            </div>

                            {/* Usar Avatar con logo o iniciales, igual que en la vista de grupos */}
                            <div className="relative h-40 mb-4">
                                <img
                                    src={selectedGroup.logo || '/placeholder.svg?height=160&width=320'}
                                    alt=""
                                    className="w-full h-40 object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <Avatar className="w-20 h-20 border-4 border-white">
                                        <AvatarFallback className="text-3xl">
                                            {getInitials(selectedGroup.short_name, selectedGroup.long_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            <p className="mb-2"><strong>Email:</strong> {selectedGroup.contact_email}</p>
                            <p className="mb-2"><strong>Teléfono:</strong> {selectedGroup.contact_phone}</p>
                            <p className="mb-4"><strong>Integrantes:</strong></p>
                            <div className="space-y-2">
                                {Object.values(selectedGroup.members).map((member) => (
                                    <div key={member.id} className="flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarFallback>{getInitials(member.name, member.last_name)}</AvatarFallback>
                                        </Avatar>
                                        <p>{`${member.name} ${member.last_name}`}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6 max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl text-purple-700">No estás inscrito en un
                        curso</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Ingrese el código de la clase"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value)}
                        className="mb-4"/>
                    <Button
                        onClick={handleJoinGroup}
                        className="w-full bg-purple-600 hover:bg-purple-700">
                        Unirse a Clase
                    </Button>
                </CardContent>
            </Card>
            {showAlert && (
                <Alert variant={isError ? "destructive" : "default"}>
                    <AlertTitle>{isError ? "Error" : "Éxito"}</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
