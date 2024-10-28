import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;

export default function NewTaskDialog({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  addNewTask,
  teamMembers,
}) {
  const [errors, setErrors] = useState({});

  const handleAddTask = () => {
    const validationErrors = {};
    if (newTask.title?.length === 0)
      validationErrors.title = "El título es obligatorio";
    if (newTask.title?.length > TITLE_MAX_LENGTH)
      validationErrors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
    if (newTask.description?.length > DESCRIPTION_MAX_LENGTH)
      validationErrors.description = `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres`;
    if (!newTask.assigned_to || newTask.assigned_to.length === 0)
      validationErrors.assigned_to =
        "Debe asignar la tarea a al menos un miembro del equipo";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    addNewTask();
    setErrors({});
  };

  const handleAssigneeChange = (value) => {
    const assigned_to = newTask.assigned_to || [];
    if (!assigned_to.some((user) => user.id === parseInt(value))) {
      setNewTask({
        ...newTask,
        assigned_to: [...assigned_to, { id: parseInt(value) }],
      });
    }
  };

  const removeAssignee = (assigneeId) => {
    setNewTask({
      ...newTask,
      assigned_to: newTask.assigned_to.filter((user) => user.id !== assigneeId),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-purple-800">
            Agregar Nueva Tarea
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="taskTitle"
              className="text-sm font-medium text-gray-700"
            >
              Título
            </Label>
            <Input
              id="taskTitle"
              value={newTask.title || ""}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className={`${errors.title ? "border-red-500" : "border-gray-300"} focus:ring-purple-500 focus:border-purple-500`}
              maxLength={TITLE_MAX_LENGTH}
              placeholder="Ingrese el título de la tarea"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-sm text-gray-500 text-right">
              {newTask.title?.length || 0}/{TITLE_MAX_LENGTH}
            </p>
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="taskDescription"
              className="text-sm font-medium text-gray-700"
            >
              Descripción
            </Label>
            <Textarea
              id="taskDescription"
              value={newTask.description || ""}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className={`${errors.description ? "border-red-500" : "border-gray-300"} focus:ring-purple-500 focus:border-purple-500`}
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Ingrese la descripción de la tarea"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500 text-right">
              {newTask.description?.length || 0}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="taskAssignee"
              className="text-sm font-medium text-gray-700"
            >
              Asignar a
            </Label>
            <Select onValueChange={handleAssigneeChange}>
              <SelectTrigger
                className={`${errors.assigned_to ? "border-red-500" : "border-gray-300"} focus:ring-purple-500 focus:border-purple-500`}
              >
                <SelectValue placeholder="Seleccionar miembro" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} {member.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigned_to && (
              <p className="text-red-500 text-sm mt-1">{errors.assigned_to}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {newTask.assigned_to &&
                newTask.assigned_to.map((user) => {
                  const assignee = teamMembers.find(
                    (member) => member.id === user.id,
                  );
                  return (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="px-2 py-1"
                    >
                      {assignee
                        ? `${assignee.name} ${assignee.last_name}`
                        : "Unknown"}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-auto"
                        onClick={() => removeAssignee(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="mr-2">
            Cancelar
          </Button>
          <Button
            onClick={handleAddTask}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Agregar Tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
