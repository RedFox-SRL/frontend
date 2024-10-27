import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 200;

export default function TaskEditDialog({
  isOpen,
  onClose,
  task,
  onEditTask,
  teamMembers,
}) {
  const [editedTask, setEditedTask] = useState(task);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleEditTask = () => {
    const validationErrors = {};
    if (editedTask.title.length === 0)
      validationErrors.title = "El título es obligatorio";
    if (editedTask.title.length > TITLE_MAX_LENGTH)
      validationErrors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
    if (editedTask.description.length > DESCRIPTION_MAX_LENGTH)
      validationErrors.description = `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres`;
    if (editedTask.assigned_to.length === 0)
      validationErrors.assigned_to =
        "Debe asignar la tarea a al menos un miembro del equipo";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onEditTask(editedTask.id, editedTask);
    onClose();
    setErrors({});
  };

  const handleAssigneeChange = (value) => {
    const assigned_to = editedTask.assigned_to || [];
    if (!assigned_to.some((user) => user.id === parseInt(value))) {
      setEditedTask({
        ...editedTask,
        assigned_to: [...assigned_to, { id: parseInt(value) }],
      });
    }
  };

  const removeAssignee = (assigneeId) => {
    setEditedTask({
      ...editedTask,
      assigned_to: editedTask.assigned_to.filter(
        (user) => user.id !== assigneeId,
      ),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-purple-600">Editar Tarea</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskTitle" className="text-right">
              Título
            </Label>
            <Input
              id="taskTitle"
              value={editedTask?.title || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className={`col-span-3 ${errors.title ? "border-red-500" : ""}`}
              maxLength={TITLE_MAX_LENGTH}
            />
            {errors.title && (
              <p className="text-red-500 text-sm col-start-2 col-span-3">
                {errors.title}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="taskDescription" className="text-right pt-2">
              Descripción
            </Label>
            <div className="col-span-3">
              <textarea
                id="taskDescription"
                value={editedTask?.description || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                className={`w-full px-3 py-2 text-sm rounded-md border ${errors.description ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                rows={4}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskAssignee" className="text-right">
              Asignar a
            </Label>
            <div className="col-span-3">
              <Select onValueChange={handleAssigneeChange}>
                <SelectTrigger
                  className={`w-full ${errors.assigned_to ? "border-red-500" : ""}`}
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.assigned_to}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {editedTask?.assigned_to &&
                  editedTask.assigned_to.map((user) => {
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
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleEditTask}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
