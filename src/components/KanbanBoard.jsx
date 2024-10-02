import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical, Edit, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import TaskEditDialog from './TaskEditDialog';

export default function KanbanBoard({ sprint, columns, onDragEnd, teamMembers, onDeleteTask, onEditTask }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({});

    const getAssigneeName = (assignedTo) => {
        const assignee = teamMembers.find(member => member.id === parseInt(assignedTo));
        return assignee ? `${assignee.name} ${assignee.last_name}` : 'No asignado';
    };

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setIsEditDialogOpen(true);
    };

    const toggleTaskExpansion = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    return (
        <>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-purple-800">
                Sprint: {sprint.title} ({sprint.start_date} - {sprint.end_date})
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
                                        className="min-h-[200px] space-y-3"
                                    >
                                        {column.tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-semibold text-purple-800 break-words w-5/6">{task.title}</span>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button className="text-purple-400 hover:text-purple-600">
                                                                        <MoreVertical className="h-5 w-5" />
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-40">
                                                                    <div className="flex flex-col space-y-2">
                                                                        <Button variant="ghost" className="justify-start" onClick={() => handleEditClick(task)}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Editar
                                                                        </Button>
                                                                        <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteTask(task.id)}>
                                                                            <Trash className="h-4 w-4 mr-2" />
                                                                            Eliminar
                                                                        </Button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <div className="text-sm text-purple-600 mb-2 break-words">
                                                            {expandedTasks[task.id]
                                                                ? task.description
                                                                : task.description.slice(0, 100) + (task.description.length > 100 ? '...' : '')}
                                                        </div>
                                                        {task.description.length > 100 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleTaskExpansion(task.id)}
                                                                className="text-purple-600 hover:text-purple-800 p-0 h-auto"
                                                            >
                                                                {expandedTasks[task.id] ? (
                                                                    <>
                                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                                        Menos
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                                        Más
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        <div className="text-xs text-purple-500 mt-2">
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
            <TaskEditDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                task={selectedTask}
                onEditTask={onEditTask}
                teamMembers={teamMembers}
            />
        </>
    );
}