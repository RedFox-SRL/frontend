import React, { useState } from 'react';
import { postData } from '../api/apiService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateManagement({ onManagementCreated, onCancel }) {
    const [newManagement, setNewManagement] = useState({
        semester: '',
        start_date: '',
        end_date: '',
        group_limit: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Función para validar el formulario antes de hacer la solicitud
    const validateForm = () => {
        if (!newManagement.semester || !newManagement.start_date || !newManagement.end_date || !newManagement.group_limit) {
            setAlertMessage('Todos los campos son obligatorios.');
            setIsError(true);
            return false;
        }
        return true;
    };

    // Función para crear la gestión
    const handleCreateManagement = async () => {
        if (!validateForm()) {
            return;  // Si la validación falla, no continuar
        }

        setIsLoading(true);
        setIsError(false);
        setAlertMessage('');  // Reiniciar el mensaje de alerta

        console.log('Datos a enviar:', newManagement);

        try {
            const response = await postData('/managements', newManagement);
            console.log('Respuesta de la API al crear gestión:', response); // Log para verificar la respuesta

            if (response && response.success) {
                setAlertMessage('Gestión creada con éxito.');
                onManagementCreated(response.data);  // Llamar al callback cuando la gestión es creada
            } else {
                setIsError(true);
                setAlertMessage('Error al crear la gestión: ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            setIsError(true);
            console.error('Error al hacer la solicitud POST:', error); // Log para identificar el error
            setAlertMessage('Error al crear la gestión: ' + error.message);
        } finally {
            setIsLoading(false);
            setTimeout(() => setAlertMessage(''), 3000);  // Ocultar la alerta después de 3 segundos
        }
    };

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`${name}: ${value}`); // Verificar qué valor se está capturando
        setNewManagement({
            ...newManagement,
            [name]: value
        });
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Crear una nueva gestión</h1>
            <Input
                name="semester"
                placeholder="Semestre"
                value={newManagement.semester}
                onChange={handleInputChange}
                className="mb-4"
            />
            <Input
                name="start_date"
                type="date"
                placeholder="Fecha de inicio"
                value={newManagement.start_date}
                onChange={handleInputChange}
                className="mb-4"
            />
            <Input
                name="end_date"
                type="date"
                placeholder="Fecha de fin"
                value={newManagement.end_date}
                onChange={handleInputChange}
                className="mb-4"
            />
            <Input
                name="group_limit"
                type="number"
                placeholder="Límite de grupos"
                value={newManagement.group_limit}
                onChange={handleInputChange}
                className="mb-4"
            />

            <Button onClick={handleCreateManagement} className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? 'Creando...' : 'Crear Gestión'}
            </Button>

            {/* Botón para volver al listado */}
            <Button onClick={onCancel} className="w-full mt-2 bg-gray-400 hover:bg-gray-500">
                Volver al Listado
            </Button>

            {alertMessage && (
                <div className={`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>
                    {alertMessage}
                </div>
            )}
        </div>
    );
}
