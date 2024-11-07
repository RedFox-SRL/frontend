import { useState, useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getData } from "../api/apiService";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyEvaluation({ groupId }) {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calificacion, setCalificacion] = useState("Bueno");

  // Fetch sprints on component mount
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

  // Fetch evaluation template for selected sprint
  useEffect(() => {
    if (selectedSprintId) {
      const fetchEvaluationTemplate = async (sprintId) => {
        setIsLoading(true);
        try {
          const response = await getData(`/sprints/${sprintId}/weekly-evaluation-template`);
          if (response.success) {
            setTemplate(response.data.template);
          } else {
            console.error("Error al cargar la plantilla de evaluación semanal");
          }
        } catch (error) {
          console.error("Error al cargar la plantilla de evaluación semanal:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEvaluationTemplate(selectedSprintId);
    }
  }, [selectedSprintId]);

  return (
      <div className="container mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-purple-600">
          Evaluación Semanal
        </h1>

        {/* Selección de Sprint */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Seleccionar Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
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
          </CardContent>
        </Card>

        {isLoading && (
            <p className="text-center text-purple-600">Cargando...</p>
        )}

        {!isLoading && selectedSprintId && template && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4">
              {/* Lista de tareas */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.tasks.map((task) => (
                      <div key={task.id} className="mb-4">
                        <h3 className="font-semibold text-base md:text-lg">{task.title}</h3>
                        <p className="text-sm md:text-base text-gray-600">{task.description}</p>
                        <p className="text-sm text-purple-600 mt-2">Asignado a:</p>
                        <ul className="list-disc ml-4">
                          {task.assigned_to.map((member) => (
                              <li key={member.id} className="text-gray-600">
                                {member.name} {member.last_name} - {member.email}
                              </li>
                          ))}
                        </ul>
                        {task.links.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold">Recursos:</p>
                              {task.links.map((link) => (
                                  <a
                                      key={link.id}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline text-sm"
                                  >
                                    {link.description || "Ver enlace"}
                                  </a>
                              ))}
                            </div>
                        )}
                      </div>
                  ))}
                </CardContent>
              </Card>

              {/* Calificación y gráfica de progreso */}
              <div className="lg:col-span-3 space-y-2 md:space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                      {template.sprint_title}: Evaluación semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="calificacion" className="block mb-1 font-semibold">
                        Calificación:
                      </label>
                      <select
                          id="calificacion"
                          className="w-full p-0 md:p-2 border rounded"
                          value={calificacion}
                          onChange={(e) => setCalificacion(e.target.value)}
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Aceptable">Aceptable</option>
                        <option value="Regular">Regular</option>
                        <option value="Malo">Malo</option>
                      </select>
                    </div>

                    {/* Rueda de progreso */}
                    <div className="flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                              data={template.tasks.map((task) => ({
                                name: task.title,
                                value: 100 / template.tasks.length,
                              }))}
                              innerRadius={50}
                              outerRadius={70}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                          >
                            {template.tasks.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center mt-2">
                        <p className="text-base md:text-xl font-bold text-purple-600">
                          {100 / template.tasks.length}% Por hacer
                        </p>
                        <p className="text-sm md:text-md font-bold text-purple-500">
                          {100 / template.tasks.length}% En progreso
                        </p>
                        <p className="text-sm md:text-md font-bold text-purple-400">
                          {100 / template.tasks.length}% Hecho
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Recomendación</CardTitle>
                  </CardHeader>
                  <CardContent>
                <textarea
                    className="w-full p-0 md:p-2 border rounded"
                    placeholder="Escribe una recomendación"
                ></textarea>
                  </CardContent>
                </Card>

                {/* Botón de Guardar */}
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-0 md:p-2">
                  Guardar evaluación
                </Button>
              </div>
            </div>
        )}
      </div>
  );
}
