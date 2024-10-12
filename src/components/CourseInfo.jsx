import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CourseInfo({ managementDetails }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-purple-700">Información del Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="font-semibold">Fecha de Inicio</p>
            <p>{managementDetails.start_date}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha de Fin</p>
            <p>{managementDetails.end_date}</p>
          </div>
          <div>
            <p className="font-semibold">Límite por Grupo</p>
            <p>{managementDetails.group_limit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}