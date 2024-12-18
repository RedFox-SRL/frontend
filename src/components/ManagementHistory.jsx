import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getData } from "../api/apiService";
import { Clipboard, Users, Calendar } from "lucide-react";
import ManagementView from "./ManagementView";

export default function ManagementHistory({ onSelectManagement }) {
    const [isLoading, setIsLoading] = useState(true);
    const [managements, setManagements] = useState([]);
    const [selectedManagement, setSelectedManagement] = useState(null);

    // Función para obtener la gestión actual
    const isCurrentManagement = (management) => {
        const now = new Date();
        const startDate = new Date(management.start_date);
        const endDate = new Date(management.end_date);

        return now >= startDate && now <= endDate;
    };

    // Función para obtener todas las gestiones (excluyendo la actual)
    const fetchManagements = async () => {
        setIsLoading(true);
        try {
            const response = await getData("/managements");
            if (response && response.success && Array.isArray(response.data.items)) {
                const filteredManagements = response.data.items.filter(
                    (management) => !isCurrentManagement(management)
                );
                setManagements(filteredManagements);
            } else {
                setManagements([]);
            }
        } catch (error) {
            console.error("Error al cargar el historial de semestres:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar gestiones al montar el componente
    useEffect(() => {
        fetchManagements();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500 text-lg">Cargando historial de semestres pasados...</p>
            </div>
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
                <h3 className="font-extrabold text-purple-700">Historial de semestres pasados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managements.length > 0 ? (
                    managements.map((management) => (
                        <Card
                            key={management.id}
                            className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border-2 border-purple-600 bg-white"
                        >
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-purple-700">
                                    {management.semester === "first" ? "Primer semestre" : "Segundo semestre"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-purple-700">
                                <p className="flex items-center">
                                    <Clipboard className="w-5 h-5 mr-2 text-purple-600" />
                                    <strong>Código de Gestión:</strong> {management.code}
                                </p>
                                <p className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                                    <strong>Entrega del Proyecto:</strong>{" "}
                                    {management.project_delivery_date
                                        ? new Date(management.project_delivery_date).toISOString().split("T")[0]
                                        : "Aún no establecido"}
                                </p>
                                <p className="flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                                    <strong>Límite de Grupos:</strong> {management.group_limit}
                                </p>
                                <Button
                                    className="mt-4 w-full bg-purple-600 text-white hover:bg-purple-700 transition duration-300 rounded-md flex items-center justify-center"
                                    onClick={() => setSelectedManagement(management)}
                                >
                                    <span>Ver semestre</span>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No tiene semestres previos.</p>
                )}
            </div>
        </div>
    );
}
