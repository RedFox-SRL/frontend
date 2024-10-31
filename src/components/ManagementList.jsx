import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const isCurrentManagement = (startDate, endDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
};

export default function ManagementList({
                                           managements,
                                           onSelectManagement,
                                           onCreateNew,
                                       }) {
    const [showCurrent, setShowCurrent] = useState(true);

    const formatManagementTitle = (semester, startDate) => {
        const year = new Date(startDate).getFullYear();
        const managementNumber = semester === "first" ? 1 : 2;
        return `Gestión ${managementNumber}/${year}`;
    };

    const currentManagements = managements.filter((management) =>
        isCurrentManagement(management.start_date, management.end_date),
    );

    const allManagements = managements;

    const toggleView = () => {
        setShowCurrent(!showCurrent);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h1 className="text-3xl font-extrabold text-purple-700">
                    {showCurrent ? "Gestión Actual" : "Historial de Gestiones"}
                </h1>
                <div className="flex space-x-4">
                    <Button
                        onClick={onCreateNew}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 px-4 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Gestión
                    </Button>
                    <Button
                        onClick={toggleView}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                    >
                        {showCurrent ? "Ver Historial" : "Ver Gestión Actual"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showCurrent ? (
                    currentManagements.length > 0 ? (
                        currentManagements.map((management) => (
                            <Card
                                key={management.id}
                                className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl"
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-purple-600 capitalize">
                                        {formatManagementTitle(
                                            management.semester,
                                            management.start_date,
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-gray-600">
                                        <strong>Fecha de Inicio:</strong> {management.start_date}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Fecha de Fin:</strong> {management.end_date}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Límite de Grupos:</strong> {management.group_limit}
                                    </p>
                                    <Button
                                        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                                        onClick={() => onSelectManagement(management)}
                                    >
                                        Ver Gestión
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">
                            No hay gestiones activas en este momento.
                        </p>
                    )
                ) : allManagements.length > 0 ? (
                    allManagements.map((management) => (
                        <Card
                            key={management.id}
                            className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl"
                        >
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-purple-600 capitalize">
                                    {formatManagementTitle(
                                        management.semester,
                                        management.start_date,
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-gray-600">
                                    <strong>Fecha de Inicio:</strong> {management.start_date}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Fecha de Fin:</strong> {management.end_date}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Límite de Grupos:</strong> {management.group_limit}
                                </p>
                                <Button
                                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                                    onClick={() => onSelectManagement(management)}
                                >
                                    Ver Gestión
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500">
                        No hay gestiones disponibles.
                    </p>
                )}
            </div>
        </div>
    );
}
