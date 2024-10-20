import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, User, CalendarCheck, CheckSquare } from "lucide-react";
import ReportSummary from './ReportSummary';
import StudentReport from './StudentReport';
import WeeklyReport from './WeeklyReport';
import SprintReport from './SprintReport';
export default function ReportView({ groupId, onBack }) {
    const [activeTab, setActiveTab] = useState('report-general');

    useEffect(() => {
    }, [groupId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white-100 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold text-purple-800 mb-8 text-center">Reportes de Evaluaciones</h1>

                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 md:grid-cols-4 gap-2 w-full bg-purple-100 p-1 rounded-md">
                            <TabsTrigger
                                value="report-general"
                                className="flex items-center justify-center p-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-purple-700 transition-all duration-200 ease-in-out"
                            >
                                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                <span className="hidden sm:inline">Reporte General</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="student-report"
                                className="flex items-center justify-center p-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-purple-700 transition-all duration-200 ease-in-out"
                            >
                                <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                <span className="hidden sm:inline">Estudiante</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="weekly-report"
                                className="flex items-center justify-center p-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-purple-700 transition-all duration-200 ease-in-out"
                            >
                                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                <span className="hidden sm:inline">Semanal</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="sprint-report"
                                className="flex items-center justify-center p-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-purple-700 transition-all duration-200 ease-in-out"
                            >
                                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                <span className="hidden sm:inline">Sprint</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="tab-content-container w-full">
                    {activeTab === 'report-general' && (
                        <div className="bg-white shadow-lg rounded-lg p-6 w-full">
                            <ReportSummary groupId={groupId} />
                        </div>
                    )}
                    {activeTab === 'student-report' && (
                        <div className="bg-white shadow-lg rounded-lg p-6 w-full">
                            <StudentReport groupId={groupId} />
                        </div>
                    )}
                    {activeTab === 'weekly-report' && (
                        <div className="bg-white shadow-lg rounded-lg p-6 w-full">
                            <WeeklyReport groupId={groupId} />
                        </div>
                    )}
                    {activeTab === 'sprint-report' && (
                        <div className="bg-white shadow-lg rounded-lg p-6 w-full">
                            <SprintReport groupId={groupId} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
