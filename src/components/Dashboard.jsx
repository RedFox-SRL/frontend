import React, { useState, useEffect } from 'react';
import { getData, postData } from '../api/apiService';

export default function Dashboard() {
  const [isInGroup, setIsInGroup] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [managementDetails, setManagementDetails] = useState(null);

  useEffect(() => {
    const checkManagement = async () => {
      try {
        const response = await getData('/student/management');
        if (response && response.success && response.data && response.data.management) {
          setManagementDetails(response.data.management);
          setIsInGroup(true);
        } else {
          setIsInGroup(false);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            setIsInGroup(false);
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

  const handleJoinGroup = async () => {
    try {
      const response = await postData('/managements/join', { management_code: groupCode });
      if (response && response.success && response.data && response.data.management) {
        setAlertMessage('Te has unido al grupo exitosamente.');
        setIsError(false);
        setIsInGroup(true);
        setManagementDetails(response.data.management);
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

  if (isInGroup && managementDetails) {
    return (
      <div className="space-y-4">
        <h3 className="text-center font-bold text-lg mb-4">Estás inscrito en un curso</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>ID:</strong> {managementDetails.id}</p>
          <p><strong>Teacher ID:</strong> {managementDetails.teacher_id}</p>
          <p><strong>Code:</strong> {managementDetails.code}</p>
          <p><strong>Semester:</strong> {managementDetails.semester}</p>
          <p><strong>Start Date:</strong> {managementDetails.start_date}</p>
          <p><strong>End Date:</strong> {managementDetails.end_date}</p>
          <p><strong>Group Limit:</strong> {managementDetails.group_limit}</p>
          <p><strong>Is Code Active:</strong> {managementDetails.is_code_active ? 'Yes' : 'No'}</p>
          <p><strong>Created At:</strong> {managementDetails.created_at}</p>
          <p><strong>Updated At:</strong> {managementDetails.updated_at}</p>
        </div>
      </div>
    );
  }

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