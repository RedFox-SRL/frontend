import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Función para verificar si una gestión es la actual
const isCurrentManagement = (startDate, endDate) => {
  const currentDate = new Date(); // Fecha actual
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Comprobar si la fecha actual está entre la fecha de inicio y la fecha de fin
  return currentDate >= start && currentDate <= end;
};

export default function ManagementList({
  managements,
  onSelectManagement,
  onCreateNew,
}) {
  const [showCurrent, setShowCurrent] = useState(true); // Estado para alternar entre vistas

  // Función para formatear el título de la gestión
  const formatManagementTitle = (semester, startDate) => {
    const year = new Date(startDate).getFullYear(); // Extraer el año de la fecha de inicio
    const managementNumber = semester === "first" ? 1 : 2; // Definir si es Gestión 1 o 2
    return `Gestión ${managementNumber}/${year}`; // Devolver el título formateado
  };

  // Filtrar solo la gestión actual
  const currentManagements = managements.filter((management) =>
    isCurrentManagement(management.start_date, management.end_date),
  );

  // Mostrar todas las gestiones (sin filtro de fechas)
  const allManagements = managements;

  // Función para alternar entre vistas
  const toggleView = () => {
    setShowCurrent(!showCurrent); // Alternar entre la gestión actual y el historial
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Botón para alternar entre vistas */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-purple-700 text-center">
          {showCurrent ? "Gestión Actual" : "Historial de Gestiones"}
        </h1>
        <Button
          onClick={toggleView}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
        >
          {showCurrent ? "Ver Historial" : "Ver Gestión Actual"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showCurrent ? (
          currentManagements.length > 0 ? (
            currentManagements.map((management) => (
              <Card
                key={management.id}
                className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl"
              >
                <CardHeader>
                  {/* Mostrar el título formateado */}
                  <CardTitle className="text-xl font-semibold text-purple-600 capitalize">
                    {formatManagementTitle(
                      management.semester,
                      management.start_date,
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Fecha de Inicio:</strong> {management.start_date}
                  </p>
                  <p className="text-gray-600">
                    <strong>Fecha de Fin:</strong> {management.end_date}
                  </p>
                  <p className="text-gray-600">
                    <strong>Límite de Grupos:</strong> {management.group_limit}
                  </p>
                  <Button
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                    onClick={() => onSelectManagement(management)}
                  >
                    Ver Gestión
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No hay gestiones activas en este momento.
            </p>
          )
        ) : allManagements.length > 0 ? (
          allManagements.map((management) => (
            <Card
              key={management.id}
              className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl"
            >
              <CardHeader>
                {/* Mostrar el título formateado */}
                <CardTitle className="text-xl font-semibold text-purple-600 capitalize">
                  {formatManagementTitle(
                    management.semester,
                    management.start_date,
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-600">
                  <strong>Fecha de Inicio:</strong> {management.start_date}
                </p>
                <p className="text-gray-600">
                  <strong>Fecha de Fin:</strong> {management.end_date}
                </p>
                <p className="text-gray-600">
                  <strong>Límite de Grupos:</strong> {management.group_limit}
                </p>
                <Button
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-300"
                  onClick={() => onSelectManagement(management)}
                >
                  Ver Gestión
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No hay gestiones disponibles.
          </p>
        )}
      </div>

      {/* Botón flotante para crear una nueva gestión */}
      <Button
        onClick={onCreateNew}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-110"
      >
        +
      </Button>
    </div>
  );
}
