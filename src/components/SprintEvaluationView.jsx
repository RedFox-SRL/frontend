import { useState, useEffect } from "react";
import { getData } from "../api/apiService"; // Asegúrate de que esta función esté configurada correctamente

export default function SprintEvaluationView({ groupId }) {
  const [sprints, setSprints] = useState([]);  // Estado para los sprints
  const [selectedSprintId, setSelectedSprintId] = useState("");  // Estado para el sprint seleccionado
  const [evaluation, setEvaluation] = useState(null);  // Estado para la evaluación del sprint
  const [isLoading, setIsLoading] = useState(false);  // Estado de carga

  // Cargar los sprints disponibles para el grupo
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const response = await getData(`/sprints?group_id=${groupId}`);
        setSprints(response || []);  // Guardamos los sprints
      } catch (err) {
        console.error("Error al obtener los sprints:", err);
      }
    };
    fetchSprints();
  }, [groupId]);

  // Cargar la evaluación del sprint seleccionado
  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!selectedSprintId) return;  // Si no se ha seleccionado un sprint, no hacemos nada

      setIsLoading(true);  // Empezamos a cargar
      try {
        const response = await getData(`/sprints/${selectedSprintId}/sprint-evaluation`);

        if (response && response.data && response.data.success) {
          setEvaluation(response.data.data.evaluation);  // Guardamos los datos completos de la evaluación
        } else {
          console.error("Error al cargar la evaluación del sprint:", response.data.message);
        }
      } catch (error) {
        console.error("Error al obtener la evaluación del sprint:", error);
      } finally {
        setIsLoading(false);  // Detenemos el estado de carga
      }
    };

    fetchEvaluation();
  }, [selectedSprintId]);  // Solo depende de selectedSprintId

  // Si está cargando la evaluación, mostramos un mensaje
  if (isLoading) return <p className="text-center">Cargando evaluación...</p>;

  return (
      <div className="max-w-full mx-auto space-y-4 p-4">
        <h1 className="text-2xl font-bold text-center text-purple-600">Seleccionar Sprint</h1>

        {/* Selección de Sprint */}
        <div>
          <h2 className="text-purple-600">Seleccionar Sprint</h2>
          <select
              className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
              value={selectedSprintId}  // El valor del select está ligado a selectedSprintId
              onChange={(e) => setSelectedSprintId(e.target.value)}  // Actualiza selectedSprintId
          >
            <option value="">Seleccionar Sprint</option>
            {sprints.length === 0 ? (
                <option disabled>Cargando sprints...</option>
            ) : (
                sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.title}
                    </option>
                ))
            )}
          </select>
        </div>

        {/* Mostrar la evaluación del sprint seleccionado */}
        {evaluation && (
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h2 className="text-purple-700 font-semibold">Evaluación del Sprint Seleccionado</h2>

              <p><strong>ID de la Evaluación:</strong> {evaluation.id}</p>
              <p><strong>ID del Sprint:</strong> {evaluation.sprint_id}</p>
              <p><strong>Resumen:</strong> {evaluation.summary}</p>
              <p><strong>Características planeadas:</strong> {evaluation.planned_features}</p>

              <h3 className="text-purple-700 font-semibold mt-4">Progreso General</h3>
              <p><strong>Tareas Totales:</strong> {evaluation.overall_progress.total_tasks}</p>
              <p><strong>Tareas Completadas:</strong> {evaluation.overall_progress.completed_tasks}</p>
              <p><strong>Tareas en Progreso:</strong> {evaluation.overall_progress.in_progress_tasks}</p>
              <p><strong>Tareas Por Hacer:</strong> {evaluation.overall_progress.todo_tasks}</p>
              <p><strong>Porcentaje Completado:</strong> {evaluation.overall_progress.completion_percentage}%</p>

              <h3 className="text-purple-700 font-semibold mt-4">Resumen de Evaluación de Estudiantes</h3>
              {evaluation.student_summaries.map((student) => (
                  <div key={student.id} className="mt-2">
                    <h4 className="font-semibold">{student.name} {student.last_name}</h4>
                    <p><strong>Tareas Completadas:</strong> {student.tasks_summary.completed} de {student.tasks_summary.total}</p>
                    <p><strong>Satisfacción Promedio:</strong> {student.satisfaction_levels.average} / 5</p>

                    <h5 className="mt-2 font-semibold">Detalles de Tareas:</h5>
                    {Object.values(student.task_details).map((task) => (
                        <div key={task.id} className="mt-1">
                          <p><strong>{task.title}</strong> - Estado: {task.status} - Satisfacción: {task.satisfaction_level || "N/A"}</p>
                          {task.comments && <p>Comentarios: {task.comments}</p>}
                          {task.links && task.links.length > 0 && (
                              <ul>
                                {task.links.map((link, index) => (
                                    <li key={index}>
                                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        {link.description}
                                      </a>
                                    </li>
                                ))}
                              </ul>
                          )}
                        </div>
                    ))}
                  </div>
              ))}

              <h3 className="text-purple-700 font-semibold mt-4">Fortalezas y Debilidades</h3>
              <h4 className="font-semibold">Fortalezas:</h4>
              <ul>
                {evaluation.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                ))}
              </ul>
              <h4 className="font-semibold">Debilidades:</h4>
              <ul>
                {evaluation.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                ))}
              </ul>

              <h3 className="text-purple-700 font-semibold mt-4">Calificaciones de los Estudiantes</h3>
              {evaluation.student_grades.map((grade) => (
                  <div key={grade.id} className="mt-2">
                    <h4>{grade.student.user.name} {grade.student.user.last_name}</h4>
                    <p><strong>Calificación Final:</strong> {grade.grade}</p>
                    <p><strong>Comentarios:</strong> {grade.comments}</p>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
