import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, MoreVertical } from "lucide-react";

const initialColumns = [
  {
    id: 'por-hacer',
    title: 'Por Hacer',
    tasks: [
      { id: 'task-1', title: 'Diseñar UI', description: 'Crear mockups de la interfaz', assignee: 'Ana' },
      { id: 'task-2', title: 'Implementar auth', description: 'Configurar sistema de autenticación', assignee: 'Carlos' },
    ],
  },
  {
    id: 'en-progreso',
    title: 'En Progreso',
    tasks: [
      { id: 'task-3', title: 'Desarrollar API', description: 'Implementar endpoints REST', assignee: 'María' },
    ],
  },
  {
    id: 'hecho',
    title: 'Hecho',
    tasks: [
      { id: 'task-4', title: 'Setup inicial', description: 'Configurar entorno de desarrollo', assignee: 'Juan' },
    ],
  },
];

const teamMembers = ['Ana', 'Carlos', 'María', 'Juan', 'Laura'];

export default function KanbanBoardComponent() {
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

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
    }
  };

  const addNewTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignee) return;

    const newTaskObj = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
    };

    const newColumns = columns.map(col => {
      if (col.id === 'por-hacer') {
        return { ...col, tasks: [...col.tasks, newTaskObj] };
      }
      return col;
    });

    setColumns(newColumns);
    setNewTask({});
    setIsDialogOpen(false);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Card className="w-full bg-[#2D1B69] text-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#3D2B79]">
          <CardTitle className="text-2xl font-bold">Tablero Kanban</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="hover:bg-[#3D2B79]">
                <Plus className="h-5 w-5" />
                <span className="ml-2">Nueva Tarea</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2D1B69] text-white">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskTitle" className="text-right">Título</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="col-span-3 bg-[#3D2B79] border-[#4D3B89]" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskDescription" className="text-right">Descripción</Label>
                  <Input
                    id="taskDescription"
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="col-span-3 bg-[#3D2B79] border-[#4D3B89]" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taskAssignee" className="text-right">Asignar a</Label>
                  <Select onValueChange={(value) => setNewTask({...newTask, assignee: value})}>
                    <SelectTrigger className="col-span-3 bg-[#3D2B79] border-[#4D3B89]">
                      <SelectValue placeholder="Seleccionar miembro" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#3D2B79]">
                      {teamMembers.map((member) => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addNewTask} className="bg-[#4D3B89] hover:bg-[#5D4B99]">Agregar Tarea</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="bg-[#3D2B79] rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-lg">{column.title}</h3>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-[#4D3B89] p-3 mb-3 rounded-lg shadow-md"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{task.title}</span>
                                <MoreVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                              <div className="text-xs text-gray-400">Asignado a: {task.assignee}</div>
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
        </CardContent>
      </Card>
    </DragDropContext>
  );
}