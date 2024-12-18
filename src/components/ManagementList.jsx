import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Users, Calendar } from "lucide-react";
import CreateManagement from "./CreateManagement";
import { getData } from "../api/apiService";

const isCurrentManagement = (startDate, endDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
};

export default function ManagementList({ onSelectManagement }) {
    const [managements, setManagements] = useState([]);
    const [isCreatingManagement, setIsCreatingManagement] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadManagements();
    }, []);

    const loadManagements = async () => {
        setIsLoading(true);
        try {
            const response = await getData("/managements");
            if (response.success) {
                setManagements(response.data.items);
            } else {
                setManagements([]);
            }
        } catch (error) {
            console.error("Error al cargar gestiones:", error);
            setManagements([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManagementCreated = (newManagement) => {
        setManagements((prev) => [...prev, newManagement]);
        setIsCreatingManagement(false);
        onSelectManagement(newManagement);
    };

    const currentManagements = managements.filter((management) =>
        isCurrentManagement(management.start_date, management.end_date)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500 text-lg">Cargando gestiones...</p>
            </div>
        );
    }

    if (currentManagements.length === 0 || isCreatingManagement) {
        return (
            <CreateManagement
                onManagementCreated={handleManagementCreated}
            />
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-extrabold text-purple-700">Gestión Actual</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentManagements.map((management) => (
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
                                onClick={() => onSelectManagement(management)}
                            >
                                <span>Ver Gestión</span>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
