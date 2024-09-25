import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagementList({ managements, onSelectManagement, onCreateNew }) {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-purple-700 mb-6 text-center">Lista de Gestiones</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managements.map((management) => (
                    <Card key={management.id} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-purple-600 capitalize">
                                {management.semester}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-gray-600"><strong>Fecha de Inicio:</strong> {management.start_date}</p>
                            <p className="text-gray-600"><strong>Fecha de Fin:</strong> {management.end_date}</p>
                            <p className="text-gray-600"><strong>Límite de Grupos:</strong> {management.group_limit}</p>
                            <Button
                                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                                onClick={() => onSelectManagement(management)}
                            >
                                Ver Gestión
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Floating Button for Creating New Management */}
            <Button
                onClick={onCreateNew}
                className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-110">
                +
            </Button>
        </div>
    );
}
