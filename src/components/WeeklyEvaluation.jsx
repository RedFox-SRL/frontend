import React, { useEffect, useState } from "react";
import { getData, postData } from "../api/apiService";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";
import WeeklyHistory from "./WeeklyHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle, Loader2 } from 'lucide-react';

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [evaluationHistory, setEvaluationHistory] = useState([]);
    const [taskEvaluations, setTaskEvaluations] = useState({});
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sprintEnded, setSprintEnded] = useState(false); // Added new state variable
    const { toast } = useToast();

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await getData(`/sprints?group_id=${groupId}`);
                if (response && Array.isArray(response)) {
                    setSprints(response);
                } else if (response && response.success && Array.isArray(response.data)) {
                    setSprints(response.data);
                } else {
                    toast({
                        title: "Error",
                        description: "No se pudieron cargar los sprints. Formato de respuesta inválido.",
                        variant: "destructive",
                    });
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los sprints. Por favor, intente de nuevo.",
                    variant: "destructive",
                });
            }
        };
        fetchSprints();
    }, [groupId, toast]);

    useEffect(() => {
        const fetchEvaluationData = async () => {
            if (selectedSprintId) {
                // Restablecer estados antes de cargar nuevos datos
                setTemplate(null);
                setEvaluationHistory([]);
                setTaskEvaluations({});
                setIsEvaluated(false);
                setShowReport(false);
                setSprintEnded(false);

                try {
                    const templateResponse = await getData(`/sprints/${selectedSprintId}/weekly-evaluation-template`);
                    const historyResponse = await getData(`/sprints/${selectedSprintId}/weekly-evaluations`);

                    if (templateResponse.success && historyResponse.success) {
                        const fetchedTemplate = templateResponse.data.template;
                        const fetchedHistory = historyResponse.data.evaluations;

                        setTemplate(fetchedTemplate);
                        setEvaluationHistory(fetchedHistory);

                        const currentWeekEvaluation = fetchedHistory.find(evaluation => evaluation.week_number === fetchedTemplate.week_number);

                        setIsEvaluated(!!currentWeekEvaluation);
                        setShowReport(!!currentWeekEvaluation);

                        if (currentWeekEvaluation) {
                            const existingEvaluations = {};
                            currentWeekEvaluation.tasks.forEach(task => {
                                existingEvaluations[task.id] = {
                                    satisfaction_level: task.satisfaction_level, comments: task.comments
                                };
                            });
                            setTaskEvaluations(existingEvaluations);
                        } else {
                            setTaskEvaluations({});
                        }
                    }
                } catch (error) {
                    if (error.response && error.response.status === 400 && error.response.data.code === 296) {
                        setSprintEnded(true);
                    } else {
                        toast({
                            title: "Error",
                            description: "No se pudieron cargar los datos de evaluación.",
                            variant: "destructive",
                        });
                    }
                }
            }
        };
        fetchEvaluationData();
    }, [selectedSprintId, toast]);

    const handleSatisfactionChange = (taskId, value) => {
        setTaskEvaluations(prev => ({
            ...prev, [taskId]: { ...prev[taskId], satisfaction_level: value }
        }));
    };

    const handleCommentChange = (taskId, value) => {
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/;
        if (regex.test(value) && value.length <= 400) {
            setTaskEvaluations(prev => ({
                ...prev, [taskId]: { ...prev[taskId], comments: value }
            }));
        }
    };

    const handleSaveEvaluation = async () => {
        setIsLoading(true);
        const totalTasks = template.tasks.length;
        const completedEvaluations = Object.values(taskEvaluations).filter((evaluation) => evaluation.satisfaction_level && evaluation.comments).length;

        if (completedEvaluations !== totalTasks) {
            toast({
                title: "Error",
                description: `Debe completar la evaluación de todas las tareas (${completedEvaluations}/${totalTasks}).`,
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        const tasksData = Object.entries(taskEvaluations).map(([taskId, { comments, satisfaction_level }]) => ({
            id: Number(taskId), comments, satisfaction_level,
        }));

        const postDataPayload = {
            tasks: tasksData,
        };

        try {
            const response = await postData(`/sprints/${selectedSprintId}/weekly-evaluation`, postDataPayload);
            if (response.success === false && response.code === 296) {
                setSprintEnded(true);
            } else {
                toast({
                    title: "Éxito",
                    description: "Evaluación guardada con éxito.",
                    variant: "default",
                    className: "bg-green-500 text-white",
                    duration: "1000",
                });
                const historyResponse = await getData(`/sprints/${selectedSprintId}/weekly-evaluations`);
                if (historyResponse.success) {
                    setEvaluationHistory(historyResponse.data.evaluations);
                    setIsEvaluated(true);
                    setShowReport(true);
                }
            }
        } catch (error) {
            if (error.code === 296) {
                setSprintEnded(true);
            } else {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al guardar la evaluación, revise de nuevo el formulario o en el botón de ayuda.",
                    variant: "destructive",
                    duration: "1000",
                });
            }
        } finally {
            setIsLoading(false);
            setIsConfirmDialogOpen(false);
        }
    };

    const allFieldsFilled = () => {
        return template.tasks.every(task => {
            const evaluation = taskEvaluations[task.id];
            return evaluation && evaluation.satisfaction_level && evaluation.comments;
        });
    };

    const groupedMembers = template ? template.tasks.reduce((acc, task) => {
        task.assigned_to.forEach((member) => {
            const existingMember = acc.find((m) => m.id === member.id);
            if (existingMember) {
                existingMember.taskCount += 1;
            } else {
                acc.push({
                    ...member, taskCount: 1,
                });
            }
        });
        return acc;
    }, []) : [];

    const totalTasks = groupedMembers.reduce((acc, member) => acc + member.taskCount, 0);

    const taskData = groupedMembers.map((member) => ({
        name: `${member.name} ${member.last_name}`, value: member.taskCount,
    }));

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-purple-600 text-center flex-grow">Evaluación Semanal</h3>
                <Button variant="outline" onClick={() => setIsHelpDialogOpen(true)}
                        className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white">
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-purple-600">Seleccionar Sprint</CardTitle>
                </CardHeader>
                <CardContent>
                    {sprints.length === 0 ? (
                        <Card className="bg-yellow-100 border-yellow-300 shadow-md">
                            <CardContent className="flex items-center justify-center p-6">
                                <svg
                                    className="w-8 h-8 text-yellow-600 mr-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <div>
                                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">No hay sprints disponibles</h4>
                                    <p className="text-yellow-700">
                                        El grupo a evaluar no cuenta con sprints creados.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Select
                            value={selectedSprintId || ""}
                            onValueChange={(value) => setSelectedSprintId(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar Sprint" />
                            </SelectTrigger>
                            <SelectContent>
                                {sprints.map((sprint) => (
                                    <SelectItem key={sprint.id} value={sprint.id.toString()}>{sprint.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {sprintEnded && (
                <Card className="bg-purple-100 border-purple-300 shadow-md">
                    <CardContent className="flex items-center justify-center p-6">
                        <svg
                            className="w-8 h-8 text-purple-600 mr-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <h4 className="text-lg font-semibold text-purple-800 mb-2">Evaluación no disponible</h4>
                            <p className="text-purple-700">
                                No se pueden crear evaluaciones semanales después de la fecha de finalización del sprint.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {template && (
                <>
                    {isEvaluated ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <svg
                                    className="w-16 h-16 text-green-500 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-green-700 mb-2">
                                    ¡Evaluación completada!
                                </h3>
                                <p className="text-green-600 text-center mb-4">
                                    Esta semana ya ha sido evaluada. No es necesario realizar otra evaluación.
                                </p>
                                <Button
                                    variant={showReport ? "outline" : "default"}
                                    onClick={() => setShowReport(!showReport)}
                                >
                                    {showReport ? "Ocultar Historial" : "Ver Historial"}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-purple-600">Reporte semanal - Semana {template.week_number}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2 text-purple-700">Requerimientos</h3>
                                            <ul className="list-disc list-inside space-y-2 text-purple-700">
                                                {template.features.split("\n").map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2 text-purple-700">Estado de Participación</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={taskData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, value }) => `${name}: ${value}`}
                                                    >
                                                        {taskData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-2 mt-4 text-purple-700">
                                                {taskData.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                            ></div>
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <span>{item.value} tareas</span>
                                                            <span>({((item.value / totalTasks) * 100).toFixed(1)}%)</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-purple-600">Tareas Completadas</h3>
                                {template.tasks.map(task => (
                                    <Card key={task.id}>
                                        <CardContent className="p-6">
                                            <h3 className="font-bold text-purple-600 mb-2">{task.title}</h3>
                                            <p className="text-gray-600 mb-2">{task.description}</p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Encargado(s): {task.assigned_to.map(member => `${member.name} ${member.last_name}`).join(", ")}
                                            </p>
                                            {task.links.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-purple-500 font-semibold mb-2">Links:</h4>
                                                    <ul className="list-disc list-inside">
                                                        {task.links.map(link => (
                                                            <li key={link.id}>
                                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                                    {link.description}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-purple-700">Satisfacción:</label>
                                                <Select
                                                    value={taskEvaluations[task.id]?.satisfaction_level?.toString() || ""}
                                                    onValueChange={(value) => handleSatisfactionChange(task.id, Number(value))}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccionar nivel de satisfacción" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="5">Excelente</SelectItem>
                                                        <SelectItem value="4">Bueno</SelectItem>
                                                        <SelectItem value="3">Aceptable</SelectItem>
                                                        <SelectItem value="2">Regular</SelectItem>
                                                        <SelectItem value="1">Malo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <label className="block text-sm font-medium text-purple-700">Comentarios:</label>
                                                <textarea
                                                    value={taskEvaluations[task.id]?.comments || ""}
                                                    onChange={(e) => handleCommentChange(task.id, e.target.value)}
                                                    className="w-full p-2 border rounded-md"
                                                    rows={3}
                                                    maxLength={400}
                                                />
                                                <div className="text-right text-xs text-gray-600">{taskEvaluations[task.id]?.comments?.length || 0}/400
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Button onClick={() => setIsConfirmDialogOpen(true)}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    disabled={!allFieldsFilled()}>
                                {isLoading ? (<Loader2 className="h-5 w-5 animate-spin"/>) : "Guardar evaluación"}
                            </Button>
                        </>
                    )}
                </>
            )}

            {showReport && evaluationHistory && (<WeeklyHistory evaluations={evaluationHistory}/>)}

            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Instrucciones</DialogTitle>
                    </DialogHeader>
                    <p>Para usar este componente:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Todos los campos son obligatorios.</li>
                        <li>No se pueden colocar caracteres especiales a excepción de "," "." y los acentos, ñ, y diéresis.</li>
                        <li>Este componente es un resumen de las tareas que hicieron los estudiantes en la semana del sprint.</li>
                        <li>Si la plantilla de evaluación esta vacia es debido a que no se anoto ninguna tarea</li>
                        <li>Recuerda: Solo puedes evaluar los avances semanales con dos dias antes de que termine el sprint. Una vez finalizado el sprint, no se podrán realizar más evaluaciones.</li>
                    </ul>
                    <DialogFooter>
                        <Button onClick={() => setIsHelpDialogOpen(false)}
                                className="bg-purple-600 hover:bg-purple-700 text-white">
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Acción</DialogTitle>
                    </DialogHeader>
                    <p>¿Está seguro de que desea guardar esta evaluación? No se puede revertir después.</p>
                    <DialogFooter>
                        <Button onClick={() => setIsConfirmDialogOpen(false)}
                                className="bg-red-600 hover:bg-red-700 text-white" variant="outline">
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEvaluation} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}