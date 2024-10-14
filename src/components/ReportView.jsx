import React, { useState, useEffect } from 'react';
import { getData } from '../api/apiService'; // Usamos Axios para las solicitudes

export default function ReportView({ groupId }) {
    const [sprints, setSprints] = useState([]); // Estado para almacenar los sprints
    const [selectedSprintId, setSelectedSprintId] = useState(null); // Sprint seleccionado
    const [tasks, setTasks] = useState([]); // Estado para almacenar las tareas
    const [filteredTasks, setFilteredTasks] = useState([]); // Estado para las tareas filtradas
    const [isLoading, setIsLoading] = useState(false); // Estado para el indicador de carga
    const [error, setError] = useState('');
    const [membersFilter, setMembersFilter] = useState('Todos');

    // Obtener los sprints asociados a un grupo
    const fetchSprints = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/sprints?group_id=${groupId}`);
            if (response && response.length > 0) {
                setSprints(response);
                setError('');
            } else {
                setSprints([]);
                setError('No hay sprints activos en este grupo.');
            }
        } catch (err) {
            console.error('Error al obtener los sprints:', err);
            setError('No hay sprints activos en este grupo.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSprints();
    }, [groupId]);

    // Obtener las tareas evaluadas del sprint seleccionado
    const fetchEvaluatedTasks = async (sprintId) => {
        setIsLoading(true);
        try {
            const response = await getData(`/sprints/${sprintId}/evaluated-tasks`);
            if (response && response.tasks && response.tasks.length > 0) {
                setTasks(response.tasks);
                setFilteredTasks(response.tasks); // Inicialmente sin filtro
                setError('');
            } else {
                setTasks([]);
                setFilteredTasks([]);
                setError('No hay tareas evaluadas en este sprint.');
            }
        } catch (err) {
            console.error('Error al obtener las tareas evaluadas:', err);
            setError('No se pudo cargar las tareas evaluadas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSprintChange = (sprintId) => {
        setSelectedSprintId(sprintId);
        fetchEvaluatedTasks(sprintId);
    };

    const handleFilterByMember = (memberName) => {
        setMembersFilter(memberName);
        if (memberName === 'Todos') {
            setFilteredTasks(tasks);
        } else {
            setFilteredTasks(tasks.filter((task) => `${task.assigned_to.user.name} ${task.assigned_to.user.last_name}` === memberName));
        }
    };

    const getMemberTaskCount = (name) => {
        return tasks.filter((task) => `${task.assigned_to.user.name} ${task.assigned_to.user.last_name}` === name).length;
    };

    const uniqueMembers = [...new Set(tasks.map((task) => `${task.assigned_to.user.name} ${task.assigned_to.user.last_name}`))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white-100 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-purple-800 mb-8 text-center">Reporte de Evaluaciones</h1>

                {/* Contenedor principal con flex para alinear el filtro y la selección */}
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
                    {/* Filtro por Miembro */}
                    <div className="w-full md:w-1/4 bg-white shadow-lg rounded-lg p-6 transition-all duration-300 ease-in-out">
                        <h2 className="text-xl font-semibold text-purple-700 mb-4">Filtrar por Miembro</h2>
                        <ul>
                            <li
                                className={`cursor-pointer mb-2 ${membersFilter === 'Todos' ? 'font-bold text-purple-700' : 'text-gray-600'}`}
                                onClick={() => handleFilterByMember('Todos')}
                            >
                                Todos ({tasks.length})
                            </li>
                            {uniqueMembers.map((member) => (
                                <li
                                    key={member}
                                    className={`cursor-pointer mb-2 ${membersFilter === member ? 'font-bold text-purple-700' : 'text-gray-600'}`}
                                    onClick={() => handleFilterByMember(member)}
                                >
                                    {member} ({getMemberTaskCount(member)})
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contenedor de selección de sprint */}
                    <div className="w-full md:w-3/4">
                        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 transition-all duration-300 ease-in-out transform hover:shadow-xl">
                            <h2 className="text-xl font-semibold text-purple-700 mb-4">Seleccionar Sprint</h2>
                            <select
                                onChange={(e) => handleSprintChange(e.target.value)}
                                value={selectedSprintId || ''}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                            >
                                <option value="">Seleccionar Sprint</option>
                                {sprints.map((sprint) => (
                                    <option key={sprint.id} value={sprint.id}>
                                        {sprint.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                            </div>
                        )}

                        {/* Mostrar tareas solo si hay un sprint seleccionado */}
                        {!isLoading && selectedSprintId && (
                            <>
                                {filteredTasks.length === 0 && (
                                    <p className="text-center text-gray-600">{error}</p>
                                )}

                                {filteredTasks.length > 0 && (
                                    <div className="space-y-6">
                                        {filteredTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 ease-in-out transform hover:shadow-lg"
                                            >
                                                <h3 className="text-lg font-semibold text-purple-600 mb-2">{task.title}</h3>
                                                <p className="text-gray-600 mb-4">{task.description}</p>
                                                <p className="text-sm text-purple-500 mb-4">
                                                    Asignado a: {task.assigned_to.user.name} {task.assigned_to.user.last_name}
                                                </p>
                                                <div>
                                                    <p className="font-bold">Calificación: <span className="font-normal">{task.evaluation.grade}</span></p>
                                                    <p className="font-bold">Comentario: <span className="font-normal">{task.evaluation.comment}</span></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
