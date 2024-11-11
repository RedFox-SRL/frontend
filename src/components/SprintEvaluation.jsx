import { useState, useEffect } from "react";
import { getData, postData } from "../api/apiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Trash, PlusCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    const [showTaskList, setShowTaskList] = useState({});
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
                }
            };
            fetchSprintEvaluationTemplate();
        }
    }, [selectedSprintId]);

    const handleAddStrength = () => {
        if (strengths.length < 10 && newStrength) {
            setStrengths([...strengths, newStrength]);
            setNewStrength("");
        } else {
            toast({
                title: "Error",
                description: "Máximo de 10 fortalezas alcanzado o campo vacío.",
                status: "error",
                style: { backgroundColor: 'red', color: 'white' }
            });
        }
    };

    const handleAddWeakness = () => {
        if (weaknesses.length < 10 && newWeakness) {
            setWeaknesses([...weaknesses, newWeakness]);
            setNewWeakness("");
        } else {
            toast({
                title: "Error",
                description: "Máximo de 10 debilidades alcanzado o campo vacío.",
                status: "error",
                style: { backgroundColor: 'red', color: 'white' }
            });
        }
    };

    const handleKeyPress = (e, type) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (type === "strength") handleAddStrength();
            else if (type === "weakness") handleAddWeakness();
        }
    };

    const handleGradeChange = (studentId, value) => {
        const maxPercentage = parseFloat(template.percentage);
        if (/^\d{1,3}$/.test(value) && value <= maxPercentage) {
            setGrades({ ...grades, [studentId]: value });
        } else {
            toast({
                title: "Error",
                description: `La calificación no puede exceder el ${maxPercentage}% del sprint.`,
                status: "error",
                style: { backgroundColor: 'red', color: 'white' }
            });
        }
    };

    const handleCommentChange = (studentId, value) => {
        setComments({ ...comments, [studentId]: value });
    };

    const handleSaveEvaluation = async () => {
        if (!template || Object.keys(grades).length === 0 || Object.keys(comments).length === 0) {
            toast({
                title: "Error",
                description: "Todos los campos de evaluación deben estar completos.",
                status: "error",
                style: { backgroundColor: 'red', color: 'white' }
            });
            return;
        }

        const studentGrades = template.student_summaries.map(student => ({
            student_id: student.id,
            grade: parseInt(grades[student.id], 10) || 0,
            comments: comments[student.id] || ""
        }));

        const postDataPayload = {
            summary: "Resumen del sprint",
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
                style: { backgroundColor: 'green', color: 'white' }
            });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                const message = error.response.data.message;
                toast({
                    title: "Error",
                    description: message,
                    status: "error",
                    style: { backgroundColor: 'red', color: 'white' }
                });
            } else {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al guardar la evaluación.",
                    status: "error",
                    style: { backgroundColor: 'red', color: 'white' }
                });
            }
        }
    };

    const taskData = template
        ? [
            { name: "Hecho", value: template.overall_progress.completed_tasks },
            { name: "En progreso", value: template.overall_progress.in_progress_tasks },
            { name: "Por hacer", value: template.overall_progress.todo_tasks },
        ]
        : [];

    const toggleTaskList = (studentId) => {
        setShowTaskList((prevState) => ({
            ...prevState,
            [studentId]: !prevState[studentId]
        }));
    };

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <h1 className="text-2xl font-bold text-center mb-4 text-purple-600">Evaluación de Sprint</h1>

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

                    <div className="mt-4">
                        <h2 className="text-purple-600 mb-4">Progreso General de Tareas</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={taskData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
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

                    <div className="space-y-4 mt-6">
                        <h2 className="text-purple-600 mb-4">Ponderación y Calificación de Estudiantes</h2>
                        {template.student_summaries.map((student) => (
                            <div key={student.id} className="bg-gray-100 rounded-lg p-4 mb-4">
                                <h3 className="text-purple-700 font-semibold">{student.name} {student.last_name}</h3>
                                <p>Tareas completadas: {student.tasks_summary.completed} de {student.tasks_summary.total}</p>
                                <p>Calificación Promedio: {student.satisfaction_levels.average} / 5</p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        placeholder={`Ponderación (0-${template.percentage})`}
                                        value={grades[student.id] || ""}
                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                        className="border border-gray-300 rounded-md p-2 w-24"
                                    />
                                    <span className="text-gray-500">/ {template.percentage}</span>
                                </div>
                                <textarea
                                    placeholder="Comentarios sobre el rendimiento"
                                    value={comments[student.id] || ""}
                                    onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2 mt-2"
                                />
                                <button
                                    className="text-purple-600 flex items-center mt-2"
                                    onClick={() => toggleTaskList(student.id)}
                                >
                                    {showTaskList[student.id] ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
                                    {showTaskList[student.id] ? "Ocultar listado de tareas" : "Ver listado de tareas"}
                                </button>
                                {showTaskList[student.id] && (
                                    <ul className="mt-2 space-y-1">
                                        {Object.values(student.task_details).map((task) => (
                                            <li key={task.id} className="border-b p-2">
                                                <strong>{task.title}</strong> - {task.status} - Satisfacción: {task.satisfaction_level || "N/A"}
                                                {task.comments && <p>{task.comments}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
                            <h2 className="text-purple-600 mb-4">Fortalezas</h2>
                            <div className="space-y-2">
                                {strengths.map((strength, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span>{strength}</span>
                                        <Trash
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => setStrengths(strengths.filter((_, i) => i !== index))}
                                        />
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={newStrength}
                                    onChange={(e) => setNewStrength(e.target.value)}
                                    onKeyDown={(e) => handleKeyPress(e, "strength")}
                                    placeholder="Agregar fortaleza"
                                    className="border border-gray-300 rounded-md p-2 w-full mt-2"
                                />
                                <button onClick={handleAddStrength} className="text-purple-600 flex items-center mt-2">
                                    <PlusCircle className="mr-2" /> Añadir Fortaleza
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-purple-600 mb-4">Debilidades</h2>
                            <div className="space-y-2">
                                {weaknesses.map((weakness, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span>{weakness}</span>
                                        <Trash
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => setWeaknesses(weaknesses.filter((_, i) => i !== index))}
                                        />
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={newWeakness}
                                    onChange={(e) => setNewWeakness(e.target.value)}
                                    onKeyDown={(e) => handleKeyPress(e, "weakness")}
                                    placeholder="Agregar debilidad"
                                    className="border border-gray-300 rounded-md p-2 w-full mt-2"
                                />
                                <button onClick={handleAddWeakness} className="text-purple-600 flex items-center mt-2">
                                    <PlusCircle className="mr-2" /> Añadir Debilidad
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md mt-4"
                        onClick={handleSaveEvaluation}
                    >
                        Guardar evaluación
                    </button>
                </>
            )}
        </div>
    );
}
