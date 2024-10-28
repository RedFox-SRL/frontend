import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, CheckSquare, ClipboardCheck, User } from "lucide-react";
import ReportSummary from "./ReportSummary";
import StudentReport from "./StudentReport";
import WeeklyReport from "./WeeklyReport";
import SprintReport from "./SprintReport";

export default function ReportView({ groupId }) {
  const [activeTab, setActiveTab] = useState("report-general");

  useEffect(() => {}, [groupId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-100 to-indigo-100 p-2 sm:p-4">
      {" "}
      {/* Padding mínimo */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-4 text-center">
          Reportes de Evaluaciones
        </h1>

        {/* Tabs para navegación entre tipos de reportes */}
        <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 mb-4 w-full">
          {" "}
          {/* Padding mínimo */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-purple-100 rounded-md">
              <TabsTrigger
                value="report-general"
                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm transition-all duration-200 ease-in-out text-xs sm:text-sm"
              >
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-1 sm:ml-2">
                  Reporte General
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="student-report"
                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm transition-all duration-200 ease-in-out text-xs sm:text-sm"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-1 sm:ml-2">
                  Estudiante
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="weekly-report"
                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm transition-all duration-200 ease-in-out text-xs sm:text-sm"
              >
                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-1 sm:ml-2">Semanal</span>
              </TabsTrigger>

              <TabsTrigger
                value="sprint-report"
                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm transition-all duration-200 ease-in-out text-xs sm:text-sm"
              >
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-1 sm:ml-2">Sprint</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contenido de los tabs */}
        <div className="w-full">
          {activeTab === "report-general" && (
            <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full">
              <ReportSummary groupId={groupId} />
            </div>
          )}
          {activeTab === "student-report" && (
            <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full">
              <StudentReport groupId={groupId} />
            </div>
          )}
          {activeTab === "weekly-report" && (
            <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full">
              <WeeklyReport groupId={groupId} />
            </div>
          )}
          {activeTab === "sprint-report" && (
            <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full">
              <SprintReport groupId={groupId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
