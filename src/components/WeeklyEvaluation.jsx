import React, {useEffect, useState} from "react";
import {getData, postData} from "../api/apiService";
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {useToast} from "@/hooks/use-toast";
import WeeklyHistory from "./WeeklyHistory";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function WeeklyEvaluation({groupId}) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [evaluationHistory, setEvaluationHistory] = useState([]);
    const [taskEvaluations, setTaskEvaluations] = useState({});
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const {toast} = useToast();

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await getData(`/sprints?group_id=${groupId}`);
                console.log("Sprint response:", response); // Debugging line
                if (response && Array.isArray(response)) {
                    setSprints(response);
                } else if (response && response.success && Array.isArray(response.data)) {
                    setSprints(response.data);
                } else {
                    console.error("Invalid response format:", response);
                    toast({
                        title: "Error",
                        description: "No se pudieron cargar los sprints. Formato de respuesta inválido.",
                        variant: "destructive",
                    });
                }
            } catch (err) {
                console.error("Error al obtener los sprints:", err);
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
        if (selectedSprintId) {
            const fetchEvaluationData = async () => {
                try {
                    const [templateResponse, historyResponse] = await Promise.all([
                        getData(`/sprints/${selectedSprintId}/weekly-evaluation-template`),
                        getData(`/sprints/${selectedSprintId}/weekly-evaluations`)
                    ]);

                    if (templateResponse.success && historyResponse.success) {
                        const fetchedTemplate = templateResponse.data.template;
                        const fetchedHistory = historyResponse.data.evaluations;

                        setTemplate(fetchedTemplate);
                        setEvaluationHistory(fetchedHistory);

                        // Check if the current week has already been evaluated
                        const currentWeekEvaluation = fetchedHistory.find(
                            evaluation => evaluation.week_number === fetchedTemplate.week_number
                        );

                        setIsEvaluated(!!currentWeekEvaluation);
                        setShowReport(!!currentWeekEvaluation);

                        if (currentWeekEvaluation) {
                            // Pre-fill the form with existing evaluation data
                            const existingEvaluations = {};
                            currentWeekEvaluation.tasks.forEach(task => {
                                existingEvaluations[task.id] = {
                                    satisfaction_level: task.satisfaction_level,
                                    comments: task.comments
                                };
                            });
                            setTaskEvaluations(existingEvaluations);
                        } else {
                            // Reset task evaluations if there's no existing evaluation
                            setTaskEvaluations({});
                        }
                    }
                } catch (error) {
                    console.error("Error al cargar datos de evaluación:", error);
                    toast({
                        title: "Error",
                        description: "No se pudieron cargar los datos de evaluación.",
                        variant: "destructive",
                    });
                }
            };
            fetchEvaluationData();
        }
    }, [selectedSprintId, toast]);

    const handleSatisfactionChange = (taskId, value) => {
        setTaskEvaluations(prev => ({
            ...prev,
            [taskId]: {...prev[taskId], satisfaction_level: value}
        }));
    };

    const handleCommentChange = (taskId, value) => {
        if (value.length <= 200) {
            setTaskEvaluations(prev => ({
                ...prev,
                [taskId]: {...prev[taskId], comments: value}
            }));
        }
    };

    const handleSaveEvaluation = async () => {
        const totalTasks = template.tasks.length;
        const completedEvaluations = Object.values(taskEvaluations).filter(
            (evaluation) => evaluation.satisfaction_level && evaluation.comments
        ).length;

        if (completedEvaluations !== totalTasks) {
            toast({
                title: "Error",
                description: `Debe completar la evaluación de todas las tareas (${completedEvaluations}/${totalTasks}).`,
                variant: "destructive",
            });
            return;
        }

        const tasksData = Object.entries(taskEvaluations).map(([taskId, {comments, satisfaction_level}]) => ({
            id: Number(taskId),
            comments,
            satisfaction_level,
        }));

        const postDataPayload = {
            tasks: tasksData,
        };

        try {
            await postData(`/sprints/${selectedSprintId}/weekly-evaluation`, postDataPayload);
            toast({
                title: "Éxito",
                description: "Evaluación guardada con éxito.",
                variant: "default",
                className: "bg-green-500 text-white",
            });
            // Refresh evaluation data after saving
            const historyResponse = await getData(`/sprints/${selectedSprintId}/weekly-evaluations`);
            if (historyResponse.success) {
                setEvaluationHistory(historyResponse.data.evaluations);
                setIsEvaluated(true);
                setShowReport(true);
            }
        } catch (error) {
            console.error("Error al guardar evaluación:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error al guardar la evaluación, revise de nuevo el formulario.",
                variant: "destructive",
            });
        }
    };

    const groupedMembers = template
        ? template.tasks.reduce((acc, task) => {
            task.assigned_to.forEach((member) => {
                const existingMember = acc.find((m) => m.id === member.id);
                if (existingMember) {
                    existingMember.taskCount += 1;
                } else {
                    acc.push({
                        ...member,
                        taskCount: 1,
                    });
                }
            });
            return acc;
        }, [])
        : [];

    const totalTasks = groupedMembers.reduce((acc, member) => acc + member.taskCount, 0);

    const taskData = groupedMembers.map((member) => ({
        name: `${member.name} ${member.last_name}`,
        value: member.taskCount,
    }));

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <h1 className="text-2xl font-bold text-center mb-4 text-purple-600">Evaluación Semanal</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Sprint</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        value={selectedSprintId || ""}
                        onValueChange={(value) => setSelectedSprintId(value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar Sprint"/>
                        </SelectTrigger>
                        <SelectContent>
                            {sprints.map((sprint) => (
                                <SelectItem key={sprint.id} value={sprint.id.toString()}>{sprint.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

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
                                <h2 className="text-lg font-semibold text-green-700 mb-2">
                                    ¡Evaluación completada!
                                </h2>
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
                                    <CardTitle>Reporte semanal - Semana {template.week_number}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Requerimientos</h3>
                                            <ul className="list-disc list-inside space-y-2">
                                                {template.features.split("\n").map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Estado de Participación</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={taskData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({name, value}) => `${name}: ${value}`}
                                                    >
                                                        {taskData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`}
                                                                  fill={COLORS[index % COLORS.length]}/>
                                                        ))}
                                                    </Pie>
                                                    <Tooltip/>
                                                    <Legend/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="space-y-2 mt-4">
                                                {taskData.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{backgroundColor: COLORS[index % COLORS.length]}}
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
                                <h2 className="text-xl font-semibold text-purple-600">Tareas Completadas</h2>
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
                                                                <a href={link.url} target="_blank"
                                                                   rel="noopener noreferrer"
                                                                   className="text-blue-500 hover:underline">
                                                                    {link.description}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label
                                                    className="block text-sm font-medium text-gray-700">Satisfacción:</label>
                                                <Select
                                                    value={taskEvaluations[task.id]?.satisfaction_level?.toString() || ""}
                                                    onValueChange={(value) => handleSatisfactionChange(task.id, Number(value))}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccionar nivel de satisfacción"/>
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
                                                <label
                                                    className="block text-sm font-medium text-gray-700">Comentarios:</label>
                                                <textarea
                                                    value={taskEvaluations[task.id]?.comments || ""}
                                                    onChange={(e) => handleCommentChange(task.id, e.target.value)}
                                                    className="w-full p-2 border rounded-md"
                                                    rows={3}
                                                    maxLength={200}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Button onClick={handleSaveEvaluation} className="w-full">
                                Guardar evaluación
                            </Button>
                        </>
                    )}
                </>
            )}

            {showReport && evaluationHistory && (
                <WeeklyHistory evaluations={evaluationHistory}/>
            )}
        </div>
    );
}

