import { useState, useEffect } from "react";
import { getData, postData } from "../api/apiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Star, CheckCircle, XCircle } from "lucide-react"; // Importa algunos iconos para mejorar la UI

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function SprintEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [summary, setSummary] = useState("");
    const [grades, setGrades] = useState({});

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

    const handleAddStrength = (strength) => {
        setStrengths([...strengths, strength]);
    };

    const handleAddWeakness = (weakness) => {
        setWeaknesses([...weaknesses, weakness]);
    };

    const handleGradeChange = (studentId, grade) => {
        setGrades({ ...grades, [studentId]: grade });
    };

    const handleSaveEvaluation = async () => {
        const payload = {
            summary,
            student_grades: Object.keys(grades).map((studentId) => ({
                student_id: parseInt(studentId),
                grade: grades[studentId],
                comments: "" // Agrega comentarios si es necesario
            })),
            strengths,
            weaknesses
        };
        try {
            await postData(`/sprints/${selectedSprintId}/sprint-evaluation`, payload);
            alert("Evaluación guardada con éxito.");
        } catch (error) {
            console.error("Error al guardar la evaluación:", error);
        }
    };

    const taskData = template
        ? [
            { name: "Por hacer", value: template.overall_progress.todo_tasks },
            { name: "En progreso", value: template.overall_progress.in_progress_tasks },
            { name: "Hecho", value: template.overall_progress.completed_tasks },
        ]
        : [];

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <h1 className="text-2xl font-bold text-center mb-4 text-purple-600">
                Evaluación de Sprint
            </h1>

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

            {template && (
                <>
                    <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                        <h2 className="text-purple-700 text-lg font-semibold">{template.sprint_title}</h2>
                        <p><strong>Fecha de inicio:</strong> {new Date(template.start_date.item).toLocaleDateString()}</p>
                        <p><strong>Fecha de fin:</strong> {new Date(template.end_date.item).toLocaleDateString()}</p>
                        <p><strong>Porcentaje Planeado:</strong> {template.percentage}%</p>
                        <p><strong>Progreso General:</strong> {template.overall_progress.completion_percentage}%</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
                            <h2 className="text-purple-600 mb-4">Fortalezas</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                placeholder="Agregar fortaleza"
                                className="border border-gray-300 rounded-md p-2 w-full mt-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddStrength(e.target.value);
                                }}
                            />
                        </div>

                        <div>
                            <h2 className="text-purple-600 mb-4">Debilidades</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {weaknesses.map((weakness, index) => (
                                    <li key={index}>{weakness}</li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                placeholder="Agregar debilidad"
                                className="border border-gray-300 rounded-md p-2 w-full mt-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddWeakness(e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
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

                        <div>
                            <h2 className="text-purple-600 mb-4">Ponderación y Calificación de Estudiantes</h2>
                            {template.student_summaries.map((student) => (
                                <div key={student.id} className="bg-gray-100 p-4 rounded-md shadow mb-4">
                                    <h3 className="text-lg font-semibold">{student.name} {student.last_name}</h3>
                                    <p>Tareas completadas: {student.tasks_summary.completed} de {student.tasks_summary.total}</p>
                                    <p>Calificación Promedio: {student.satisfaction_levels.average}</p>
                                    <input
                                        type="number"
                                        placeholder="Ponderación"
                                        className="border border-gray-300 rounded-md p-2 w-full mt-2"
                                        onChange={(e) => handleGradeChange(student.id, parseInt(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveEvaluation}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md mt-4"
                    >
                        Guardar Evaluación
                    </button>
                </>
            )}
        </div>
    );
}
