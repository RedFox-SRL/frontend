import React, {useState, useEffect} from 'react';
import {getData, postData, putData, deleteData} from '../api/apiService';
import {Loader2} from "lucide-react";
import SprintHeader from './SprintHeader';
import KanbanBoard from './KanbanBoard';
import NewTaskDialog from './NewTaskDialog';
import {useToast} from "@/hooks/use-toast";

const initialColumns = [{id: 'todo', title: 'Por Hacer', tasks: []}, {
    id: 'in_progress', title: 'En Progreso', tasks: []
}, {id: 'done', title: 'Hecho', tasks: []},];

export default function SprintKanbanBoard({groupId}) {
    const [sprints, setSprints] = useState([]);
    const [currentSprint, setCurrentSprint] = useState(null);
    const [columns, setColumns] = useState(initialColumns);
    const [newTask, setNewTask] = useState({});
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {toast} = useToast();

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [sprintsData, groupDetailsResponse] = await Promise.all([getData(`/sprints?group_id=${groupId}`), getData(`/groups/details?group_id=${groupId}`)]);

                setSprints(sprintsData);

                if (groupDetailsResponse.success && groupDetailsResponse.data && groupDetailsResponse.data.group) {
                    setGroupDetails(groupDetailsResponse.data.group);
                    const members = [groupDetailsResponse.data.group.representative, ...Object.values(groupDetailsResponse.data.group.members || {})].filter(Boolean);
                    setTeamMembers(members);
                }

                if (sprintsData.length > 0) {
                    setCurrentSprint(sprintsData[0]);
                    await fetchTasks(sprintsData[0].id);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información inicial. Por favor, intente de nuevo.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [groupId]);

    const fetchTasks = async (sprintId) => {
        try {
            const tasks = await getData(`/tasks?sprint_id=${sprintId}`);
            const updatedColumns = initialColumns.map(col => ({
                ...col, tasks: tasks.filter(task => task.status === col.id),
            }));
            setColumns(updatedColumns);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las tareas. Por favor, intente de nuevo.",
                variant: "destructive",
            });
        }
    };

    const onDragEnd = async (result) => {
        const {source, destination} = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = columns.find(col => col.id === source.droppableId);
        const destColumn = columns.find(col => col.id === destination.droppableId);

        if (sourceColumn && destColumn) {
            const sourceTasks = Array.from(sourceColumn.tasks);
            const destTasks = Array.from(destColumn.tasks);
            const [removedTask] = sourceTasks.splice(source.index, 1);

            destTasks.splice(destination.index, 0, removedTask);

            const updatedColumns = columns.map(col => {
                if (col.id === source.droppableId) {
                    return {...col, tasks: sourceTasks};
                } else if (col.id === destination.droppableId) {
                    return {...col, tasks: destTasks};
                } else {
                    return col;
                }
            });

            setColumns(updatedColumns);

            try {
                await putData(`/tasks/${removedTask.id}`, {
                    title: removedTask.title,
                    description: removedTask.description,
                    assigned_to: removedTask.assigned_to,
                    status: destColumn.id
                });
                toast({
                    title: "Tarea actualizada", description: "La tarea se ha movido exitosamente.",
                });
            } catch (error) {
                console.error("Error updating task:", error);
                toast({
                    title: "Error",
                    description: "No se pudo actualizar la tarea. Por favor, intente de nuevo.",
                    variant: "destructive",
                });
            }
        }
    };

    const addNewTask = async () => {
        if (!newTask.title || !newTask.description || !newTask.assignee) {
            toast({
                title: "Error",
                description: "Por favor, complete todos los campos de la tarea.",
                variant: "destructive",
            });
            return;
        }

        const newTaskObj = {
            sprint_id: currentSprint.id,
            title: newTask.title,
            description: newTask.description,
            assigned_to: newTask.assignee,
            status: 'todo',
        };

        try {
            const createdTask = await postData('/tasks', newTaskObj);

            const newColumns = columns.map(col => {
                if (col.id === 'todo') {
                    return {...col, tasks: [...col.tasks, createdTask]};
                }
                return col;
            });

            setColumns(newColumns);
            setNewTask({});
            setIsTaskDialogOpen(false);
            toast({
                title: "Tarea creada", description: "La nueva tarea se ha añadido exitosamente.",
            });
        } catch (error) {
            console.error("Error creating task:", error);
            toast({
                title: "Error",
                description: "No se pudo crear la tarea. Por favor, intente de nuevo.",
                variant: "destructive",
            });
        }
    };

    const handleSprintChange = async (sprintId) => {
        setIsLoading(true);
        const selectedSprint = sprints.find(sprint => sprint.id === parseInt(sprintId));
        if (selectedSprint) {
            setCurrentSprint(selectedSprint);
            await fetchTasks(sprintId);
        }
        setIsLoading(false);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteData(`/tasks/${taskId}`);
            const updatedColumns = columns.map(col => ({
                ...col, tasks: col.tasks.filter(task => task.id !== taskId)
            }));
            setColumns(updatedColumns);
            toast({
                title: "Tarea eliminada", description: "La tarea se ha eliminado exitosamente.",
            });
        } catch (error) {
            console.error("Error deleting task:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la tarea. Por favor, intente de nuevo.",
                variant: "destructive",
            });
        }
    };

    const handleEditTask = async (taskId, updatedTask) => {
        try {
            const editedTask = await putData(`/tasks/${taskId}`, updatedTask);
            const updatedColumns = columns.map(col => ({
                ...col, tasks: col.tasks.map(task => task.id === taskId ? editedTask : task)
            }));
            setColumns(updatedColumns);
            toast({
                title: "Tarea actualizada", description: "La tarea se ha actualizado exitosamente.",
            });
        } catch (error) {
            console.error("Error editing task:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la tarea. Por favor, intente de nuevo.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
            <span className="ml-2 text-lg text-purple-600">Cargando...</span>
        </div>);
    }

    return (<div className="w-full bg-white rounded-lg shadow-lg overflow-hidden mt-6">
        <SprintHeader
            sprints={sprints}
            currentSprint={currentSprint}
            onSprintChange={handleSprintChange}
            onNewTaskClick={() => setIsTaskDialogOpen(true)}
        />
        <div className="p-4 sm:p-6">
            {currentSprint ? (<KanbanBoard
                sprint={currentSprint}
                columns={columns}
                onDragEnd={onDragEnd}
                teamMembers={teamMembers}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
            />) : (<div className="text-center py-12">
                <p className="text-lg sm:text-xl text-purple-600">No hay sprint disponible.</p>
            </div>)}
        </div>
        <NewTaskDialog
            isOpen={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            newTask={newTask}
            setNewTask={setNewTask}
            addNewTask={addNewTask}
            teamMembers={teamMembers}
        />
    </div>);
}