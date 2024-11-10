import { useState, useEffect } from "react";
import { getData, postData } from "../api/apiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ProgressBar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#D8BFD8"];

export default function SprintEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [newStrength, setNewStrength] = useState("");
    const [newWeakness, setNewWeakness] = useState("");
    const [grades, setGrades] = useState({});
    const [summary, setSummary] = useState("");

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await getData(`/sprints?group_id=${groupId}`);
                setSprints(response || []);
            } catch (err) {
                console.error("Error al obtener los sprints:", err);
            }
        };
        fetchSprints();
    }, [groupId]);

    useEffect(() => {
        if (selectedSprintId) {
            const fetchSprintEvaluationTemplate = async () => {
                try {
                    const response = await getData(`/sprints/${selectedSprintId}/sprint-evaluation-template`);
                    setTemplate(response.data.template);
                } catch (error) {
                    console.error("Error al cargar la plantilla de evaluación de sprint:", error);
                }
            };
            fetchSprintEvaluationTemplate();
        }
    }, [selectedSprintId]);

    const handleAddStrength = () => {
        if (newStrength) setStrengths([...strengths, newStrength]);
        setNewStrength("");
    };

    const handleAddWeakness = () => {
        if (newWeakness) setWeaknesses([...weaknesses, newWeakness]);
        setNewWeakness("");
    };

    const handleGradeChange = (studentId, value) => {
        setGrades((prev) => ({ ...prev, [studentId]: value }));
    };

    const taskData = template
        ? [
            { name: "Por hacer", value: template.overall_progress.todo_tasks },
            { name: "En progreso", value: template.overall_progress.in_progress_tasks },
            { name: "Hecho", value: template.overall_progress.completed_tasks },
        ]
        : [];

    const weeklySummary = template?.weekly_evaluations_summary[0];
    const studentSummaries = template?.student_summaries || [];

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full bg-gray-50">
            <h1 className="text-2xl font-bold text-center mb-4 text-purple-600">
                Evaluación de Sprint
            </h1>

            <div className="space-y-4">
                {/* Selección de Sprint */}
                <div>
                    <h2 className="text-purple-600 mb-2">Seleccionar Sprint</h2>
                    <select
                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                        value={selectedSprintId || ""}
                        onChange={(e) => setSelectedSprintId(e.target.value)}
                    >
                        <option value="">Seleccionar Sprint</option>
                        {sprints.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>
                                {sprint.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Información del Sprint */}
                {template && (
                    <Card className="bg-white rounded-lg shadow-md p-4 space-y-2">
                        <CardHeader>
                            <CardTitle className="text-purple-700 text-lg font-semibold">{template.sprint_title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Fecha de inicio:</strong> {new Date(template.start_date.item).toLocaleDateString()}</p>
                            <p><strong>Fecha de fin:</strong> {new Date(template.end_date.item).toLocaleDateString()}</p>
                            <p><strong>Porcentaje Planeado:</strong> {template.percentage}%</p>
                            <ProgressBar className="mt-2" value={template.overall_progress.completion_percentage} max={100} />
                        </CardContent>
                    </Card>
                )}

                {/* Gráfico de Progreso */}
                <div className="mt-6">
                    <h2 className="text-purple-600 mb-4">Progreso General de Tareas</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={taskData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {taskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Resumen de Evaluación Semanal */}
                {weeklySummary && (
                    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                        <h2 className="text-purple-700 font-semibold">Resumen de Evaluación Semanal</h2>
                        <p><strong>Semana:</strong> {weeklySummary.week_number}</p>
                        <p><strong>Fecha de Evaluación:</strong> {new Date(weeklySummary.evaluation_date).toLocaleDateString()}</p>
                        <p><strong>Tareas Evaluadas:</strong> {weeklySummary.tasks_evaluated}</p>
                        <p><strong>Calificación Promedio:</strong> {weeklySummary.average_satisfaction.toFixed(2)} (Min: {weeklySummary.min_satisfaction}, Max: {weeklySummary.max_satisfaction})</p>
                    </div>
                )}

                {/* Resumen de Miembros */}
                {studentSummaries.map((member) => (
                    <Card key={member.id} className="bg-gray-100 rounded-lg shadow-md p-4 mt-4">
                        <CardHeader>
                            <CardTitle className="font-semibold text-purple-700">{member.name} {member.last_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Resumen de Tareas: {member.tasks_summary.completed} de {member.tasks_summary.total} completadas</p>
                            <p>Calificación Promedio: {member.satisfaction_levels.average}</p>
                            <ProgressBar className="mt-2" value={(member.tasks_summary.completed / member.tasks_summary.total) * 100} max={100} />
                            <div className="mt-2">
                                <label>Ponderación:</label>
                                <select
                                    className="border border-gray-300 rounded p-1 text-sm w-full mt-2"
                                    value={grades[member.id] || ""}
                                    onChange={(e) => handleGradeChange(member.id, e.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    {[...Array(5)].map((_, i) => (
                                        <option key={i} value={i + 1}>{i + 1} Estrella(s)</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Fortalezas y Debilidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card className="bg-white p-4">
                        <CardHeader>
                            <CardTitle className="text-purple-700">Fortalezas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strengths.map((strength, index) => (
                                <p key={index} className="border-b p-2">{strength}</p>
                            ))}
                            <input
                                type="text"
                                value={newStrength}
                                onChange={(e) => setNewStrength(e.target.value)}
                                placeholder="Agregar fortaleza"
                                className="border border-gray-300 rounded-md p-2 w-full mt-2"
                            />
                            <button onClick={handleAddStrength} className="text-purple-600 text-sm mt-2">+ Añadir Fortaleza</button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white p-4">
                        <CardHeader>
                            <CardTitle className="text-purple-700">Debilidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weaknesses.map((weakness, index) => (
                                <p key={index} className="border-b p-2">{weakness}</p>
                            ))}
                            <input
                                type="text"
                                value={newWeakness}
                                onChange={(e) => setNewWeakness(e.target.value)}
                                placeholder="Agregar debilidad"
                                className="border border-gray-300 rounded-md p-2 w-full mt-2"
                            />
                            <button onClick={handleAddWeakness} className="text-purple-600 text-sm mt-2">+ Añadir Debilidad</button>
                        </CardContent>
                    </Card>
                </div>

                {/* Botón de Guardar Evaluación */}
                <button
                    onClick={() => postData(`/sprints/${selectedSprintId}/sprint-evaluation`, { summary, student_grades: grades, strengths, weaknesses })}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md mt-4"
                >
                    Guardar evaluación
                </button>
            </div>
        </div>
    );
}
