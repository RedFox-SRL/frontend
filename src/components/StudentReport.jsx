import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

const data = [
  { name: "Por hacer", value: 48.8 },
  { name: "En progreso", value: 24.3 },
  { name: "Hecho", value: 26.9 },
];

export default function StudentReport() {
  return (
    <div className="container mx-auto p-4 sm:p-6 bg-purple-50 min-h-screen">
      {/* Resumen del Estudiante */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Estudiante: Oliver Alandia
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Tasa de participación
                  </h3>
                  <div className="text-4xl sm:text-5xl font-bold text-purple-600">
                    45%
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Número de tareas realizadas: 8
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación
                  </label>
                  <p className="text-md sm:text-lg text-purple-600 font-semibold">
                    Excelente
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Tareas asignadas</h3>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tablero de Autoevaluación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700 text-lg sm:text-xl font-semibold">
            Autoevaluación: Sprint X
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Columna 1: ¿Qué hice bien? */}
            <div className="bg-purple-100 rounded-lg p-4">
              <h3 className="text-purple-700 font-bold text-lg mb-4">
                ¿Qué hice bien?
              </h3>
              <div className="space-y-2 mb-4">
                <Card className="p-2 bg-white">
                  <p className="font-semibold text-gray-700">
                    Puntualidad en las reuniones
                  </p>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="text-xs text-gray-400">Creado por: Diego</p>
                </Card>
                {/* Espacio para agregar más elementos */}
              </div>
              <Input placeholder="Añadir elemento" className="mb-2" />
            </div>

            {/* Columna 2: ¿Qué hice mal? */}
            <div className="bg-purple-100 rounded-lg p-4">
              <h3 className="text-purple-700 font-bold text-lg mb-4">
                ¿Qué hice mal?
              </h3>
              <div className="space-y-2 mb-4">
                <Card className="p-2 bg-white">
                  <p className="font-semibold text-gray-700">
                    Mala distribución del trabajo
                  </p>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="text-xs text-gray-400">Creado por: Diego</p>
                </Card>
                {/* Espacio para agregar más elementos */}
              </div>
              <Input placeholder="Añadir elemento" className="mb-2" />
            </div>

            {/* Columna 3: ¿Qué puedo mejorar? */}
            <div className="bg-purple-100 rounded-lg p-4">
              <h3 className="text-purple-700 font-bold text-lg mb-4">
                ¿Qué puedo mejorar?
              </h3>
              <div className="space-y-2 mb-4">
                <Card className="p-2 bg-white">
                  <p className="font-semibold text-gray-700">
                    Mejorar la distribución del trabajo
                  </p>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="text-xs text-gray-400">Creado por: Diego</p>
                </Card>
                {/* Espacio para agregar más elementos */}
              </div>
              <Input placeholder="Añadir elemento" className="mb-2" />
            </div>
          </div>
        </CardContent>
        <div className="flex justify-center p-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-md px-8 py-2 rounded-md">
            Enviar autoevaluación
          </Button>
        </div>
      </Card>
    </div>
  );
}
