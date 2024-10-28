import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Link,
  MoreHorizontal,
  Paperclip,
  Trash,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskEditDialog from "./TaskEditDialog";

const getTaskBorderColor = (columnId) => {
  switch (columnId) {
    case "todo":
      return "border-yellow-400";
    case "in_progress":
      return "border-blue-500";
    case "done":
      return "border-green-500";
    default:
      return "border-gray-300";
  }
};

export default function KanbanBoard({
  sprint,
  columns: initialColumns,
  onDragEnd,
  teamMembers,
  onDeleteTask,
  onEditTask,
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const getAssigneeNames = useCallback(
    (assignedTo) => {
      return assignedTo.map((user) => {
        const assignee = teamMembers.find((member) => member.id === user.id);
        return assignee
          ? `${assignee.name} ${assignee.last_name}`
          : "No asignado";
      });
    },
    [teamMembers],
  );

  const handleEditClick = useCallback((task) => {
    if (task.status === "done" && task.reviewed) return;
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  }, []);

  const toggleTaskExpansion = useCallback((taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }, []);

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      setColumns((prevColumns) => {
        const updatedColumns = prevColumns.map((column) => ({
          ...column,
          tasks: [...column.tasks],
        }));

        const sourceColumn = updatedColumns.find(
          (col) => col.id === source.droppableId,
        );
        const destColumn = updatedColumns.find(
          (col) => col.id === destination.droppableId,
        );

        const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
        destColumn.tasks.splice(destination.index, 0, movedTask);

        if (source.droppableId !== destination.droppableId) {
          movedTask.status = destColumn.id;
          onDragEnd(result);
        }

        return updatedColumns;
      });
    },
    [onDragEnd],
  );

  const handleEditTask = useCallback(
    (taskId, updatedTask) => {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task,
          ),
        }));
        return newColumns;
      });
      onEditTask(taskId, updatedTask);
      setIsEditDialogOpen(false);
    },
    [onEditTask],
  );

  const renderResources = useCallback((resources) => {
    if (!resources || resources.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {resources.map((resource, index) => (
          <TooltipProvider key={index}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-purple-700 hover:text-purple-900 flex items-center bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-full transition-all duration-200"
                >
                  {resource.type === "file" ? (
                    <Paperclip className="h-3 w-3 mr-1" />
                  ) : (
                    <Link className="h-3 w-3 mr-1" />
                  )}
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">
                    {resource.name}
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-purple-800 text-white p-2 text-xs sm:text-sm"
              >
                <p>
                  {resource.type === "file"
                    ? "Archivo adjunto"
                    : "Enlace externo"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }, []);

  return (
    <>
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-purple-900  pb-2 sm:pb-3 border-b border-purple-200">
        Sprint: {sprint.title}
      </h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <h4 className="font-semibold text-base sm:text-lg text-white bg-gradient-to-r from-purple-600 to-purple-800 p-2 sm:p-3 flex justify-between items-center">
                {column.title}
                <Badge
                  variant="outline"
                  className="bg-white text-purple-800 border-purple-300 text-xs sm:text-sm"
                >
                  {column.tasks.length}
                </Badge>
              </h4>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-2 sm:p-3 min-h-[200px] space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto ${snapshot.isDraggingOver ? "bg-purple-50" : ""}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                        isDragDisabled={task.status === "done" && task.reviewed}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${getTaskBorderColor(column.id)} border-l-4 ${snapshot.isDragging ? "shadow-lg" : ""} ${task.status === "done" && task.reviewed ? "bg-green-50 relative overflow-hidden" : ""}`}
                          >
                            {task.status === "done" && task.reviewed && (
                              <div className="absolute top-0 right-0 w-16 h-16">
                                <div className="absolute transform rotate-45 bg-green-500 text-white text-xs font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center">
                                  Revisada
                                </div>
                              </div>
                            )}
                            <CardContent className="p-2 sm:p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-sm sm:text-base text-purple-800 break-words w-5/6">
                                  {task.title}
                                </span>
                                {task.status === "done" && task.reviewed ? (
                                  <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                      <TooltipTrigger asChild>
                                        <span className="bg-green-500 rounded-full p-1 shadow-md">
                                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="left"
                                        className="bg-green-700 text-white p-2 text-xs sm:text-sm"
                                      >
                                        <p>Tarea completada y revisada</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleEditClick(task)}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => onDeleteTask(task.id)}
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        <span>Eliminar</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-700 mb-2 break-words">
                                {expandedTasks[task.id]
                                  ? task.description
                                  : task.description.slice(0, 100) +
                                    (task.description.length > 100
                                      ? "..."
                                      : "")}
                              </div>
                              {task.description.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskExpansion(task.id)}
                                  className="text-purple-600 hover:text-purple-800 p-0 h-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded text-xs"
                                >
                                  {expandedTasks[task.id] ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Menos
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      Más
                                    </>
                                  )}
                                </Button>
                              )}
                              {renderResources(task.resources)}
                            </CardContent>
                            <CardFooter className="px-2 sm:px-3 py-1 sm:py-2">
                              <div className="text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center mb-1">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="font-medium">
                                    Asignados:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {getAssigneeNames(task.assigned_to).map(
                                    (name, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800 px-1 sm:px-2 py-0.5 sm:py-1 text-xs"
                                      >
                                        {name}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            </CardFooter>
                          </Card>
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
        onEditTask={handleEditTask}
        teamMembers={teamMembers}
      />
    </>
  );
}
