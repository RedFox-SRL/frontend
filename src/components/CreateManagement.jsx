import React, { useState, useEffect } from 'react';
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

    // Detectar automáticamente el semestre en función de la fecha de inicio
    useEffect(() => {
        const startMonth = new Date(newManagement.start_date).getMonth() + 1;

        if (startMonth >= 1 && startMonth <= 6) {
            setNewManagement(prevState => ({ ...prevState, semester: 'first' }));
        } else if (startMonth >= 7 && startMonth <= 12) {
            setNewManagement(prevState => ({ ...prevState, semester: 'second' }));
        }
    }, [newManagement.start_date]);

    // Validar formulario
    const validateForm = () => {
        const startDate = new Date(newManagement.start_date);
        const endDate = new Date(newManagement.end_date);

        if (startDate >= endDate) {
            setAlertMessage('La fecha de inicio debe ser anterior a la fecha de fin.');
            setIsError(true);
            return false;
        }

        if (!newManagement.semester || !newManagement.start_date || !newManagement.end_date || !newManagement.group_limit) {
            setAlertMessage('Todos los campos son obligatorios.');
            setIsError(true);
            return false;
        }

        return true;
    };

    // Crear gestión
    const handleCreateManagement = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setIsError(false);
        setAlertMessage('');

        const managementData = {
            ...newManagement,
            group_limit: parseInt(newManagement.group_limit, 10),
        };

        console.log('Datos a enviar:', managementData);

        try {
            const response = await postData('/managements', managementData);

            if (response && response.success) {
                setAlertMessage('Gestión creada con éxito.');
                onManagementCreated(response.data);
            } else {
                setIsError(true);
                setAlertMessage('Error al crear la gestión ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            setIsError(true);
            if (error.response && error.response.data) {
                setAlertMessage('Error al crear la gestión ');
            } else {
                setAlertMessage('Error al crear la gestión ');
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setAlertMessage(''), 3000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewManagement({
            ...newManagement,
            [name]: value
        });
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Crear una nueva gestión</h1>

            {/* Fecha de inicio */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
            <Input
                name="start_date"
                type="date"
                placeholder="Fecha de inicio"
                value={newManagement.start_date}
                onChange={handleInputChange}
                className="mb-4"
            />

            {/* Fecha de fin */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
            <Input
                name="end_date"
                type="date"
                placeholder="Fecha de fin"
                value={newManagement.end_date}
                onChange={handleInputChange}
                className="mb-4"
            />

            {/* Límite de grupos */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Límite de grupos</label>
            <Input
                name="group_limit"
                type="number"
                placeholder="Límite de grupos"
                value={newManagement.group_limit}
                onChange={handleInputChange}
                className="mb-4"
            />

            {/* Campo de semestre basado en la fecha de inicio */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
            <Input
                name="semester"
                placeholder="Semestre"
                value={newManagement.semester === 'first' ? 'Primer semestre' : 'Segundo semestre'}
                disabled
                className="mb-4"
            />

            {/* Botón para crear la gestión */}
            <Button onClick={handleCreateManagement} className="w-full bg-purple-600 hover:bg-purple-700">
                {isLoading ? 'Creando...' : 'Crear Gestión'}
            </Button>

            {/* Botón para volver al listado (esquina inferior derecha) */}
            <Button
                onClick={onCancel}
                className="absolute bottom-4 right-4 bg-gray-400 hover:bg-gray-500">
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