import React, { useState, useEffect } from 'react';
import { getData, postData, putData } from '../api/apiService';
import { Loader2 } from "lucide-react";
import SprintHeader from './SprintHeader';
import KanbanBoard from './KanbanBoard';
import NewSprintDialog from './NewSprintDialog';
import NewTaskDialog from './NewTaskDialog';

const initialColumns = [
    { id: 'todo', title: 'Por Hacer', tasks: [] },
    { id: 'in_progress', title: 'En Progreso', tasks: [] },
    { id: 'done', title: 'Hecho', tasks: [] },
];

export default function SprintKanbanBoard({ groupId }) {
    const [sprints, setSprints] = useState([]);
    const [currentSprint, setCurrentSprint] = useState(null);
    const [columns, setColumns] = useState(initialColumns);
    const [newTask, setNewTask] = useState({});
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
    const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '' });
    const [groupDetails, setGroupDetails] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [sprintsData, groupDetailsResponse] = await Promise.all([
                    getData(`/sprints?group_id=${groupId}`),
                    getData(`/groups/details?group_id=${groupId}`)
                ]);

                setSprints(sprintsData);

                if (groupDetailsResponse.success && groupDetailsResponse.data && groupDetailsResponse.data.group) {
                    setGroupDetails(groupDetailsResponse.data.group);
                    const members = [
                        groupDetailsResponse.data.group.representative,
                        ...Object.values(groupDetailsResponse.data.group.members || {})
                    ].filter(Boolean);
                    setTeamMembers(members);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [groupId]);

    const onDragEnd = async (result) => {
        const { source, destination } = result;
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
                    return { ...col, tasks: sourceTasks };
                } else if (col.id === destination.droppableId) {
                    return { ...col, tasks: destTasks };
                } else {
                    return col;
                }
            });

            setColumns(updatedColumns);
            updateSprintColumns(updatedColumns);

            await putData(`/tasks/${removedTask.id}`, {
                title: removedTask.title,
                description: removedTask.description,
                assigned_to: removedTask.assigned_to,
                status: destColumn.id
            });
        }
    };

    const addNewTask = async () => {
        if (!newTask.title || !newTask.description || !newTask.assignee) return;

        const newTaskObj = {
            sprint_id: currentSprint.id,
            title: newTask.title,
            description: newTask.description,
            assigned_to: newTask.assignee,
            status: 'todo',
        };

        const createdTask = await postData('/tasks', newTaskObj);

        const newColumns = columns.map(col => {
            if (col.id === 'todo') {
                return { ...col, tasks: [...col.tasks, createdTask] };
            }
            return col;
        });

        setColumns(newColumns);
        updateSprintColumns(newColumns);
        setNewTask({});
        setIsTaskDialogOpen(false);
    };

    const addNewSprint = async () => {
        if (!newSprint.name || !newSprint.startDate || !newSprint.endDate) return;

        const newSprintObj = {
            group_id: groupId,
            title: newSprint.name,
            start_date: newSprint.startDate,
            end_date: newSprint.endDate,
        };

        const createdSprint = await postData('/sprints', newSprintObj);

        setSprints([...sprints, createdSprint]);
        setNewSprint({ name: '', startDate: '', endDate: '' });
        setIsSprintDialogOpen(false);

        if (!currentSprint) {
            setCurrentSprint(createdSprint);
            setColumns(initialColumns);
        }
    };

    const updateSprintColumns = async (updatedColumns) => {
        if (currentSprint) {
            const updatedSprints = sprints.map(sprint =>
                sprint.id === currentSprint.id ? { ...sprint, columns: updatedColumns } : sprint
            );
            setSprints(updatedSprints);
            setCurrentSprint({ ...currentSprint, columns: updatedColumns });
        }
    };

    const handleSprintChange = async (sprintId) => {
        setIsLoading(true);
        const selectedSprint = sprints.find(sprint => sprint.id === parseInt(sprintId));
        if (selectedSprint) {
            setCurrentSprint(selectedSprint);
            try {
                const tasks = await getData(`/tasks?sprint_id=${sprintId}`);
                const updatedColumns = initialColumns.map(col => ({
                    ...col,
                    tasks: tasks.filter(task => task.status === col.id),
                }));
                setColumns(updatedColumns);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-2 text-lg text-purple-600">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden mt-6">
            <SprintHeader
                sprints={sprints}
                currentSprint={currentSprint}
                onSprintChange={handleSprintChange}
                onNewSprintClick={() => setIsSprintDialogOpen(true)}
                onNewTaskClick={() => setIsTaskDialogOpen(true)}
            />
            <div className="p-4 sm:p-6">
                {currentSprint ? (
                    <KanbanBoard
                        sprint={currentSprint}
                        columns={columns}
                        onDragEnd={onDragEnd}
                        teamMembers={teamMembers}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-lg sm:text-xl text-purple-600">No hay sprint seleccionado. Por favor, crea o selecciona un sprint para comenzar.</p>
                    </div>
                )}
            </div>
            <NewSprintDialog
                isOpen={isSprintDialogOpen}
                onClose={() => setIsSprintDialogOpen(false)}
                newSprint={newSprint}
                setNewSprint={setNewSprint}
                addNewSprint={addNewSprint}
            />
            <NewTaskDialog
                isOpen={isTaskDialogOpen}
                onClose={() => setIsTaskDialogOpen(false)}
                newTask={newTask}
                setNewTask={setNewTask}
                addNewTask={addNewTask}
                teamMembers={teamMembers}
            />
        </div>
    );
}