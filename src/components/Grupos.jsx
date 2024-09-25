import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getData, postData, putData, deleteData } from '../api/apiService';

const localizer = momentLocalizer(moment);

const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Sin eventos"
};

export default function Grupos() {
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
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [managementDetails, setManagementDetails] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [calendarId, setCalendarId] = useState(null);

    useEffect(() => {
        const checkGroup = async () => {
            try {
                const response = await getData('/groups/details');
                if (response && response.success && response.data && response.data.group) {
                    setManagementDetails(response.data.group);
                    setCalendarId(response.data.group.calendar_id);
                    fetchEvents(response.data.group.calendar_id);
                    setIsInGroup(true);
                }
                else {
                    setIsInGroup(false);
                }
            } catch (error) {
                if (error.response && (error.response.status === 404 || error.response.data.code === 267)) {
                    setIsInGroup(false);
                } else {
                    console.error('Error checking group:', error);
                }
            }
        };

        checkGroup();
    }, []);

    const fetchEvents = async (calendarId) => {
        try {
            const response = await getData(`/events?calendar_id=${calendarId}`);
            setEvents(response.map(event => ({
                ...event,
                start: new Date(event.event_date),
                end: new Date(event.event_date)
            })));
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleJoinGroup = async () => {
        try {
            const response = await postData('/groups/join', { group_code: groupCode });
            if (response && response.success) {
                setIsInGroup(true);
                setManagementDetails(response.data.group);
                setCalendarId(response.data.group.calendar_id);
                fetchEvents(response.data.group.calendar_id);
            }
        } catch (error) {
            console.error('Error joining group:', error);
            setIsError(true);
            setAlertMessage('Error al unirse al grupo');
            setShowAlert(true);
        }
    };

    const handleCreateGroup = async () => {
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
                fetchEvents(response.data.group.calendar_id);
                setAlertMessage('Grupo creado exitosamente');
                setIsError(false);
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error creating group:', error);
            setIsError(true);
            setAlertMessage('Error al crear el grupo');
            setShowAlert(true);
        }
    };

    const handleAddEvent = async () => {
        if (newEvent.title && newEvent.start && newEvent.end) {
            try {
                const response = await postData('/events', {
                    title: newEvent.title,
                    event_date: newEvent.start,
                    calendar_id: calendarId
                });
                setEvents([...events, {
                    ...response,
                    start: new Date(response.event_date),
                    end: new Date(response.event_date)
                }]);
                setNewEvent({ title: '', start: '', end: '' });
                setIsDialogOpen(false);
            } catch (error) {
                console.error('Error adding event:', error);
            }
        }
    };

    const handleUpdateEvent = async () => {
        if (selectedEvent) {
            try {
                const response = await putData(`/events/${selectedEvent.id}`, {
                    title: selectedEvent.title,
                    event_date: selectedEvent.start
                });
                setEvents(events.map(e => (e.id === selectedEvent.id ? { ...response, start: new Date(response.event_date), end: new Date(response.event_date) } : e)));
                setSelectedEvent(null);
                setIsDialogOpen(false);
            } catch (error) {
                console.error('Error updating event:', error);
            }
        }
    };

    const handleDeleteEvent = async () => {
        if (selectedEvent) {
            try {
                await deleteData(`/events/${selectedEvent.id}`);
                setEvents(events.filter(event => event.id !== selectedEvent.id));
                setSelectedEvent(null);
                setIsDialogOpen(false);
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const openEventDialog = (event) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
    };

    if (isInGroup && managementDetails) {
        return (
            <div className="space-y-6">
                <Card className="bg-purple-200">
                    <CardHeader>
                        <CardTitle>Detalles del Grupo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Nombre corto: {managementDetails.short_name}</p>
                        <p>Nombre largo: {managementDetails.long_name}</p>
                        <p>Correo de contacto: {managementDetails.contact_email}</p>
                        <p>Teléfono de contacto: {managementDetails.contact_phone}</p>
                        <p>Código del grupo: {managementDetails.code}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-lg">
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Calendario de Eventos</CardTitle>
                        <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 text-white">Agregar Evento</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            messages={messages}
                            style={{ height: 500 }}
                            onSelectEvent={openEventDialog}
                        />
                    </CardContent>
                </Card>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Agregar Nuevo Evento'}</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="Título del evento"
                            value={selectedEvent ? selectedEvent.title : newEvent.title}
                            onChange={(e) => selectedEvent ? setSelectedEvent({ ...selectedEvent, title: e.target.value }) : setNewEvent({ ...newEvent, title: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <Input
                            type="datetime-local"
                            value={selectedEvent ? selectedEvent.start : newEvent.start}
                            onChange={(e) => selectedEvent ? setSelectedEvent({ ...selectedEvent, start: e.target.value }) : setNewEvent({ ...newEvent, start: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <Input
                            type="datetime-local"
                            value={selectedEvent ? selectedEvent.end : newEvent.end}
                            onChange={(e) => selectedEvent ? setSelectedEvent({ ...selectedEvent, end: e.target.value }) : setNewEvent({ ...newEvent, end: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="flex space-x-4">
                            {selectedEvent ? (
                                <>
                                    <Button onClick={handleUpdateEvent} className="w-full bg-purple-600 text-white p-2 rounded">Actualizar Evento</Button>
                                    <Button onClick={handleDeleteEvent} className="w-full bg-red-600 text-white p-2 rounded">Eliminar Evento</Button>
                                </>
                            ) : (
                                <Button onClick={handleAddEvent} className="w-full bg-purple-600 text-white p-2 rounded">Agregar Evento</Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <Button onClick={() => setView('join')} className={`px-4 py-2 ${view === 'join' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                    Unirse por código
                </Button>
                <Button onClick={() => setView('create')} className={`px-4 py-2 ${view === 'create' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
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
                            className="w-full p-2 border rounded mb-4"
                        />
                        <Button onClick={handleJoinGroup} className="w-full bg-purple-600 text-white p-2 rounded">Unirse al grupo</Button>
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
                            className="w-full p-2 border rounded"
                        />
                        <Input
                            placeholder="Nombre largo"
                            value={groupData.long_name}
                            onChange={(e) => setGroupData({ ...groupData, long_name: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <Input
                            placeholder="Correo de contacto"
                            value={groupData.contact_email}
                            onChange={(e) => setGroupData({ ...groupData, contact_email: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <Input
                            placeholder="Teléfono de contacto"
                            value={groupData.contact_phone}
                            onChange={(e) => setGroupData({ ...groupData, contact_phone: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <p>Logo de la empresa</p>
                            <Input
                                type="file"
                                onChange={(e) => setGroupData({ ...groupData, logo: e.target.files[0] })}
                                className="w-full p-2 border rounded"
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer text-purple-600 hover:text-purple-800">
                                Subir logo
                            </label>
                        </div>
                        <Button onClick={handleCreateGroup} className="w-full bg-purple-600 text-white p-2 rounded">Crear Grupo</Button>
                    </CardContent>
                </Card>
            )}

            {showAlert && (
                <Alert>
                    <AlertTitle>{isError ? 'Error' : 'Éxito'}</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                    {generatedCode && <p>El código de su grupo es: {generatedCode}</p>}
                </Alert>
            )}
        </div>
    );
}