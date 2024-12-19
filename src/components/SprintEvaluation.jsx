import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Trash2, Plus, HelpCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getData, postData } from "../api/apiService";
import SprintHistoryView from "./SprintHistoryView";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const COLORS = ["#a78bfa", "#c4b5fd", "#8b5cf6"];

export default function SprintEvaluation({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [template, setTemplate] = useState(null);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [newStrength, setNewStrength] = useState("");
    const [newWeakness, setNewWeakness] = useState("");
    const [grades, setGrades] = useState({});
    const [comments, setComments] = useState({});
    const [summary, setSummary] = useState("");
    const [isEvaluationCompleted, setIsEvaluationCompleted] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const response = await getData(`/sprints?group_id=${groupId}`);
                setSprints(response || []);
            } catch (err) {
                console.error("Error al obtener los sprints:", err);
            }
        };
        fetchSprints();
    }, [groupId]);

    useEffect(() => {
        if (selectedSprintId) {
            const fetchSprintEvaluationTemplate = async () => {
                try {
                    const response = await getData(`/sprints/${selectedSprintId}/sprint-evaluation-template`);
                    setTemplate(response.data.template);
                    setIsEvaluationCompleted(false);
                } catch (error) {
                    console.error("Error al cargar la plantilla de evaluación de sprint:", error);

                    if (error.response && error.response.data && error.response.data.code === 298) {
                        toast({
                            title: "Evaluación ya realizada",
                            description: "Este sprint ya ha sido evaluado. No se puede realizar otra evaluación. Puedes ver el historial si deseas.",
                            status: "info",
                            variant: "outline",
                            className: "bg-green-500 text-white",
                            duration: "1000",
                        });
                        setIsEvaluationCompleted(true);
                    } else {
                        toast({
                            title: "Error al cargar el template",
                            description: "Hubo un problema al intentar cargar la plantilla de evaluación del sprint.",
                            status: "error",
                            variant: "destructive",
                        });
                    }
                }
            };
            fetchSprintEvaluationTemplate();
        }
    }, [selectedSprintId, toast]);

    const handleSaveEvaluation = async () => {
        setIsLoading(true);

        if (!template || Object.keys(grades).length === 0 || Object.keys(comments).length === 0 || !summary) {
            toast({
                title: "Error",
                description: "Todos los campos de evaluación deben estar completos, incluyendo el resumen.",
                variant: "destructive",
                duration: "1000"
            });
            setIsLoading(false);
            return;
        }

        const studentGrades = template.student_summaries.map(student => ({
            student_id: student.id,
            grade: parseInt(grades[student.id], 10) || 0,
            comments: comments[student.id] || ""
        }));

        const postDataPayload = {
            summary,
            student_grades: studentGrades,
            strengths,
            weaknesses
        };

        try {
            await postData(`/sprints/${selectedSprintId}/sprint-evaluation`, postDataPayload);
            toast({
                title: "Éxito",
                description: "Evaluación guardada con éxito.",
                status: "success",
                className: "bg-green-500 text-white",
                duration: "1000",
            });
            setIsConfirmDialogOpen(false);
            setIsEvaluationCompleted(true);  // Marcar la evaluación como completada
            setTemplate(null);  // Limpiar la plantilla para evitar mostrar el formulario nuevamente
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error al guardar la evaluación, Ve al boton de ayuda.",
                status: "error",
                variant: "destructive",
                duration: "1000",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addStrength = () => {
        if (newStrength && /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(newStrength) && newStrength.length <= 50 && strengths.length < 10) {
            setStrengths([...strengths, newStrength]);
            setNewStrength("");
        } else {
            toast({
                title: "Error",
                description: "El texto contiene caracteres no permitidos, supera los 50 caracteres, está vacío o se alcanzó el límite de 10 fortalezas.",
                variant: "destructive",
            });
        }
    };

    const addWeakness = () => {
        if (newWeakness && /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(newWeakness) && newWeakness.length <= 50 && weaknesses.length < 10) {
            setWeaknesses([...weaknesses, newWeakness]);
            setNewWeakness("");
        } else {
            toast({
                title: "Error",
                description: "El texto contiene caracteres no permitidos, supera los 50 caracteres, está vacío o se alcanzó el límite de 10 debilidades.",
                variant: "destructive",
            });
        }
    };

    const removeStrength = (index) => {
        setStrengths(strengths.filter((_, i) => i !== index));
    };

    const removeWeakness = (index) => {
        setWeaknesses(weaknesses.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e, type) => {
        if (e.key === "Enter") {
            e.preventDefault();
            type === "strength" ? addStrength() : addWeakness();
        }
    };

    const handleInputChange = (setter) => (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(value)) {
            setter(value);
        }
    };

    const allFieldsFilled = () => {
        if (!summary || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(summary)) return false;

        for (const studentId of Object.keys(comments)) {
            if (!comments[studentId] || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(comments[studentId])) return false;
        }

        for (const strength of strengths) {
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(strength)) return false;
        }

        for (const weakness of weaknesses) {
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ.,\s]*$/.test(weakness)) return false;
        }

        return true;
    };

    return (
        <div className="p-4 mx-auto space-y-6 max-w-full">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-center mb-4 text-purple-600 flex-grow">Evaluación de Sprint</h3>
                <button onClick={() => setIsHelpDialogOpen(true)} className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white">
                    <HelpCircle className="h-5 w-5" />
                </button>
            </div>

            {/* Selección de Sprint */}
            <div>
                <h3 className="text-purple-600 mb-2">Seleccionar Sprint</h3>
                {sprints.length === 0 ? (
                    <p className="text-center text-gray-500">Aún no hay sprints disponibles.</p>
                ) : (
                    <select
                        className="p-2 border border-gray-300 rounded-md shadow-sm w-full"
                        value={selectedSprintId || ""}
                        onChange={(e) => setSelectedSprintId(e.target.value)}
                    >
                        <option value="">Seleccionar Sprint</option>
                        {sprints.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>
                                {sprint.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {/* Botón para Mostrar/Ocultar Historial */}
            {isEvaluationCompleted && (
                <div className="mt-4">
                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? "Ocultar Historial" : "Ver Historial"}
                    </button>
                </div>
            )}
            {/* Mostrar Componente SprintHistoryView */}
            {showHistory && selectedSprintId && (
                <div className="mt-6">
                    <SprintHistoryView sprintId={selectedSprintId} />
                </div>
            )}
            {/* Mostrar mensaje o contenido del Sprint */}
            {template && !showHistory && (!template.weekly_evaluations_summary || template.weekly_evaluations_summary.length === 0) ? (
                <div className="p-6 bg-red-100 border border-red-400 text-red-800 rounded-lg shadow-md">
                    <h4 className="text-2xl font-bold">No se realizaron evaluaciones semanales este sprint</h4>
                    <p className="mt-2 text-sm">
                        Es necesario registrar evaluaciones semanales para habilitar este módulo. Por favor, regrese y
                        complete las evaluaciones semanales para continuar.
                    </p>
                </div>
            ) : (
                template && !showHistory && (
                    <>
                        {/* Información sobre el Sprint */}
                        <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
                            <h3 className="text-purple-700 text-lg font-semibold">{template.sprint_title}</h3>
                            <p><strong>Fecha de inicio:</strong> {new Date(template.start_date.item).toLocaleDateString()}</p>
                            <p><strong>Fecha de fin:</strong> {new Date(template.end_date.item).toLocaleDateString()}</p>
                            <p><strong>Porcentaje Planeado:</strong> {template.percentage}%</p>
                            <p><strong>Funcionalidades Planeadas:</strong></p>
                            <ul className="list-disc ml-4">
                                {template.planned_features.split("\n").map((feature, index) => (
                                    <li key={index}>{feature.trim()}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Progreso General de Tareas */}
                        <div className="mt-4">
                            <h3 className="text-purple-600 mb-4">Progreso General de Tareas</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[{ name: "Hecho", value: template.overall_progress.completed_tasks }, { name: "En progreso", value: template.overall_progress.in_progress_tasks }, { name: "Por hacer", value: template.overall_progress.todo_tasks }]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center">
                                <div className="flex justify-around">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                                        <span>Hecho: {template.overall_progress.completed_tasks}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                                        <span>En progreso: {template.overall_progress.in_progress_tasks}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                                        <span>Por hacer: {template.overall_progress.todo_tasks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Evaluaciones Semanales */}
                        <div className="mt-4">
                            <h3 className="text-purple-600 mb-4">Resumen de Evaluaciones Semanales</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[{ name: "Min Satisfacción", value: template.weekly_evaluations_summary[0].min_satisfaction }, { name: "Max Satisfacción", value: template.weekly_evaluations_summary[0].max_satisfaction }]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center">
                                <p className="text-purple-600">Tareas Evaluadas: {template.weekly_evaluations_summary[0].tasks_evaluated}</p>
                                <p className="text-purple-600">Satisfacción Promedio: {template.weekly_evaluations_summary[0].average_satisfaction}</p>
                                <p className="text-purple-600">Fecha de Evaluación: {new Date(template.weekly_evaluations_summary[0].evaluation_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Evaluación de Estudiantes */}
                        <div className="space-y-4 mt-6">
                            <h3 className="text-purple-600 mb-4">Ponderación y Calificación de Estudiantes</h3>
                            {template.student_summaries.length > 0 ? (
                                template.student_summaries.map((student) => {
                                    const noParticipationMessage = student.tasks_summary.completed === 0 ? "Este miembro no participó en el sprint" : null;

                                    return (
                                        <div key={student.id} className="bg-gray-100 rounded-lg p-4 mb-4">
                                            <h3 className="text-purple-700 font-semibold">{student.name} {student.last_name}</h3>
                                            {noParticipationMessage ? (
                                                <p className="text-black">{noParticipationMessage}</p>
                                            ) : (
                                                <>
                                                    <p>Tareas completadas: {student.tasks_summary.completed} de {student.tasks_summary.total}</p>
                                                    <p>Calificación Promedio: {student.satisfaction_levels.average || "N/A"} / 5</p>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie
                                                                data={[{ name: "Hecho", value: student.tasks_summary.completed }, { name: "En progreso", value: student.tasks_summary.in_progress }, { name: "Por hacer", value: student.tasks_summary.todo }]}
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                {COLORS.map((color, index) => (
                                                                    <Cell key={`cell-${index}`} fill={color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </>
                                            )}
                                            <div className="flex justify-around mt-2 text-sm">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                                                    <span>Hecho: {student.tasks_summary.completed}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                                                    <span>En progreso: {student.tasks_summary.in_progress}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                                                    <span>Por hacer: {student.tasks_summary.todo}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col mt-4 space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Ponderación</label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="text"
                                                        placeholder={`(${template.percentage})`}
                                                        value={grades[student.id] || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            if (/^\d*\.?\d*$/.test(value) && (value === "" || parseFloat(value) <= template.percentage)) {
                                                                setGrades((prevGrades) => ({
                                                                    ...prevGrades,
                                                                    [student.id]: value,
                                                                }));
                                                            }
                                                        }}
                                                        className="border border-gray-300 rounded-md p-2 w-24"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-500">/{template.percentage}</span>
                                                </div>

                                                <textarea
                                                    placeholder="Comentarios sobre el rendimiento"
                                                    value={comments[student.id] || ""}
                                                    onChange={handleInputChange((value) =>
                                                        setComments((prevComments) => ({...prevComments,
                                                            [student.id]: value,
                                                        }))
                                                    )}
                                                    className="w-full border border-gray-300 rounded-md p-2"
                                                    maxLength={400}
                                                />
                                                <div className="text-right text-xs text-gray-600">
                                                    {comments[student.id]?.length || 0}/400
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-purple-600">Este miembro no participó en el sprint</p>
                            )}
                        </div>

                        {/* Fortalezas y Debilidades */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-purple-600 mb-4">Fortalezas*</h3>
                                <ul className="list-disc ml-4 space-y-2">
                                    {strengths.map((strength, index) => (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{strength}</span>
                                            <Trash2
                                                className="text-red-600 cursor-pointer"
                                                onClick={() => removeStrength(index)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="text"
                                        value={newStrength}
                                        maxLength={50}
                                        onChange={handleInputChange(setNewStrength)}
                                        onKeyPress={(e) => handleKeyPress(e, "strength")}
                                        placeholder="Añadir fortaleza"
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                    <Plus
                                        className="text-purple-600 cursor-pointer ml-2"
                                        onClick={addStrength}
                                    />
                                </div>
                                <div className="text-right text-xs text-gray-600 mt-1">
                                    {newStrength.length}/50
                                </div>
                            </div>

                            <div>
                                <h3 className="text-purple-600 mb-4">Debilidades*</h3>
                                <ul className="list-disc ml-4 space-y-2">
                                    {weaknesses.map((weakness, index) => (
                                        <li key={index} className="flex justify-between items-center">
                                            <span>{weakness}</span>
                                            <Trash2
                                                className="text-red-600 cursor-pointer"
                                                onClick={() => removeWeakness(index)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="text"
                                        value={newWeakness}
                                        maxLength={50}
                                        onChange={handleInputChange(setNewWeakness)}
                                        onKeyPress={(e) => handleKeyPress(e, "weakness")}
                                        placeholder="Añadir debilidad"
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                    <Plus
                                        className="text-purple-600 cursor-pointer ml-2"
                                        onClick={addWeakness}
                                    />
                                </div>
                                <div className="text-right text-xs text-gray-600 mt-1">
                                    {newWeakness.length}/50
                                </div>
                            </div>
                        </div>

                        {/* Resumen del Sprint */}
                        <div className="mt-4">
                            <h3 className="text-purple-600 mb-4">Resumen del Sprint</h3>
                            <textarea
                                placeholder="Escribe un resumen del sprint"
                                value={summary}
                                onChange={handleInputChange(setSummary)}
                                className="w-full border border-gray-300 rounded-md p-2"
                                maxLength={400}
                            />
                            <div className="text-right text-xs text-gray-600">
                                {summary.length}/400
                            </div>
                        </div>

                        <button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md mt-4"
                            onClick={() => setIsConfirmDialogOpen(true)}
                            disabled={!allFieldsFilled()}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar evaluación"}
                        </button>
                    </>
                )
            )}

            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Instrucciones</DialogTitle>
                    </DialogHeader>
                    <p>Para usar este componente:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Todos los campos son obligatorios.</li>
                        <li>No se pueden colocar caracteres especiales a excepción de "," "." y los acentos, ñ, y
                            diéresis.
                        </li>
                        <li>Este componente es un resumen de las tareas que hicieron los estudiantes en la semana del
                            sprint.
                        </li>
                        <li>No olvides presionar enter o el boton de "+" para agregar las fortalezas y debilidades.
                        </li>
                        <li>Recuerda: La evaluación de sprint solo se puede crear dentro de los 4 días posteriores a la fecha de finalización del sprint o después de que haya terminado.</li>
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
                    <p>¿Está seguro de que desea guardar esta evaluación? No se puede revertir después</p>
                    <DialogFooter>
                        <Button onClick={() => setIsConfirmDialogOpen(false)}className="bg-red-600 hover:bg-red-700 text-white" variant="outline">
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