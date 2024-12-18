import React, { useState, useEffect } from "react";
import { getData } from "../api/apiService";
import { CheckCircle, XCircle, Calendar, Smile, Frown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"]; // Colores consistentes

export default function SprintEvaluationView({ groupId }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const response = await getData(`/sprints?group_id=${groupId}`);
        setSprints(response || []);
      } catch (error) {
        console.error("Error al obtener los sprints:", error);
      }
    };
    fetchSprints();
  }, [groupId]);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (selectedSprintId) {
        setLoading(true);
        try {
          const response = await getData(`/sprints/${selectedSprintId}/sprint-evaluation`);
          setEvaluation(response.data.evaluation);
        } catch (error) {
          console.error("Error al cargar la evaluación del sprint:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchEvaluation();
  }, [selectedSprintId]);

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
        {/* Selección de Sprint */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-purple-700 mb-2">Reporte de Sprint</h3>
          <select
              className="p-2 border border-gray-300 rounded-md shadow-sm w-full mx-auto"
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            <option value="">Selecciona un sprint</option>
            {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.title}
                </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-center text-gray-500">Cargando...</p>}

        {!loading && !selectedSprintId && (
            <div className="text-center text-gray-500">
              <p>Por favor, selecciona un sprint para ver los detalles.</p>
            </div>
        )}

        {!loading && sprints.length === 0 && (
            <div className="text-center text-gray-500">
              <p>Aún no hay un sprint disponible.</p>
            </div>
        )}

        {!loading && evaluation && (
            <div className="space-y-6">
              {/* Resumen del Sprint */}
              <div className="bg-purple-50 rounded-lg shadow-lg p-6">
                <h4 className="text-xl font-bold text-purple-700 mb-4">Resumen del Sprint</h4>
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

              {/* Estado General y Reporte Semanal */}
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

                <div className="bg-purple-50 rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-bold text-purple-700 mb-4">Reporte Semanal</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                          data={[
                            { name: "Satisfacción mínima", value: evaluation.weekly_evaluations_summary[0].min_satisfaction },
                            { name: "Satisfacción máxima", value: evaluation.weekly_evaluations_summary[0].max_satisfaction },
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
                  {renderPieChartLegend(["Satisfacción mínima", "Máxima"])}
                  <div className="text-center mt-4">
                    <p>
                      <strong>Semana:</strong> {evaluation.weekly_evaluations_summary[0].week_number}
                    </p>
                    <p>
                      <strong>Satisfacción mínima:</strong>{" "}
                      {evaluation.weekly_evaluations_summary[0].min_satisfaction}
                    </p>
                    <p>
                      <strong>Satisfacción máxima:</strong>{" "}
                      {evaluation.weekly_evaluations_summary[0].max_satisfaction}
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

              {/* Calificación Final de Estudiantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.student_grades.map((grade, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-4 space-y-2 border-l-4 border-purple-500"
                    >
                      <p className="text-purple-700 font-bold">
                        Estudiante: {grade.student.user.name} {grade.student.user.last_name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Calificación:</strong> {grade.grade}
                      </p>
                      <p className="text-gray-700">
                        <strong>Comentarios:</strong> {grade.comments}
                      </p>
                    </div>
                ))}
              </div>

              {/* Resumen de Estudiantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.student_summaries.map((student, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-purple-700 font-bold">{student.name} {student.last_name}</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                              data={[
                                { name: "Por hacer", value: student.tasks_summary.todo },
                                { name: "En progreso", value: student.tasks_summary.in_progress },
                                { name: "Hecho", value: student.tasks_summary.completed },
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
                        <p><strong>Total de tareas:</strong> {student.tasks_summary.total}</p>
                        <p><strong>Hecho:</strong> {student.tasks_summary.completed}</p>
                        <p><strong>En progreso:</strong> {student.tasks_summary.in_progress}</p>
                        <p><strong>Por hacer:</strong> {student.tasks_summary.todo}</p>
                        <p>
                          <strong>Nivel de Satisfacción:</strong> Promedio: {student.satisfaction_levels.average || "N/A"}, Mínima: {student.satisfaction_levels.min || "N/A"}, Máxima: {student.satisfaction_levels.max || "N/A"}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );

}
