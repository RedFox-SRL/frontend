import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users } from "lucide-react"

export default function CourseInfo({ managementDetails }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-purple-700">Información del Curso</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium">Fecha de Inicio</p>
            <p className="text-sm text-gray-500">{managementDetails.start_date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium">Fecha de Fin</p>
            <p className="text-sm text-gray-500">{managementDetails.end_date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium">Límite por Grupo</p>
            <p className="text-sm text-gray-500">{managementDetails.group_limit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}