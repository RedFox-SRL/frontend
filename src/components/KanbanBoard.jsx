import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical } from "lucide-react";

export default function KanbanBoard({ sprint, columns, onDragEnd, teamMembers }) {
    const getAssigneeName = (assignedTo) => {
        const assignee = teamMembers.find(member => member.id === parseInt(assignedTo));
        return assignee ? `${assignee.name} ${assignee.last_name}` : 'No asignado';
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
                                        className="min-h-[200px]"
                                    >
                                        {column.tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-3 mb-3 rounded-lg shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-semibold text-purple-800">{task.title}</span>
                                                            <MoreVertical className="h-5 w-5 text-purple-400" />
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
    );
}