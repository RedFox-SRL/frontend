import { useState, useEffect } from 'react';
import { getData, postData } from '../api/apiService'; // Usar Axios

export default function EvaluationView({ groupId, onBack }) {
    const [sprints, setSprints] = useState([]);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [evaluations, setEvaluations] = useState({});
    const [isSubmitting, setIsSubmitting] = useState({});
    const [toast, setToast] = useState(null);
    const [error, setError] = useState('');

    // Obtener los sprints usando el groupId dinámicamente
    const fetchSprints = async () => {
        setIsLoading(true);  // Para manejar la carga inicial
        try {
            const response = await getData(`/sprints?group_id=${groupId}`);
            if (response && response.length > 0) {
                setSprints(response);
                setError('');  // Limpiar cualquier error previo
            } else {
                setSprints([]); // Vaciar los sprints si no hay
                setError('No hay sprints activos en este grupo.');
            }
        } catch (err) {
            console.error("Error al obtener los sprints:", err);
            setError('No hay sprints activos en este grupo.');
        } finally {
            setIsLoading(false);  // Finalizar el estado de carga
        }
    };

    useEffect(() => {
        fetchSprints();
    }, [groupId]);

    // Obtener la plantilla de evaluación del sprint seleccionado
    const fetchEvaluationTemplate = async (sprintId) => {
        setIsLoading(true);
        try {
            const response = await getData(`/sprints/${sprintId}/evaluation-template`);
            if (response && response.tasks && response.tasks.length > 0) {
                setTasks(response.tasks);
                setError(''); // Limpiar cualquier error previo
            } else {
                setTasks([]);
                setError('No hay tareas para evaluar en este sprint.');
            }
        } catch (err) {
            console.error("Error al obtener la plantilla de evaluación:", err);
            setError('No se pudo cargar la plantilla de evaluación.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSprintChange = (sprintId) => {
        setSelectedSprintId(sprintId);
        fetchEvaluationTemplate(sprintId);
    };

    const handleEvaluationChange = (taskId, field, value) => {
        setEvaluations((prev) => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value,
            },
        }));
    };

    // Enviar evaluación individual
// Enviar evaluación individual
    const handleSubmitEvaluation = async (taskId) => {
        setIsSubmitting((prev) => ({
            ...prev,
            [taskId]: true,
        }));
        try {
            const evaluation = evaluations[taskId];
            if (!evaluation?.grade || !evaluation?.comment) {
                setToast({ message: 'Por favor ingresa calificación y comentario para esta tarea.', type: 'error' });
                setIsSubmitting((prev) => ({
                    ...prev,
                    [taskId]: false,
                }));
                return;
            }

            const payload = {
                evaluations: {
                    [taskId]: {
                        grade: evaluation.grade,
                        comment: evaluation.comment,
                    },
                },
            };

            console.log("Enviando evaluación: ", payload);

            // Enviar la evaluación
            await postData(`/sprints/${selectedSprintId}/submit-evaluation`, payload);

            // Mostrar mensaje de éxito
            setToast({ message: 'La evaluación se ha guardado correctamente.', type: 'success' });

            // Eliminar la tarea evaluada del listado
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

            // Limpiar la evaluación local para esta tarea
            setEvaluations((prev) => {
                const { [taskId]: removed, ...rest } = prev;
                return rest;
            });
        } catch (error) {
            console.error("Error al enviar la evaluación:", error);
            setToast({ message: 'No se pudo guardar la evaluación. Intente de nuevo.', type: 'error' });
        } finally {
            setIsSubmitting((prev) => ({
                ...prev,
                [taskId]: false,
            }));
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-white-100 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Botón para volver a ManagementView */}
                <button
                    onClick={onBack}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition-all duration-300 ease-in-out mb-6"
                >
                    Volver
                </button>

                <h1 className="text-3xl font-bold text-purple-800 mb-8 text-center">Plantilla de Evaluación</h1>

                <div className="bg-white shadow-lg rounded-lg p-6 mb-8 transition-all duration-300 ease-in-out transform hover:shadow-xl">
                    <h2 className="text-xl font-semibold text-purple-700 mb-4">Seleccionar Sprint</h2>
                    <select
                        onChange={(e) => handleSprintChange(e.target.value)}
                        value={selectedSprintId || ''}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                    >
                        <option value="">Seleccionar Sprint</option>
                        {sprints.map((sprint) => (
                            <option key={sprint.id} value={sprint.id}>{sprint.title}</option>
                        ))}
                    </select>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {!isLoading && sprints.length === 0 && (
                    <p className="text-center text-gray-600">{error}</p>
                )}

                {selectedSprintId && !isLoading && tasks.length === 0 && (
                    <p className="text-center text-gray-600">{error}</p>
                )}

                {selectedSprintId && !isLoading && tasks.length > 0 && (
                    <div className="space-y-6">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out transform hover:shadow-lg">
                                <h3 className="text-lg font-semibold text-purple-600 mb-2">{task.title}</h3>
                                <p className="text-gray-600 mb-4">{task.description}</p>
                                <p className="text-sm text-purple-500 mb-4">Asignado a: {task.assigned_to.user.name} {task.assigned_to.user.last_name}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                                        <select
                                            onChange={(e) => handleEvaluationChange(task.id, 'grade', e.target.value)}
                                            value={evaluations[task.id]?.grade || ''}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                                        >
                                            <option value="">Seleccionar calificación</option>
                                            <option value="Excelente">Excelente</option>
                                            <option value="Bueno">Bueno</option>
                                            <option value="Aceptable">Aceptable</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Malo">Malo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                                        <textarea
                                            placeholder="Añadir un comentario..."
                                            value={evaluations[task.id]?.comment || ''}
                                            onChange={(e) => handleEvaluationChange(task.id, 'comment', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSubmitEvaluation(task.id)}
                                    disabled={isSubmitting[task.id]}
                                    className={`w-full mt-4 p-3 text-white rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                                        isSubmitting[task.id] ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                >
                                    {isSubmitting[task.id] ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Guardar Evaluación'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {toast && (
                    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} shadow-lg transition-all duration-500 ease-in-out transform translate-y-0 opacity-100`}>
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
}