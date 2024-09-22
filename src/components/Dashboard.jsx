import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getData, postData } from '../api/apiService';

const localizer = momentLocalizer(moment);

export default function Dashboard() {
  const [isInGroup, setIsInGroup] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [events, setEvents] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [managementDetails, setManagementDetails] = useState(null);

  // Verificar si el estudiante está inscrito
  useEffect(() => {
    const checkManagement = async () => {
      try {
        const response = await getData('/student/management');

        // Asegurarnos de acceder correctamente al campo `data.management`
        if (response && response.success && response.data && response.data.management) {
          setManagementDetails(response.data.management);  // Guarda los detalles del grupo
          setIsInGroup(true);  // Indica que el usuario está inscrito
        } else {
          setIsInGroup(false);  // Si no tiene detalles, indica que no está inscrito
        }
      } catch (error) {
        // Manejo de errores específicos
        if (error.response) {
          if (error.response.status === 404) {
            setIsInGroup(false);  // No está inscrito
          } else if (error.response.status === 401) {
            setAlertMessage('No autorizado. Por favor, inicia sesión.');
            setIsError(true);
          } else if (error.response.status === 400) {
            setAlertMessage('No eres un estudiante.');
            setIsError(true);
          }
        } else {
          console.error('Error checking management:', error);
        }
      }
    };

    checkManagement();
  }, []);

  // Unirse a un grupo
  const handleJoinGroup = async () => {
    try {
      const response = await postData('/managements/join', { management_code: groupCode });

      // Si la unión al grupo es exitosa
      if (response && response.success && response.data && response.data.management) {
        setAlertMessage('Te has unido al grupo exitosamente.');
        setIsError(false);
        setIsInGroup(true);  // Actualiza el estado para indicar que está en un grupo
        setManagementDetails(response.data.management);  // Actualiza los detalles del grupo
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

  // Mostrar la interfaz del grupo si está inscrito
  if (isInGroup && managementDetails) {
    return (
      <div className="space-y-6">
        <div className="bg-purple-200 p-4 rounded-lg">
          <h3 className="font-bold text-lg">{managementDetails.name}</h3>
          <p className="font-semibold">Lic Corina</p>
          <p>Fecha de próxima entrega</p>
          <p className="font-semibold">16/06/2024</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Mi grupo de desarrollo</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">RedFox SRL</p>
              <p>Iteración</p>
              <p className="font-semibold">1/5</p>
            </div>
            <div>
              <p>Representante legal</p>
              <p className="font-semibold">Oliver Alandia</p>
            </div>
            <div>
              <p>Miembros</p>
              <p className="font-semibold">6</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-purple-100">
            <h3 className="font-bold text-lg">Planificación</h3>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded" onClick={() => {}}>
              Nuevo evento
            </button>
          </div>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['month', 'week', 'day']}
          />
        </div>
      </div>
    );
  }

  // Si no está inscrito, mostrar el formulario para unirse a un grupo
  return (
    <div className="space-y-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-center font-bold text-lg mb-4">NO ESTAS INSCRITO EN UN CURSO</h3>
        <input
          type="text"
          placeholder="Ingrese el código de la clase"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button onClick={handleJoinGroup} className="w-full bg-purple-600 text-white p-2 rounded">Unirse a Clase</button>
      </div>
      {showAlert && (
        <div className={`p-4 border-l-4 ${isError ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'}`} role="alert">
          <p className="font-bold">{alertMessage}</p>
        </div>
      )}
    </div>
  );
}
