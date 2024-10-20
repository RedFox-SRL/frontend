import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd'];

const data = [
    { name: 'Por hacer', value: 48.8 },
    { name: 'En progreso', value: 24.3 },
    { name: 'Hecho', value: 26.9 },
];

export default function WeeklyReport() {
    const [selectedSprint, setSelectedSprint] = useState("Sprint 1");
    const [selectedMember, setSelectedMember] = useState("Oliver Alandia");

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6 text-purple-600">Reporte Semanal</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Filtrar por Miembro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-none p-0">
                            {['Oliver Alandia', 'Diego Sandoval', 'Diego Romero', 'Gilmar Orellana'].map((member, idx) => (
                                <li
                                    key={idx}
                                    className={`cursor-pointer p-2 ${selectedMember === member ? 'text-purple-600 font-bold' : 'text-gray-600'}`}
                                    onClick={() => setSelectedMember(member)}
                                >
                                    {member}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Sprint</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedSprint}
                                onChange={(e) => setSelectedSprint(e.target.value)}
                            >
                                <option value="Sprint 1">Sprint 1</option>
                                <option value="Sprint 2">Sprint 2</option>
                                <option value="Sprint 3">Sprint 3</option>
                            </select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{selectedSprint}: (2024-09-06 - 2024-09-13)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Tarea 1</h3>
                                <p>Descripción de la tarea 1</p>
                                <p className="text-sm text-purple-600 mt-2">Asignado a: {selectedMember}</p>
                                <a href="https://www.trackmaster.systems/" className="text-blue-600">Recurso</a>

                                <div className="mt-4">
                                    <label className="block mb-1">Calificación:</label>
                                    <p className="text-md text-purple-600 font-semibold">Bueno</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            innerRadius={50}
                                            outerRadius={70}
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
                                <div className="text-center mt-2">
                                    <p className="text-xl font-bold text-purple-600">{data[0].value}% Por hacer</p>
                                    <p className="text-md font-bold text-purple-500">{data[1].value}% En progreso</p>
                                    <p className="text-md font-bold text-purple-400">{data[2].value}% Hecho</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recomendación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md text-gray-700">Realizar ajustes en las tareas en progreso y finalizar las tareas por hacer para cumplir con el sprint.</p> {/* Texto estático */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
