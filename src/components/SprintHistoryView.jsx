import React, { useState, useEffect } from "react";
import { getData } from "../api/apiService";
import { CheckCircle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"]; // Colores consistentes

export default function SprintHistoryView({ sprintId }) {
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (sprintId) {
                setLoading(true);
                try {
                    const response = await getData(`/sprints/${sprintId}/sprint-evaluation`);
                    setEvaluation(response.data.evaluation);
                } catch (error) {
                    console.error("Error al cargar la evaluación del sprint:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEvaluation();
    }, [sprintId]);

    const renderPieChartLegend = (labels) => (
        <div className="flex flex-wrap justify-center mt-2 gap-2">
            {labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                    <span className="text-gray-700">{label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold text-purple-700 mb-4 text-center">Reporte de Sprint</h1>

            {loading && <p className="text-center text-gray-500">Cargando...</p>}

            {!loading && !evaluation && (
                <div className="text-center text-gray-500">
                    <p>No se encontró información para este sprint.</p>
                </div>
            )}

            {!loading && evaluation && (
                <div className="space-y-6">
                    {/* Resumen del Sprint */}
                    <div className="bg-purple-50 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-purple-700 mb-4">Resumen del Sprint</h2>
                        <p className="text-gray-700">
                            <strong>Resumen:</strong> {evaluation.summary}
                        </p>
                        <p className="text-gray-700">
                            <strong>Fecha de Creación:</strong>{" "}
                            {new Date(evaluation.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                            <strong>Última Actualización:</strong>{" "}
                            {new Date(evaluation.updated_at).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Características planeadas:</strong>
                        </p>
                        <ul className="list-disc pl-5 text-gray-700">
                            {evaluation.planned_features.split("\n").map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Estado General y Progreso Total */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-50 rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-bold text-purple-700 mb-4">Estado General y Progreso Total</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Por hacer", value: evaluation.overall_progress.todo_tasks },
                                            { name: "En progreso", value: evaluation.overall_progress.in_progress_tasks },
                                            { name: "Hecho", value: evaluation.overall_progress.completed_tasks },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            {renderPieChartLegend(["Por hacer", "En progreso", "Hecho"])}
                            <div className="text-center mt-4">
                                <p>
                                    <strong>Por hacer:</strong> {evaluation.overall_progress.todo_tasks}
                                </p>
                                <p>
                                    <strong>En progreso:</strong> {evaluation.overall_progress.in_progress_tasks}
                                </p>
                                <p>
                                    <strong>Hecho:</strong> {evaluation.overall_progress.completed_tasks}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fortalezas y Debilidades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-lg shadow-md p-4">
                            <h2 className="text-purple-700 font-bold">Fortalezas</h2>
                            <ul>
                                {evaluation.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <CheckCircle color="green" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-purple-700 font-bold">Debilidades</h2>
                            <ul>
                                {evaluation.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-center space-x-2">
                                        <XCircle color="red" />
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
