import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getData, postData } from '../api/apiService';
import { Loader2, Calendar, Users, LayoutDashboard, Mail, Phone, Hash } from "lucide-react";
import CalendarioEventos from './CalendarioEventos';
import SprintKanbanBoard from './SprintKanbanBoard.jsx';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function GruposYPlanificacion() {
    const [isLoading, setIsLoading] = useState(true);
    const [isInGroup, setIsInGroup] = useState(false);
    const [view, setView] = useState('join');
    const [groupCode, setGroupCode] = useState('');
    const [groupData, setGroupData] = useState({
        short_name: '',
        long_name: '',
        contact_email: '',
        contact_phone: '',
        logo: null
    });
    const [managementDetails, setManagementDetails] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [calendarId, setCalendarId] = useState(null);
    const [groupId, setGroupId] = useState(null);
    const [activeCard, setActiveCard] = useState(null);
    const { toast } = useToast()
    const calendarRef = useRef(null);
    const kanbanRef = useRef(null);
    const equipoRef = useRef(null);

    useEffect(() => {
        const checkGroup = async () => {
            setIsLoading(true);
            try {
                const response = await getData('/groups/details');
                if (response && response.success && response.data && response.data.group) {
                    setManagementDetails(response.data.group);
                    setCalendarId(response.data.group.calendar_id);
                    setGroupId(response.data.group.id);
                    setIsInGroup(true);
                } else {
                    setIsInGroup(false);
                }
            } catch (error) {
                if (error.response && (error.response.status === 404 || error.response.data.code === 267)) {
                    setIsInGroup(false);
                } else {
                    console.error('Error checking group:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkGroup();
    }, []);

    useEffect(() => {
        if (activeCard === 'planificacion' && calendarRef.current) {
            calendarRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeCard === 'tablero' && kanbanRef.current) {
            kanbanRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeCard === 'equipo' && equipoRef.current) {
            equipoRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeCard]);

    const handleJoinGroup = async () => {
        setIsLoading(true);
        try {
            const response = await postData('/groups/join', { group_code: groupCode });
            if (response && response.success) {
                setIsInGroup(true);
                setManagementDetails(response.data.group);
                setCalendarId(response.data.group.calendar_id);
                setGroupId(response.data.group.id);
                showToast('Te has unido al grupo exitosamente', false);
            }
        } catch (error) {
            console.error('Error joining group:', error);
            showToast('Error al unirse al grupo', true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('short_name', groupData.short_name);
        formData.append('long_name', groupData.long_name);
        formData.append('contact_email', groupData.contact_email);
        formData.append('contact_phone', groupData.contact_phone);
        if (groupData.logo) {
            formData.append('logo', groupData.logo);
        }

        try {
            const response = await postData('/groups', formData);
            if (response && response.success) {
                setIsInGroup(true);
                setManagementDetails(response.data.group);
                setGeneratedCode(response.data.group.code);
                setCalendarId(response.data.group.calendar_id);
                setGroupId(response.data.group.id);
                showToast('Grupo creado exitosamente', false);
            }
        } catch (error) {
            console.error('Error creating group:', error);
            showToast('Error al crear el grupo', true);
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message, isError) => {
        toast({
            title: isError ? "Error" : "Éxito",
            description: message,
            variant: isError ? "destructive" : "default",
        })
    };

    const handleCardClick = (card) => {
        setActiveCard(activeCard === card ? null : card);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-2 text-lg font-medium text-purple-600">Cargando...</span>
            </div>
        );
    }

    if (isInGroup && managementDetails) {
        return (
            <div className="space-y-6">
                <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">Detalles del Grupo</CardTitle>
                        <CardDescription className="text-purple-200">Información y gestión de tu grupo de trabajo</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20 border-2 border-white">
                                    <AvatarImage src={managementDetails.logo} alt={managementDetails.short_name} />
                                    <AvatarFallback className="bg-purple-300 text-purple-800 text-2xl font-bold">
                                        {managementDetails.short_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">{managementDetails.short_name}</h2>
                                    <p className="text-lg text-purple-200">{managementDetails.long_name}</p>
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-5 w-5 text-purple-300" />
                                    <p>{managementDetails.contact_email}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5 text-purple-300" />
                                    <p>{managementDetails.contact_phone}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Hash className="h-5 w-5 text-purple-300" />
                                    <p>{managementDetails.code}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                                    Editar Grupo
                                </Button>
                                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                                    Invitar Miembros
                                </Button>
                                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                                    Configuración
                                </Button>
                                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                                    Reportes
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'planificacion' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('planificacion')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Calendar className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Planificación</CardTitle>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'tablero' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('tablero')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <LayoutDashboard className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Tablero</CardTitle>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'equipo' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('equipo')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Users className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Equipo</CardTitle>
                        </CardContent>
                    </Card>
                </div>
                <div ref={calendarRef} className={activeCard === 'planificacion' ? '' : 'hidden'}>
                    <CalendarioEventos calendarId={calendarId} />
                </div>
                <div ref={kanbanRef} className={activeCard === 'tablero' ? '' : 'hidden'}>
                    <SprintKanbanBoard groupId={groupId} />
                </div>
                <div ref={equipoRef} className={activeCard === 'equipo' ? '' : 'hidden'}>
                    <Card>
                        <CardContent>
                            <p>Contenido del Equipo (en desarrollo)</p>
                        </CardContent>
                    </Card>
                </div>
                <Toaster />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <Button
                    onClick={() => setView('join')}
                    className={`px-4 py-2 ${view === 'join' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                    Unirse por código
                </Button>
                <Button
                    onClick={() => setView('create')}
                    className={`px-4 py-2 ${view === 'create' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                    Crear grupo
                </Button>
            </div>
            {view === 'join' && (
                <Card className="bg-white p-6 rounded-lg shadow-md">
                    <CardHeader>
                        <CardTitle className="text-center">Unirse a un grupo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Ingrese el código del grupo"
                            value={groupCode}
                            onChange={(e) => setGroupCode(e.target.value)}
                            className="w-full p-2 border rounded mb-4" />
                        <Button
                            onClick={handleJoinGroup}
                            className="w-full bg-purple-600 text-white p-2 rounded">Unirse al grupo</Button>
                    </CardContent>
                </Card>
            )}
            {view === 'create' && (
                <Card className="bg-white p-6 rounded-lg shadow-md">
                    <CardHeader>
                        <CardTitle className="text-center">Crear grupo de trabajo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Nombre corto"
                            value={groupData.short_name}
                            onChange={(e) => setGroupData({ ...groupData, short_name: e.target.value })}
                            className="w-full p-2 border rounded" />
                        <Input
                            placeholder="Nombre largo"
                            value={groupData.long_name}
                            onChange={(e) => setGroupData({ ...groupData, long_name: e.target.value })}
                            className="w-full p-2 border rounded" />
                        <Input
                            placeholder="Correo de contacto"
                            value={groupData.contact_email}
                            onChange={(e) => setGroupData({ ...groupData, contact_email: e.target.value })}
                            className="w-full p-2 border rounded" />
                        <Input
                            placeholder="Teléfono de contacto"
                            value={groupData.contact_phone}
                            onChange={(e) => setGroupData({ ...groupData, contact_phone: e.target.value })}
                            className="w-full p-2 border rounded" />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <p>Logo de la empresa</p>
                            <Input
                                type="file"
                                onChange={(e) => setGroupData({ ...groupData, logo: e.target.files[0] })}
                                className="w-full p-2 border rounded" />
                            <label
                                htmlFor="logo-upload"
                                className="cursor-pointer text-purple-600 hover:text-purple-800">
                                Subir logo
                            </label>
                        </div>
                        <Button
                            onClick={handleCreateGroup}
                            className="w-full bg-purple-600 text-white p-2 rounded">Crear Grupo</Button>
                    </CardContent>
                </Card>
            )}
            <Toaster />
        </div>
    );
}