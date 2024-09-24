"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { getData, postData, putData, deleteData } from '../api/apiService';
import { Loader2 } from "lucide-react";

moment.locale('es');
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    work_week: 'Semana laboral',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: total => `+ Ver más (${total})`,
};

const formats = {
    monthHeaderFormat: 'MMMM YYYY',
    weekdayFormat: 'dddd',
    dayFormat: 'D [de] MMMM',
    dayRangeHeaderFormat: ({ start, end }) =>
        `${moment(start).format('D [de] MMMM')} - ${moment(end).format('D [de] MMMM [de] YYYY')}`,
    dayHeaderFormat: 'dddd D [de] MMMM',
    eventTimeRangeFormat: ({ start, end }) =>
        `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
    timeGutterFormat: 'HH:mm',
    agendaDateFormat: 'D [de] MMMM',
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }) =>
        `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
};

export default function CalendarioEventos({ calendarId }) {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({title: '', start: '', end: '', description: ''});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast()

    useEffect(() => {
        fetchEvents();
    }, [calendarId]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/events?calendar_id=${calendarId}`);
            setEvents(response.map(event => ({
                ...event,
                start: new Date(event.start_date),
                end: new Date(event.end_date)
            })));
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Error al cargar los eventos', true);
        } finally {
            setIsLoading(false);
        }
    };

    const validateEventForm = (event) => {
        const errors = {};
        if (!event.title.trim()) errors.title = "El título es requerido";
        if (!event.start) errors.start = "La fecha de inicio es requerida";
        if (!event.end) errors.end = "La fecha de fin es requerida";
        if (event.start && event.end && moment(event.start).isAfter(moment(event.end))) {
            errors.end = "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddEvent = async () => {
        if (validateEventForm(newEvent)) {
            try {
                const response = await postData('/events', {
                    title: newEvent.title,
                    description: newEvent.description,
                    start_date: newEvent.start,
                    end_date: newEvent.end,
                    calendar_id: calendarId
                });
                setEvents([...events, {
                    ...response,
                    start: new Date(response.start_date),
                    end: new Date(response.end_date)
                }]);
                setNewEvent({title: '', start: '', end: '', description: ''});
                setIsDialogOpen(false);
                showToast('Evento creado exitosamente', false);
            } catch (error) {
                console.error('Error adding event:', error);
                showToast('Error al crear el evento', true);
            }
        }
    };

    const handleUpdateEvent = async () => {
        if (validateEventForm(selectedEvent)) {
            try {
                const response = await putData(`/events/${selectedEvent.id}`, {
                    title: selectedEvent.title,
                    description: selectedEvent.description,
                    start_date: selectedEvent.start,
                    end_date: selectedEvent.end
                });
                setEvents(events.map(e => (e.id === selectedEvent.id ? {
                    ...response,
                    start: new Date(response.start_date),
                    end: new Date(response.end_date)
                } : e)));
                setSelectedEvent(null);
                setIsDialogOpen(false);
                showToast('Evento actualizado exitosamente', false);
            } catch (error) {
                console.error('Error updating event:', error);
                showToast('Error al actualizar el evento', true);
            }
        }
    };

    const handleDeleteEvent = async () => {
        setConfirmAction(() => async () => {
            try {
                await deleteData(`/events/${selectedEvent.id}`);
                setEvents(events.filter(event => event.id !== selectedEvent.id));
                setSelectedEvent(null);
                setIsDialogOpen(false);
                showToast('Evento eliminado exitosamente', false);
            } catch (error) {
                console.error('Error deleting event:', error);
                showToast('Error al eliminar el evento', true);
            }
        });
        setIsConfirmDialogOpen(true);
    };

    const showToast = (message, isError) => {
        toast({
            title: isError ? "Error" : "Éxito",
            description: message,
            variant: isError ? "destructive" : "default",
        })
    };

    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({
            title: '',
            start: start.toISOString().slice(0, 16),
            end: end.toISOString().slice(0, 16),
            description: ''
        });
        setIsDialogOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.start.toISOString().slice(0, 16),
            end: event.end.toISOString().slice(0, 16),
            description: event.description
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white shadow-lg">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Calendario de Eventos</CardTitle>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 text-white">Agregar Evento</Button>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[500px]">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <span className="ml-2 text-lg font-medium text-purple-600">Cargando eventos...</span>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            messages={messages}
                            formats={formats}
                            culture="es"
                            style={{height: 500}}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            views={['month', 'week', 'day', 'agenda']}
                            defaultView="month"
                        />
                    )}
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
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})}
                        className={`w-full p-2 border rounded mb-4 ${formErrors.title ? 'border-red-500' : ''}`}
                    />
                    {formErrors.title && <p className="text-red-500 text-sm mb-2">{formErrors.title}</p>}
                    <Input
                        type="datetime-local"
                        value={selectedEvent ? selectedEvent.start : newEvent.start}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, start: e.target.value}) : setNewEvent({...newEvent, start: e.target.value})}
                        className={`w-full p-2 border rounded mb-4 ${formErrors.start ? 'border-red-500' : ''}`}
                    />
                    {formErrors.start && <p className="text-red-500 text-sm mb-2">{formErrors.start}</p>}
                    <Input
                        type="datetime-local"
                        value={selectedEvent ? selectedEvent.end : newEvent.end}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, end: e.target.value}) : setNewEvent({...newEvent, end: e.target.value})}
                        className={`w-full p-2 border rounded mb-4 ${formErrors.end ? 'border-red-500' : ''}`}
                    />
                    {formErrors.end && <p className="text-red-500 text-sm mb-2">{formErrors.end}</p>}
                    <Input
                        placeholder="Descripción del evento"
                        value={selectedEvent ? selectedEvent.description : newEvent.description}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})}
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
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Acción</DialogTitle>
                    </DialogHeader>
                    <p>¿Está seguro de que desea eliminar este evento?</p>
                    <DialogFooter>
                        <Button onClick={() => setIsConfirmDialogOpen(false)} className="bg-gray-300 text-black">Cancelar</Button>
                        <Button onClick={() => {
                            confirmAction();
                            setIsConfirmDialogOpen(false);
                        }} className="bg-red-600 text-white">Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>
    );
}