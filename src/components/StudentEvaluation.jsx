import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

const data = [
  { name: "Por hacer", value: 48.8 },
  { name: "En progreso", value: 24.3 },
  { name: "Hecho", value: 26.9 },
];

export default function StudentEvaluation() {
  return (
    <div className="container mx-auto bg-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <h1 className="text-xl md:text-2xl font-bold centered text-purple-600">
          Evaluación Estudiante
        </h1>
        <div className="w-[70px]"></div>
      </div>

      <Card className="mb-4 md:mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
                Estudiante: Oliver Alandia
              </h2>
              <div className="space-y-2 md:space-y-4">
                <div>
                  <h3 className="text-md md:text-lg font-medium mb-1 md:mb-2">
                    Tasa de participación
                  </h3>
                  <div className="text-4xl md:text-5xl font-bold text-purple-600">
                    45%
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Número de tareas realizadas: 8
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Calificación
                  </label>
                  <select
                    id="rating"
                    className="max-w-full md:max-w-[200px] p-1 md:p-2 border rounded"
                    defaultValue="Excelente"
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Aceptable">Aceptable</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md md:text-lg font-medium mb-2 md:mb-4">
                Estado de tareas
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Recomendación</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-1 md:p-2 border rounded"
            placeholder="Escribe una recomendación"
          />
        </CardContent>
      </Card>

      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-1 md:p-2">
        Guardar evaluación
      </Button>
    </div>
  );
}
