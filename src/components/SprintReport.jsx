import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

const data = [
  { name: "Por hacer", value: 48.8 },
  { name: "En progreso", value: 24.3 },
  { name: "Hecho", value: 26.9 },
];

export default function SprintReport() {
  return (
    <div className="container mx-auto p-4 sm:p-6 bg-purple-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-purple-600">
        Reporte de Sprint
      </h1>

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Sprint 1: (2024-09-06 - 2024-09-13)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md sm:text-lg font-medium mb-2">
                    Tasa de participación
                  </h3>
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold">Oliver Alandia - 80%</span>
                    <span className="font-semibold">Diego Sandoval - 75%</span>
                    <span className="font-semibold">Diego Romero - 60%</span>
                    <span className="font-semibold">Gilmar Orellana - 40%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación
                  </label>
                  <p className="text-md text-purple-600 font-semibold">Bueno</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md sm:text-lg font-medium mb-4">
                Estado de tareas
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
              <div className="text-center mt-2">
                <p className="text-xl font-bold text-purple-600">
                  {data[0].value}% Por hacer
                </p>
                <p className="text-md font-bold text-purple-500">
                  {data[1].value}% En progreso
                </p>
                <p className="text-md font-bold text-purple-400">
                  {data[2].value}% Hecho
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recomendación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-gray-700">
            Mejorar la tasa de finalización de tareas y revisar las tareas
            pendientes antes del siguiente sprint.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
