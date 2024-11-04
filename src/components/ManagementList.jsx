import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";

const isCurrentManagement = (startDate, endDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
};

export default function ManagementList({ managements, onSelectManagement, onCreateNew }) {
    const currentManagements = managements.filter((management) =>
        isCurrentManagement(management.start_date, management.end_date)
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-purple-700">Gestión Actual</h1>
                <Button
                    onClick={onCreateNew}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 px-4"
                >
                    Nueva Gestión
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentManagements.length > 0 ? (
                    currentManagements.map((management) => (
                        <Card
                            key={management.id}
                            className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        >
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    {`Gestión ${management.semester === "first" ? 1 : 2}/${new Date(
                                        management.start_date
                                    ).getFullYear()}`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <strong>Fecha de Inicio:</strong> {management.start_date}
                                </p>
                                <p className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <strong>Fecha de Fin:</strong> {management.end_date}
                                </p>
                                <p className="flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    <strong>Límite de Grupos:</strong> {management.group_limit}
                                </p>
                                <Button
                                    className="mt-4 w-full bg-white text-purple-700 hover:bg-gray-100 transition duration-300 rounded-md flex items-center justify-center"
                                    onClick={() => onSelectManagement(management)}
                                >
                                    <span className="mr-2">Ver Gestión</span>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No hay gestiones activas en este momento.</p>
                )}
            </div>
        </div>
    );
}
