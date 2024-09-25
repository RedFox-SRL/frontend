import React, { useState, useEffect } from 'react';
import { getData } from '../api/apiService';
import CreateManagement from './CreateManagement';
import ManagementList from './ManagementList';
import ManagementView from './ManagementView';

export default function DashboardTeacher() {
    const [isLoading, setIsLoading] = useState(true);
    const [managements, setManagements] = useState([]);
    const [selectedManagement, setSelectedManagement] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Función para obtener todas las gestiones
    const fetchManagements = async () => {
        setIsLoading(true);
        try {
            const response = await getData('/managements');
            console.log('Respuesta de la API al cargar gestiones:', response);
            if (response && response.success && Array.isArray(response.data.items)) {
                setManagements(response.data.items);
            } else {
                setManagements([]);
            }
        } catch (error) {
            console.error('Error al cargar las gestiones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar las gestiones al montar el componente
    useEffect(() => {
        fetchManagements();
    }, []);

    // Manejar la creación de una nueva gestión
    const handleManagementCreated = () => {
        fetchManagements();
        setShowCreateForm(false);
    };

    // Función para cancelar la creación y volver al listado
    const handleCancelCreateManagement = () => {
        setShowCreateForm(false);
    };

    // Seleccionar una gestión para verla
    const handleSelectManagement = (management) => {
        setSelectedManagement(management);  // Almacenar la gestión seleccionada
    };

    // Función para regresar al listado desde la vista de una gestión
    const handleBackToList = () => {
        setSelectedManagement(null);  // Volver al listado de gestiones
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span>Cargando...</span>
            </div>
        );
    }

    // Mostrar la vista de la gestión seleccionada
    if (selectedManagement) {
        return <ManagementView management={selectedManagement} onBack={handleBackToList} />;
    }

    // Mostrar el formulario para crear gestión si no hay ninguna o si se selecciona crear una nueva
    if (showCreateForm || managements.length === 0) {
        return (
            <CreateManagement
                onManagementCreated={handleManagementCreated}
                onCancel={handleCancelCreateManagement}
            />
        );
    }

    // Mostrar el listado de gestiones creadas
    return (
        <ManagementList
            managements={managements}
            onSelectManagement={handleSelectManagement}  // Pasar la gestión seleccionada al hacer clic
            onCreateNew={() => setShowCreateForm(true)}
        />
    );
}
