import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getData, postData } from "../api/apiService";

const COLORS = ["#a78bfa", "#c4b5fd", "#8b5cf6"];

export default function SprintEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [newStrength, setNewStrength] = useState("");
    const [newWeakness, setNewWeakness] = useState("");
    const [grades, setGrades] = useState({});
    const [comments, setComments] = useState({});
    const [summary, setSummary] = useState("");
    const { toast } = useToast();

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

                    if (error.response && error.response.data && error.response.data.code === 298) {
                        toast({
                            title: "Evaluación ya realizada",
                            description: "Este sprint ya ha sido evaluado. No se puede realizar otra evaluación.",
                            status: "info", // Tipo de mensaje
                            variant: "outline", // Variación visual para que sea amigable
                            className: "bg-blue-500 text-white", // Estilo de la notificación
                        });
                    } else {
                        toast({
                            title: "Error al cargar el template",
                            description: "Hubo un problema al intentar cargar la plantilla de evaluación del sprint.",
                            status: "error",
                            variant: "destructive",
                        });
                    }
                }
            };
            fetchSprintEvaluationTemplate();
        }
    }, [selectedSprintId]);


    const handleSaveEvaluation = async () => {
        if (!template || Object.keys(grades).length === 0 || Object.keys(comments).length === 0 || !summary) {
            toast({
                title: "Error",
                description: "Todos los campos de evaluación deben estar completos, incluyendo el resumen.",
                variant: "destructive",
            });
            return;
        }

        const studentGrades = template.student_summaries.map(student => ({
            student_id: student.id,
            grade: parseInt(grades[student.id], 10) || 0,
            comments: comments[student.id] || ""
        }));

        const postDataPayload = {
            summary,
            student_grades: studentGrades,
            strengths,
            weaknesses
        };

        try {
            await postData(`/sprints/${selectedSprintId}/sprint-evaluation`, postDataPayload);
            toast({
                title: "Éxito",
                description: "Evaluación guardada con éxito.",
                status: "success",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error al guardar la evaluación.",
                status: "error",
                variant: "destructive",
            });
        }
    };

    const addStrength = () => {
        if (newStrength && newStrength.length <= 80 && strengths.length < 10) {
            setStrengths([...strengths, newStrength]);
            setNewStrength("");
        } else {
            toast({
                title: "Error",
                description: "El texto supera los 80 caracteres, está vacío o se alcanzó el límite de 10 fortalezas.",
                variant: "destructive", // Toast para errores
            });
        }
    };

    const addWeakness = () => {
        if (newWeakness && newWeakness.length <= 80 && weaknesses.length < 10) {
            setWeaknesses([...weaknesses, newWeakness]);
            setNewWeakness("");
        } else {
            toast({
                title: "Error",
                description: "El texto supera los 80 caracteres, está vacío o se alcanzó el límite de 10 debilidades.",
                variant: "destructive", // Toast para errores
            });
        }
    };

    const removeStrength = (index) => {
        setStrengths(strengths.filter((_, i) => i !== index));
    };

    const removeWeakness = (index) => {
        setWeaknesses(weaknesses.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e, type) => {
        if (e.key === "Enter") {
            e.preventDefault();
            type === "strength" ? addStrength() : addWeakness();
        }
    };

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <h1 className="text-2xl font-bold text-center mb-4 text-purple-600">Evaluación de Sprint</h1>

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

            {/* Mostrar mensaje o contenido del Sprint */}
            {template && (!template.weekly_evaluations_summary || template.weekly_evaluations_summary.length === 0) ? (
                <div className="p-6 bg-red-100 border border-red-400 text-red-800 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold">No se realizaron evaluaciones semanales este sprint</h1>
                    <p className="mt-2 text-sm">
                        Es necesario registrar evaluaciones semanales para habilitar este módulo. Por favor, regrese y
                        complete las evaluaciones semanales para continuar.
                    </p>
                </div>
            ) : (
                template && (
                <>
                    {/* Información sobre el Sprint */}
                    <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                        <h2 className="text-purple-700 text-lg font-semibold">{template.sprint_title}</h2>
                        <p><strong>Fecha de inicio:</strong> {new Date(template.start_date.item).toLocaleDateString()}</p>
                        <p><strong>Fecha de fin:</strong> {new Date(template.end_date.item).toLocaleDateString()}</p>
                        <p><strong>Porcentaje Planeado:</strong> {template.percentage}%</p>
                        <p><strong>Funcionalidades Planeadas:</strong></p>
                        <ul className="list-disc ml-4">
                            {template.planned_features.split("\n").map((feature, index) => (
                                <li key={index}>{feature.trim()}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Progreso General de Tareas */}
                    <div className="mt-4">
                        <h2 className="text-purple-600 mb-4">Progreso General de Tareas</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[{ name: "Hecho", value: template.overall_progress.completed_tasks }, { name: "En progreso", value: template.overall_progress.in_progress_tasks }, { name: "Por hacer", value: template.overall_progress.todo_tasks }]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                            <div className="flex justify-around">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                                    <span>Hecho: {template.overall_progress.completed_tasks}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                                    <span>En progreso: {template.overall_progress.in_progress_tasks}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                                    <span>Por hacer: {template.overall_progress.todo_tasks}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Evaluaciones Semanales */}
                    <div className="mt-4">
                        <h2 className="text-purple-600 mb-4">Resumen de Evaluaciones Semanales</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[{ name: "Min Satisfacción", value: template.weekly_evaluations_summary[0].min_satisfaction }, { name: "Max Satisfacción", value: template.weekly_evaluations_summary[0].max_satisfaction }]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                            <p className="text-purple-600">Tareas Evaluadas: {template.weekly_evaluations_summary[0].tasks_evaluated}</p>
                            <p className="text-purple-600">Satisfacción Promedio: {template.weekly_evaluations_summary[0].average_satisfaction}</p>
                            <p className="text-purple-600">Fecha de Evaluación: {new Date(template.weekly_evaluations_summary[0].evaluation_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Evaluación de Estudiantes */}
                    <div className="space-y-4 mt-6">
                        <h2 className="text-purple-600 mb-4">Ponderación y Calificación de Estudiantes</h2>
                        {template.student_summaries.length > 0 ? (
                            template.student_summaries.map((student) => {
                                const noParticipationMessage = student.tasks_summary.completed === 0 ? "Este miembro no participó en el sprint" : null;

                                return (
                                    <div key={student.id} className="bg-gray-100 rounded-lg p-4 mb-4">
                                        <h3 className="text-purple-700 font-semibold">{student.name} {student.last_name}</h3>
                                        {noParticipationMessage ? (
                                            <p className="text-black">{noParticipationMessage}</p>
                                        ) : (
                                            <>
                                                <p>Tareas completadas: {student.tasks_summary.completed} de {student.tasks_summary.total}</p>
                                                <p>Calificación Promedio: {student.satisfaction_levels.average || "N/A"} / 5</p>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <PieChart>
                                                        <Pie
                                                            data={[{ name: "Hecho", value: student.tasks_summary.completed }, { name: "En progreso", value: student.tasks_summary.in_progress }, { name: "Por hacer", value: student.tasks_summary.todo }]}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {COLORS.map((color, index) => (
                                                                <Cell key={`cell-${index}`} fill={color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </>
                                        )}
                                        <div className="flex justify-around mt-2 text-sm">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                                                <span>Hecho: {student.tasks_summary.completed}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                                                <span>En progreso: {student.tasks_summary.in_progress}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                                                <span>Por hacer: {student.tasks_summary.todo}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col mt-4 space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Ponderación</label>
                                            <div className="flex items-center">
                                                <input
                                                    type="text" // Cambié el tipo a "text" para evitar problemas con el tipo numérico
                                                    placeholder={`(${template.percentage})`}
                                                    value={grades[student.id] || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        if (/^\d*\.?\d*$/.test(value) && (value === "" || parseFloat(value) <= template.percentage)) {
                                                            setGrades((prevGrades) => ({
                                                                ...prevGrades,
                                                                [student.id]: value,
                                                            }));
                                                        }
                                                    }}
                                                    className="border border-gray-300 rounded-md p-2 w-24"
                                                />
                                                <span
                                                    className="ml-2 text-sm text-gray-500">/{template.percentage}</span>
                                            </div>

                                            <textarea
                                                placeholder="Comentarios sobre el rendimiento"
                                                value={comments[student.id] || ""}
                                                onChange={(e) => setComments({
                                                    ...comments,
                                                    [student.id]: e.target.value
                                                })}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-purple-600">Este miembro no participó en el sprint</p>
                        )}
                    </div>

                    {/* Fortalezas y Debilidades */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-purple-600 mb-4">Fortalezas*</h2>
                            <ul className="list-disc ml-4 space-y-2">
                                {strengths.map((strength, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <span>{strength}</span>
                                        <Trash2
                                            className="text-red-600 cursor-pointer"
                                            onClick={() => removeStrength(index)}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center mt-2">
                                <input
                                    type="text"
                                    value={newStrength}
                                    maxLength={80}
                                    onChange={(e) => setNewStrength(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, "strength")}
                                    placeholder="Añadir fortaleza"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                <Plus
                                    className="text-purple-600 cursor-pointer ml-2"
                                    onClick={addStrength}
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-purple-600 mb-4">Debilidades*</h2>
                            <ul className="list-disc ml-4 space-y-2">
                                {weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <span>{weakness}</span>
                                        <Trash2
                                            className="text-red-600 cursor-pointer"
                                            onClick={() => removeWeakness(index)}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center mt-2">
                                <input
                                    type="text"
                                    value={newWeakness}
                                    maxLength={80}
                                    onChange={(e) => setNewWeakness(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, "weakness")}
                                    placeholder="Añadir debilidad"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                                <Plus
                                    className="text-purple-600 cursor-pointer ml-2"
                                    onClick={addWeakness}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resumen del Sprint */}
                    <div className="mt-4">
                        <h2 className="text-purple-600 mb-4">Resumen del Sprint</h2>
                        <textarea
                            placeholder="Escribe un resumen del sprint"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md mt-4"
                        onClick={handleSaveEvaluation}
                    >
                        Guardar evaluación
                    </button>
                </>
                )
            )}
        </div>
    );
}
