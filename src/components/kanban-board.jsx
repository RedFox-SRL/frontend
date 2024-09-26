import React, {useState, useEffect} from 'react';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "./ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Plus, MoreVertical, Calendar, Loader2} from "lucide-react";
import {getData, postData, putData} from '../api/apiService';

const initialColumns = [
    {id: 'todo', title: 'Por Hacer', tasks: []},
    {id: 'in_progress', title: 'En Progreso', tasks: []},
    {id: 'done', title: 'Hecho', tasks: []},
];

export default function SprintKanbanBoard({groupId}) {
    const [sprints, setSprints] = useState([]);
    const [currentSprint, setCurrentSprint] = useState(null);
    const [columns, setColumns] = useState(initialColumns);
    const [newTask, setNewTask] = useState({});
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
    const [newSprint, setNewSprint] = useState({name: '', startDate: '', endDate: ''});
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
            updateSprintColumns(updatedColumns);

            // Update task status in the API with complete task data
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
                return {...col, tasks: [...col.tasks, createdTask]};
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
        setNewSprint({name: '', startDate: '', endDate: ''});
        setIsSprintDialogOpen(false);

        if (!currentSprint) {
            setCurrentSprint(createdSprint);
            setColumns(initialColumns);
        }
    };

    const updateSprintColumns = async (updatedColumns) => {
        if (currentSprint) {
            const updatedSprints = sprints.map(sprint =>
                sprint.id === currentSprint.id ? {...sprint, columns: updatedColumns} : sprint
            );
            setSprints(updatedSprints);
            setCurrentSprint({...currentSprint, columns: updatedColumns});
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

    const getAssigneeName = (assignedTo) => {
        const assignee = teamMembers.find(member => member.id === parseInt(assignedTo));
        return assignee ? `${assignee.name} ${assignee.last_name}` : 'No asignado';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
                <span className="ml-2 text-lg text-purple-600">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden mt-6">
            <div className="bg-purple-600 p-4 sm:p-6">
                <div
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Tablero Kanban de Sprints</h2>
                    <div className="flex flex-wrap gap-2">
                        <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-100">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                                    <span>Nuevo Sprint</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-purple-600">Crear Nuevo Sprint</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="sprintName" className="text-right">Nombre</Label>
                                        <Input
                                            id="sprintName"
                                            value={newSprint.name}
                                            onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="startDate" className="text-right">Fecha Inicio</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={newSprint.startDate}
                                            onChange={(e) => setNewSprint({...newSprint, startDate: e.target.value})}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="endDate" className="text-right">Fecha Fin</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={newSprint.endDate}
                                            onChange={(e) => setNewSprint({...newSprint, endDate: e.target.value})}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <Button onClick={addNewSprint} className="bg-purple-600 text-white hover:bg-purple-700">Crear
                                    Sprint</Button>
                            </DialogContent>
                        </Dialog>

                        <Select onValueChange={handleSprintChange}>
                            <SelectTrigger className="bg-white text-purple-600 border-purple-300 w-full sm:w-auto">
                                <SelectValue placeholder="Seleccionar Sprint"/>
                            </SelectTrigger>
                            <SelectContent>
                                {sprints.map((sprint) => (
                                    <SelectItem key={sprint.id} value={sprint.id.toString()}>{sprint.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="bg-purple-500 text-white hover:bg-purple-400"
                                        disabled={!currentSprint}>
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                                    <span>Nueva Tarea</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-purple-600">Agregar Nueva Tarea</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="taskTitle" className="text-right">Título</Label>
                                        <Input
                                            id="taskTitle"
                                            value={newTask.title || ''}
                                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="taskDescription" className="text-right">Descripción</Label>
                                        <Input
                                            id="taskDescription"
                                            value={newTask.description || ''}
                                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="taskAssignee" className="text-right">Asignar a</Label>
                                        <Select onValueChange={(value) => setNewTask({...newTask, assignee: value})}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Seleccionar miembro"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teamMembers.map((member) => (
                                                    <SelectItem key={member.id} value={member.id.toString()}>
                                                        {member.name} {member.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={addNewTask} className="bg-purple-600 text-white hover:bg-purple-700">Agregar
                                    Tarea</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            <div className="p-4 sm:p-6">
                {currentSprint ? (
                    <>
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-purple-800">
                            Sprint: {currentSprint.title} ({currentSprint.start_date} - {currentSprint.end_date})
                        </h3>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {columns.map((column) => (
                                    <div key={column.id} className="bg-purple-100 rounded-lg p-4">
                                        <h4 className="font-semibold mb-4 text-lg text-purple-800">{column.title}</h4>
                                        <Droppable droppableId={column.id}>
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="min-h-[200px]"
                                                >
                                                    {column.tasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id.toString()}
                                                                   index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="bg-white p-3 mb-3 rounded-lg shadow-sm"
                                                                >
                                                                    <div
                                                                        className="flex justify-between items-center mb-2">
                                                                        <span
                                                                            className="font-semibold text-purple-800">{task.title}</span>
                                                                        <MoreVertical
                                                                            className="h-5 w-5 text-purple-400"/>
                                                                    </div>
                                                                    <p className="text-sm text-purple-600 mb-2">{task.description}</p>
                                                                    <div className="text-xs text-purple-500">
                                                                        Asignado a: {getAssigneeName(task.assigned_to)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>
                        </DragDropContext>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-lg sm:text-xl text-purple-600">No hay sprint seleccionado. Por favor, crea o
                            selecciona un sprint para comenzar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}