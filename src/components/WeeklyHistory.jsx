import { useState, useEffect } from "react";
import { getData } from "../api/apiService";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Star } from "lucide-react";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyHistory({ sprintId }) {
    const [evaluationData, setEvaluationData] = useState(null);
    const [selectedMember, setSelectedMember] = useState("Todos los miembros");
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
        const fetchWeeklyEvaluations = async (sprintId) => {
            try {
                const response = await getData(`/sprints/${sprintId}/weekly-evaluations`);
                if (response.success) {
                    setEvaluationData(response.data.evaluations[0]);
                    setFilteredTasks(response.data.evaluations[0].tasks);
                }
            } catch (error) {
                console.error("Error al cargar las evaluaciones semanales:", error);
            }
        };

        if (sprintId) {
            fetchWeeklyEvaluations(sprintId);
        }
    }, [sprintId]);

    useEffect(() => {
        if (evaluationData && selectedMember !== "Todos los miembros") {
            setFilteredTasks(
                evaluationData.tasks.filter((task) =>
                    task.assigned_to.some((member) => `${member.name} ${member.last_name}` === selectedMember)
                )
            );
        } else if (evaluationData) {
            setFilteredTasks(evaluationData.tasks);
        }
    }, [selectedMember, evaluationData]);

    const calculateAverageRating = () => {
        if (!filteredTasks.length) return 0;
        const totalRating = filteredTasks.reduce((sum, task) => sum + task.satisfaction_level, 0);
        return totalRating / filteredTasks.length;
    };

    const memberList = evaluationData
        ? ["Todos los miembros", ...new Set(evaluationData.tasks.flatMap((task) =>
            task.assigned_to.map((member) => `${member.name} ${member.last_name}`)
        ))]
        : ["Todos los miembros"];

    const totalTasksCount = evaluationData ? evaluationData.tasks.length : 0;
    const taskData = filteredTasks.reduce((acc, task) => {
        task.assigned_to.forEach((member) => {
            const existingMember = acc.find((m) => m.name === `${member.name} ${member.last_name}`);
            if (existingMember) {
                existingMember.value += 1;
            } else {
                acc.push({ name: `${member.name} ${member.last_name}`, value: 1 });
            }
        });
        return acc;
    }, []);

    const averageRating = calculateAverageRating();

    return (
        <div className="p-4 mx-auto max-w-full space-y-6">
            <h1 className="text-2xl font-bold text-center text-purple-600">Historial Semanal</h1>

            {/* Filtro por miembro */}
            <div className="mb-6">
                <h2 className="text-purple-600 mb-2">Filtrar por Miembro</h2>
                <select
                    className="p-2 border border-gray-300 rounded-md w-full"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                >
                    {memberList.map((member) => (
                        <option key={member} value={member}>
                            {member}
                        </option>
                    ))}
                </select>
                <h2 className="text-purple-600 mt-4">Calificación Promedio</h2>
                <div className="flex space-x-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            fill={i < Math.round(averageRating) ? "gold" : "none"}
                            stroke="gold"
                        />
                    ))}
                </div>
            </div>

            {/* Gráfico de participación */}
            <div className="flex flex-col items-center">
                <h2 className="text-purple-600 mb-2">Estado de Participación</h2>
                <div className="w-full max-w-sm">
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
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tareas completadas */}
            {filteredTasks.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h2 className="text-purple-600">Tareas Completadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
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
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
