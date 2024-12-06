import React, {useEffect, useState} from "react";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {Star} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyHistory({evaluations}) {
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedMember, setSelectedMember] = useState("Todos los miembros");
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
        if (evaluations && evaluations.length > 0) {
            setSelectedWeek(evaluations[0].week_number.toString());
        }
    }, [evaluations]);

    useEffect(() => {
        if (evaluations && selectedWeek) {
            const weekEvaluation = evaluations.find(evaluation => evaluation.week_number.toString() === selectedWeek);
            if (weekEvaluation) {
                if (selectedMember === "Todos los miembros") {
                    setFilteredTasks(weekEvaluation.tasks);
                } else {
                    setFilteredTasks(
                        weekEvaluation.tasks.filter((task) =>
                            task.assigned_to.some((member) => `${member.name} ${member.last_name}` === selectedMember)
                        )
                    );
                }
            }
        }
    }, [selectedWeek, selectedMember, evaluations]);

    const calculateAverageRating = () => {
        if (!filteredTasks.length) return 0;
        const totalRating = filteredTasks.reduce((sum, task) => sum + task.satisfaction_level, 0);
        return totalRating / filteredTasks.length;
    };

    const memberList = evaluations && evaluations.length > 0
        ? ["Todos los miembros", ...new Set(evaluations[0].tasks.flatMap((task) =>
            task.assigned_to.map((member) => `${member.name} ${member.last_name}`)
        ))]
        : ["Todos los miembros"];

    const taskData = filteredTasks.reduce((acc, task) => {
        task.assigned_to.forEach((member) => {
            const memberName = `${member.name} ${member.last_name}`;
            const existingMember = acc.find((m) => m.name === memberName);
            if (existingMember) {
                existingMember.value += 1;
            } else {
                acc.push({name: memberName, value: 1});
            }
        });
        return acc;
    }, []);

    const averageRating = calculateAverageRating();

    if (!evaluations || evaluations.length === 0) {
        return <div>No hay historial de evaluaciones disponible.</div>;
    }

    return (
        <Card className="w-full mb-4 shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-purple-600">Historial Semanal</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <h2 className="text-purple-600 mb-2">Seleccionar Semana</h2>
                        <Select
                            value={selectedWeek}
                            onValueChange={(value) => setSelectedWeek(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar semana"/>
                            </SelectTrigger>
                            <SelectContent>
                                {evaluations.map((evaluation) => (
                                    <SelectItem key={evaluation.week_number} value={evaluation.week_number.toString()}>
                                        Semana {evaluation.week_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-1/2">
                        <h2 className="text-purple-600 mb-2">Filtrar por Miembro</h2>
                        <Select
                            value={selectedMember}
                            onValueChange={(value) => setSelectedMember(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar miembro"/>
                            </SelectTrigger>
                            <SelectContent>
                                {memberList.map((member) => (
                                    <SelectItem key={member} value={member}>
                                        {member}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <h2 className="text-purple-600 mb-2">Calificación Promedio</h2>
                    <div className="flex space-x-1">
                        {Array.from({length: 5}, (_, i) => (
                            <Star
                                key={i}
                                className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
                                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-purple-600 mb-2">Estado de Participación</h2>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({name, value}) => `${name}: ${value}`}
                                >
                                    {taskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h2 className="text-purple-600 mb-2">Tareas Completadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                            <Card key={task.id} className="bg-white shadow-md">
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-purple-600">{task.title}</h3>
                                    <p className="text-gray-600">{task.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Encargado(s):{" "}
                                        {task.assigned_to
                                            .map((member) => `${member.name} ${member.last_name}`)
                                            .join(", ")}
                                    </p>
                                    <div className="mt-2">
                                        <p className="font-semibold">
                                            Satisfacción:{" "}
                                            <span className="text-purple-600">
                                                {
                                                    [
                                                        "Malo",
                                                        "Regular",
                                                        "Aceptable",
                                                        "Bueno",
                                                        "Excelente",
                                                    ][task.satisfaction_level - 1]
                                                }
                                            </span>
                                        </p>
                                        <p className="text-gray-500">{task.comments}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}