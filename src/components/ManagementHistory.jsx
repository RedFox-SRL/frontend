import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getData } from "../api/apiService";
import { Calendar, Users } from "lucide-react"; // Importando los íconos de Lucide
import CreateManagement from "./CreateManagement";
import ManagementView from "./ManagementView";

export default function ManagementHistory({ onSelectManagement }) {
    const [isLoading, setIsLoading] = useState(true);
    const [managements, setManagements] = useState([]);
    const [selectedManagement, setSelectedManagement] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Función para obtener todas las gestiones (historial completo)
    const fetchManagements = async () => {
        setIsLoading(true);
        try {
            const response = await getData("/managements");
            if (response && response.success && Array.isArray(response.data.items)) {
                setManagements(response.data.items);
            } else {
                setManagements([]);
            }
        } catch (error) {
            console.error("Error al cargar el historial de gestiones:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar gestiones al montar el componente
    useEffect(() => {
        fetchManagements();
    }, []);

    // Función para formatear el título de la gestión
    const formatManagementTitle = (semester, startDate) => {
        const year = new Date(startDate).getFullYear();
        const semesterText = semester === "first" ? "1" : "2";
        return `Gestión ${semesterText}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div>Cargando...</div>
            </div>
        );
    }

    // Mostrar el formulario para crear gestión
    if (showCreateForm) {
        return (
            <CreateManagement
                onManagementCreated={() => {
                    fetchManagements();
                    setShowCreateForm(false);
                }}
                onCancel={() => setShowCreateForm(false)}
            />
        );
    }

    // Mostrar la vista de la gestión seleccionada
    if (selectedManagement) {
        return (
            <ManagementView
                management={selectedManagement}
                onBack={() => setSelectedManagement(null)}
            />
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-purple-700">Historial de Gestiones</h1>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 px-4"
                >
                    Nueva Gestión
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managements.length > 0 ? (
                    managements.map((management) => (
                        <Card
                            key={management.id}
                            className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-white transform hover:-translate-y-1"
                        >
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold capitalize">
                                    {formatManagementTitle(management.semester, management.start_date)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-purple-200" />
                                    <p className="text-sm">
                                        <strong>Fecha de Inicio:</strong> {management.start_date}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-purple-200" />
                                    <p className="text-sm">
                                        <strong>Fecha de Fin:</strong> {management.end_date}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-purple-200" />
                                    <p className="text-sm">
                                        <strong>Límite de Grupos:</strong> {management.group_limit}
                                    </p>
                                </div>
                                <Button
                                    className="mt-4 w-full bg-white text-purple-600 hover:bg-purple-200 rounded-md py-2 transition duration-300 font-semibold"
                                    onClick={() => setSelectedManagement(management)}
                                >
                                    Ver Gestión
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No se encontraron gestiones en el historial.</p>
                )}
            </div>
        </div>
    );
}
