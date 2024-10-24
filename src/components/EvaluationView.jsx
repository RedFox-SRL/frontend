import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EvaluationTemplate from './EvaluationTemplate';
import { Button } from "@/components/ui/button";
import { ClipboardCheck, User, CalendarCheck, CheckSquare } from "lucide-react";
import StudentEvaluation from './StudentEvaluation';
import WeeklyEvaluation from './WeeklyEvaluation';
import SprintEvaluation from './SprintEvaluation';

export default function EvaluationView({ groupId, onBack }) {
    const [activeTab, setActiveTab] = useState('evaluation-template');
    const [sprints, setSprints] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSprints();
    }, [groupId]);

    const fetchSprints = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/sprints?group_id=${groupId}`);
            if (response && response.length > 0) {
                setSprints(response);
            } else {
                console.log('No hay sprints activos en este grupo.');
            }
        } catch (err) {
            console.error("Error al obtener los sprints:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white-100 to-indigo-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
                {/* Contenedor flex para alinear el botón de "Volver" y el título "Evaluaciones" */}
                <div className="flex justify-between items-center mb-6">
                    <Button onClick={onBack}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition-all duration-300 ease-in-out">
                        Volver
                    </Button>

                    <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center">Evaluaciones</h1>
                    <div className="w-[70px]"></div> {/* Espaciado para que el botón y el título queden centrados */}
                </div>

                {/* Tabs para navegación entre tipos de evaluaciones */}
                <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-6 w-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                            <TabsTrigger
                                value="evaluation-template"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-1 sm:ml-2">Planilla</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="student-evaluation"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-1 sm:ml-2">Estudiante</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="weekly-evaluation"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-1 sm:ml-2">Semanal</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="sprint-evaluation"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                            >
                                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline ml-1 sm:ml-2">Sprint</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Contenido de cada tab */}
                <div className="flex-grow">
                    {activeTab === 'evaluation-template' && (
                        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-full">
                            <EvaluationTemplate groupId={groupId} sprints={sprints} />
                        </div>
                    )}
                    {activeTab === 'student-evaluation' && (
                        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-full">
                            <StudentEvaluation />
                        </div>
                    )}
                    {activeTab === 'weekly-evaluation' && (
                        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-full">
                            <WeeklyEvaluation />
                        </div>
                    )}
                    {activeTab === 'sprint-evaluation' && (
                        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-full">
                            <SprintEvaluation />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
