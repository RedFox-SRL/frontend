import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getData, postData } from '../api/apiService';

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

export default function GruposYPlanificacion() {
  const [isInGroup, setIsInGroup] = useState(false);  // Indica si está en un grupo
  const [view, setView] = useState('join');  // Alternar entre 'join' y 'create'
  const [groupCode, setGroupCode] = useState('');  // Código para unirse a un grupo
  const [groupData, setGroupData] = useState({  // Datos del formulario de creación de grupo
    short_name: '',
    long_name: '',
    contact_email: '',
    contact_phone: '',
    logo: null
  });
  const [events, setEvents] = useState([]);  // Eventos para el calendario
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [managementDetails, setManagementDetails] = useState(null);  // Detalles del grupo
  const [generatedCode, setGeneratedCode] = useState('');  // Código del grupo creado

  // Verificar si el usuario está inscrito en un grupo (usando /groups/details)
  useEffect(() => {
    const checkGroup = async () => {
      try {
        const response = await getData('/groups/details');  // Nueva ruta para verificar el grupo
        if (response && response.success && response.data && response.data.group) {
          setManagementDetails(response.data.group);
          setIsInGroup(true);  // Está en un grupo
        } else {
          setIsInGroup(false);  // No está en un grupo
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

  // Unirse a un grupo (usando /groups/join)
  const handleJoinGroup = async () => {
    try {
      const response = await postData('/groups/join', { group_code: groupCode });
      if (response && response.success && response.data && response.data.group) {
        setAlertMessage('Te has unido al grupo exitosamente.');
        setIsError(false);
        setIsInGroup(true);
        setManagementDetails(response.data.group);  // Almacena los detalles del grupo
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

  // Crear un nuevo grupo (usando /groups con método POST)
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
        setAlertMessage('Grupo creado exitosamente.');
        setGeneratedCode(response.data.group.code);  // Guarda el código generado del grupo
        setIsError(false);
      } else {
        setAlertMessage('Error al crear el grupo.');
        setIsError(true);
      }
    } catch (error) {
      setAlertMessage('Error al crear el grupo.');
      setIsError(true);
    } finally {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Manejar la adición de un nuevo evento
  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      setEvents([...events, {
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end)
      }]);
      setNewEvent({ title: '', start: '', end: '' });
      setIsDialogOpen(false);
    }
  };

  // Si el usuario está en un grupo, mostrar los detalles del grupo
  if (isInGroup && managementDetails) {
    return (
      <div className="space-y-6">
        <Card className="bg-purple-200">
          <CardHeader>
            <CardTitle>{managementDetails.short_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{managementDetails.long_name}</p>
            <p>Contacto: {managementDetails.contact_email} - {managementDetails.contact_phone}</p>
            <p>Representante: {managementDetails.representative.name} {managementDetails.representative.last_name}</p>
            <p>Miembros: {managementDetails.members.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Planificación</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Nuevo evento</Button>
              </DialogTrigger>
              <DialogContent className="bg-purple-100">
                <DialogHeader>
                  <DialogTitle className="text-purple-800">Nuevo Evento</DialogTitle>
                </DialogHeader>
                <Card className="bg-white">
                  <CardContent className="space-y-4 pt-4">
                    <Input
                      placeholder="Título"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="border-purple-300 focus:border-purple-500"
                    />
                    <Input
                      type="date"
                      placeholder="Fecha de inicio"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                      className="border-purple-300 focus:border-purple-500"
                    />
                    <Input
                      type="date"
                      placeholder="Fecha de fin"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                      className="border-purple-300 focus:border-purple-500"
                    />
                    <Button onClick={handleAddEvent} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Guardar
                    </Button>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              views={['month', 'week', 'day']}
              className="rounded-lg overflow-hidden"
              messages={messages}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no está en un grupo, mostrar ambos formularios
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
              onChange={(e) => setGroupData({...groupData, short_name: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <Input
              placeholder="Nombre largo"
              value={groupData.long_name}
              onChange={(e) => setGroupData({...groupData, long_name: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <Input
              placeholder="Correo de contacto"
              value={groupData.contact_email}
              onChange={(e) => setGroupData({...groupData, contact_email: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <Input
              placeholder="Teléfono de contacto"
              value={groupData.contact_phone}
              onChange={(e) => setGroupData({...groupData, contact_phone: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p>Logo de la empresa</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setGroupData({...groupData, logo: e.target.files[0]})}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer text-purple-600 hover:text-purple-800">
                Subir imagen
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