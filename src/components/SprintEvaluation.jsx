import React, { useState, useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { getData } from "../api/apiService";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

const ParticipationBar = ({ name, participation }) => (
    <div className="flex items-center mb-2">
        <span className="w-28 text-sm">{name}</span>
        <div className="flex-grow bg-purple-100 rounded-full h-2">
            <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${participation}%` }}
            />
        </div>
    </div>
);

export default function SprintEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRating, setSelectedRating] = useState("Bueno");
    const [recommendation, setRecommendation] = useState("");

    useEffect(() => {
        const fetchSprints = async () => {
            setIsLoading(true);
            try {
                const response = await getData(`/sprints?group_id=${groupId}`);
                if (response && response.length > 0) {
                    setSprints(response);
                } else {
                    console.log("No hay sprints activos en este grupo.");
                }
            } catch (err) {
                console.error("Error al obtener los sprints:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSprints();
    }, [groupId]);

    useEffect(() => {
        if (selectedSprintId) {
            const fetchSprintEvaluationTemplate = async (sprintId) => {
                setIsLoading(true);
                try {
                    const response = await getData(`/sprints/${sprintId}/sprint-evaluation-template`);
                    if (response.success) {
                        setTemplate(response.data.template);
                    } else {
                        console.error("Error al cargar la plantilla de evaluación de sprint");
                    }
                } catch (error) {
                    console.error("Error al cargar la plantilla de evaluación de sprint:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSprintEvaluationTemplate(selectedSprintId);
        }
    }, [selectedSprintId]);

    return (
        <div className="container mx-auto bg-purple-50 min-h-screen">
            <h1 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-purple-600">
                Evaluación de Sprint
            </h1>

            {/* Selección de Sprint */}
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
                <h2 className="font-bold text-lg mb-2">Seleccionar Sprint</h2>
                <select
                    value={selectedSprintId || ""}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                >
                    <option value="">Seleccionar Sprint</option>
                    {sprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                            {sprint.title}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <p className="text-center text-purple-600">Cargando...</p>
            )}

            {!isLoading && selectedSprintId && template && (
                <div className="space-y-4">
                    {/* Detalles del Sprint */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-bold text-purple-600">
                            {template.sprint_title}
                        </h3>
                        <p className="text-gray-600">
                            <strong>Fecha de inicio:</strong> {new Date(template.start_date.item).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                            <strong>Fecha de fin:</strong> {new Date(template.end_date.item).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                            <strong>Porcentaje Planeado:</strong> {template.percentage}%
                        </p>
                        <p className="text-gray-600">
                            <strong>Progreso General:</strong> {template.overall_progress.completion_percentage.toFixed(2)}%
                        </p>
                    </div>

                    {/* Resumen de Tareas */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="font-bold text-lg mb-2">Estado de las Tareas</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Por hacer", value: template.overall_progress.todo_tasks },
                                        { name: "En progreso", value: template.overall_progress.in_progress_tasks },
                                        { name: "Hecho", value: template.overall_progress.completed_tasks },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Resumen de los Miembros */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h4 className="font-bold text-lg mb-4">Resumen por Miembro</h4>
                        {template.student_summaries.map((member) => (
                            <div key={member.id} className="mb-4">
                                <h5 className="text-md font-semibold text-purple-600">
                                    {member.name} {member.last_name}
                                </h5>
                                <p className="text-gray-600">
                                    <strong>Tareas Totales:</strong> {member.tasks_summary.total}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Completadas:</strong> {member.tasks_summary.completed}
                                </p>
                                <p className="text-gray-600">
                                    <strong>En Progreso:</strong> {member.tasks_summary.in_progress}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Por Hacer:</strong> {member.tasks_summary.todo}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selección de Calificación */}
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
                <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                >
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Aceptable">Aceptable</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                </select>
            </div>

            {/* Recomendación */}
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
        <textarea
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Recomendación"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
        />
            </div>

            {/* Botón de Guardar */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md">
                Guardar evaluación
            </button>
        </div>
    );
}
