import { useState, useEffect } from "react";
import { getData } from "../api/apiService";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Star } from "lucide-react"; // Asegúrate de tener este ícono instalado o usa otro de tu preferencia

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyReport({ groupId }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [selectedMember, setSelectedMember] = useState("Todos los miembros");
  const [filteredTasks, setFilteredTasks] = useState([]);

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
      fetchWeeklyEvaluations(selectedSprintId);
    }
  }, [selectedSprintId]);

  useEffect(() => {
    if (evaluationData && selectedMember !== "Todos los miembros") {
      setFilteredTasks(
          evaluationData.tasks.filter(task =>
              task.assigned_to.some(member => `${member.name} ${member.last_name}` === selectedMember)
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
      ? ["Todos los miembros", ...new Set(evaluationData.tasks.flatMap(task =>
          task.assigned_to.map(member => `${member.name} ${member.last_name}`)
      ))]
      : ["Todos los miembros"];

  const totalTasksCount = evaluationData ? evaluationData.tasks.length : 0;
  const taskData = filteredTasks.reduce((acc, task) => {
    task.assigned_to.forEach(member => {
      const existingMember = acc.find(m => m.name === `${member.name} ${member.last_name}`);
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
        <h1 className="text-2xl font-bold text-center text-purple-600">Reporte Semanal</h1>

        {/* Selección de Sprint */}
        <div className="mb-6">
          <h2 className="text-purple-600 mb-2">Seleccionar Sprint</h2>
          <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={selectedSprintId || ""}
              onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            <option value="">Seleccionar Sprint</option>
            {sprints.length > 0 ? (
                sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.title}
                    </option>
                ))
            ) : (
                <option disabled>No hay sprints disponibles</option>
            )}
          </select>
        </div>

        {/* Mostrar contenido solo si se selecciona un sprint */}
        {selectedSprintId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por miembro */}
              <div>
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
              <div>
                <h2 className="text-purple-600 mb-2">Estado de Participación</h2>
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
                <div className="space-y-2 mt-4">
                  {taskData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                        <div className="flex gap-4">
                          <span>{item.value} tareas</span>
                          <span>({((item.value / totalTasksCount) * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        ) : (
            <div className="text-center text-gray-500">
              {sprints.length === 0 ? "Aún no hay un sprint disponible" : "Por favor, selecciona un sprint"}
            </div>
        )}

        {/* Tareas completadas */}
        {selectedSprintId && filteredTasks.length > 0 && (
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
                      {task.links.length > 0 && (
                          <div className="mt-2">
                            <a
                                href={task.links[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                              {task.links[0].description}
                            </a>
                          </div>
                      )}
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
