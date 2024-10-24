import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd'];

const data = [
    { name: 'Por hacer', value: 48.8 },
    { name: 'En progreso', value: 24.3 },
    { name: 'Hecho', value: 26.9 },
];

export default function StudentReport() {
    return (
        <div className="container mx-auto p-4 sm:p-6 bg-purple-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-purple-600">Reporte del Estudiante</h1>
                <div className="w-[70px]"></div>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Estudiante: Oliver Alandia</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Tasa de participación</h3>
                                    <div className="text-4xl sm:text-5xl font-bold text-purple-600">45%</div>
                                    <p className="text-sm sm:text-base text-gray-600 mt-1">Número de tareas realizadas: 8</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                                    <p className="text-md sm:text-lg text-purple-600 font-semibold">Bueno</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Estado de tareas</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Recomendación</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-md sm:text-lg text-gray-700">Continuar con el buen trabajo, pero mejorar en las tareas pendientes.</p>
                </CardContent>
            </Card>
        </div>
    );
}
