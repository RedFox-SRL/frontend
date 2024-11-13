import React, { useState, useEffect } from "react";
import { getData } from "../api/apiService";
import { CheckCircle, XCircle, Calendar, List, Smile, Frown, Star } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function SprintEvaluationView({ groupId }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [evaluation, setEvaluation] = useState(null);

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
        try {
          const response = await getData(`/sprints/${selectedSprintId}/sprint-evaluation`);
          setEvaluation(response.data.evaluation);
        } catch (error) {
          console.error("Error al cargar la evaluación del sprint:", error);
        }
      }
    };
    fetchEvaluation();
  }, [selectedSprintId]);

  return (
      <div className="mx-auto p-4 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-600 mb-2">Seleccionar Sprint</h1>
          <select
              className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            <option value="">Selecciona un sprint para ver la evaluación...</option>
            {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.title}
                </option>
            ))}
          </select>
        </div>
        {evaluation ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 shadow-md space-y-3">
                <h2 className="text-xl font-bold text-purple-700">Resumen del Sprint</h2>
                <p><strong>Resumen:</strong> {evaluation.summary}</p>
                <p><strong>Fecha de Creación:</strong> {new Date(evaluation.created_at).toLocaleDateString()}</p>
                <p><strong>Última Actualización:</strong> {new Date(evaluation.updated_at).toLocaleDateString()}</p>
                <p><strong>Características planeadas:</strong></p>
                <ul className="list-disc pl-5">
                  {evaluation.planned_features.split("\n").map((feature, index) => (
                      <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 shadow-md space-y-3">
                <h2 className="text-xl font-bold text-purple-700">Estado de Tareas y Progreso Total</h2>
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
                        fill="#8884d8"
                        dataKey="value"
                        label
                    >
                      {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center mt-4">
                  <span className="font-semibold">Porcentaje Completado:</span>
                  <div className="w-full bg-gray-300 rounded-full h-4 mx-3">
                    <div
                        className="bg-purple-500 h-4 rounded-full"
                        style={{ width: `${evaluation.overall_progress.completion_percentage}%` }}
                    ></div>
                  </div>
                  <span>{evaluation.overall_progress.completion_percentage}%</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 shadow-md">
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
                <div className="bg-gray-100 rounded-lg p-4 shadow-md">
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
              {evaluation.weekly_evaluations_summary && (
                  <div className="bg-gray-100 rounded-lg p-4 shadow-md">
                    <h2 className="text-xl font-bold text-purple-700">Reporte Semanal</h2>
                    {evaluation.weekly_evaluations_summary.map((week, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar color="#8b5cf6" />
                            <p><strong>Semana {week.week_number}:</strong> {new Date(week.evaluation_date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <List color="#8b5cf6" />
                            <p><strong>Tareas evaluadas:</strong> {week.tasks_evaluated}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smile color="#8b5cf6" />
                            <p><strong>Satisfacción promedio:</strong> {week.average_satisfaction}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Frown color="#8b5cf6" />
                            <p><strong>Satisfacción mínima:</strong> {week.min_satisfaction}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smile color="#8b5cf6" />
                            <p><strong>Satisfacción máxima:</strong> {week.max_satisfaction}</p>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
              <div className="bg-gray-100 rounded-lg p-4 shadow-md">
                <h2 className="text-purple-700 font-bold">Calificación Final del Estudiante</h2>
                {evaluation.student_grades.map((grade, index) => (
                    <div key={index} className="space-y-1">
                      <p><strong>Estudiante:</strong> {grade.student.user.name} {grade.student.user.last_name}</p>
                      <p><strong>Calificación:</strong> {grade.grade}</p>
                      <p><strong>Comentarios:</strong> {grade.comments}</p>
                    </div>
                ))}
              </div>
              <div className="bg-gray-100 rounded-lg p-4 shadow-md">
                <h2 className="text-purple-700 font-bold">Resumen de Estudiantes</h2>
                {evaluation.student_summaries.map((student, index) => (
                    <div key={index} className="border-b pb-2 mb-2">
                      <p><strong>Estudiante:</strong> {student.name} {student.last_name}</p>
                      <p><strong>Tareas:</strong> Total: {student.tasks_summary.total}, Completadas: {student.tasks_summary.completed}, En progreso: {student.tasks_summary.in_progress}, Por hacer: {student.tasks_summary.todo}</p>
                      <p><strong>Nivel de Satisfacción:</strong> Promedio: {student.satisfaction_levels.average}, Mínima: {student.satisfaction_levels.min}, Máxima: {student.satisfaction_levels.max}</p>
                    </div>
                ))}
              </div>
            </div>
        ) : (
            <p className="text-center text-purple-600 mt-4">Selecciona un sprint para ver la evaluación...</p>
        )}
      </div>
  );
}
