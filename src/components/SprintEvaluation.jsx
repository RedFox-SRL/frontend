import React, { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

const taskData = [
  { name: "Por hacer", value: 48.8 },
  { name: "En progreso", value: 24.3 },
  { name: "Hecho", value: 26.9 },
];

const teamMembers = [
  { name: "Oliver Alandia", participation: 80 },
  { name: "Diego Sandoval", participation: 75 },
  { name: "Diego Romero", participation: 60 },
  { name: "Gilmar Orellana", participation: 40 },
];

const ParticipationBar = ({ name, participation }) => (
  <div className="flex items-center mb-2">
    <span className="w-28 text-sm">{name}</span>
    <div className="flex-grow bg-purple-100 rounded-full h-2">
      <div
        className="bg-purple-600 h-2 rounded-full"
        style={{ width: `${participation}%` }}
      />
    </div>
  </div>
);

export default function SprintEvaluation() {
  const [selectedSprint, setSelectedSprint] = useState("Sprint 1");
  const [selectedRating, setSelectedRating] = useState("Bueno");
  const [recommendation, setRecommendation] = useState("");

  return (
    <div className="container mx-auto bg-purple-50 min-h-screen">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-purple-600">
        Evaluación de Sprint
      </h1>

      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
        <h2 className="font-bold text-lg mb-2">Seleccionar Sprint</h2>
        <select
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="Sprint 1">Sprint 1</option>
          <option value="Sprint 2">Sprint 2</option>
          <option value="Sprint 3">Sprint 3</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h3 className="font-semibold mb-2 md:mb-4">Sprint 1</h3>
          <h4 className="text-sm font-medium mb-2">Tasa de participación</h4>
          {teamMembers.map((member, index) => (
            <ParticipationBar key={index} {...member} />
          ))}

          <div className="mt-4 md:mt-6">
            <h4 className="text-sm font-medium mb-2">Requerimientos</h4>
            <ul className="list-disc pl-4">
              <li>Registrar los resultados de las evaluaciones</li>
              <li>Recuperar los resultados de las evaluaciones previas</li>
            </ul>
          </div>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={taskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {taskData.map((entry, index) => (
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

      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="Excelente">Excelente</option>
          <option value="Bueno">Bueno</option>
          <option value="Aceptable">Aceptable</option>
          <option value="Regular">Regular</option>
          <option value="Malo">Malo</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
        <textarea
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Recomendación"
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
        />
      </div>

      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md">
        Guardar evaluación
      </button>
    </div>
  );
}
