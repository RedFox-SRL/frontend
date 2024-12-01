import React, { useCallback, useState } from "react";
import { Link as LinkIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 1000;
const MAX_LINKS = 6;

export default function NewTaskDialog({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  addNewTask,
  teamMembers,
}) {
  const [errors, setErrors] = useState({});
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState({ url: "", description: "" });

  const validateUrl = (url) => {
    if (!url.trim()) return false;
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i",
    );
    return pattern.test(url);
  };

  const handleAddTask = () => {
    const validationErrors = {};
    if (!newTask.title?.trim())
      validationErrors.title = "El título es obligatorio";
    if (newTask.title?.length > TITLE_MAX_LENGTH)
      validationErrors.title = `El título no puede exceder ${TITLE_MAX_LENGTH} caracteres`;
    if (newTask.description?.length > DESCRIPTION_MAX_LENGTH)
      validationErrors.description = `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres`;
    if (!newTask.assigned_to || newTask.assigned_to.length === 0)
      validationErrors.assigned_to =
        "Debe asignar la tarea a al menos un miembro del equipo";

    newTask.links?.forEach((link, index) => {
      if (link.url && !validateUrl(link.url)) {
        validationErrors[`link_${index}`] = "URL inválida";
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure all properties are defined before adding the task
    const taskToAdd = {
      title: newTask.title || "",
      description: newTask.description || "",
      assigned_to: newTask.assigned_to || [],
      links: newTask.links || [],
    };

    addNewTask(taskToAdd);
    handleClose();
  };

  const handleAssigneeChange = useCallback(
    (memberId, isChecked) => {
      setNewTask((prev) => {
        const assigned_to = prev.assigned_to || [];
        if (isChecked) {
          return { ...prev, assigned_to: [...assigned_to, { id: memberId }] };
        } else {
          return {
            ...prev,
            assigned_to: assigned_to.filter((member) => member.id !== memberId),
          };
        }
      });
    },
    [setNewTask],
  );

  const handleAddLink = useCallback(() => {
    if (currentLink.url && validateUrl(currentLink.url)) {
      setNewTask((prev) => ({
        ...prev,
        links: [...(prev.links || []), currentLink],
      }));
      setCurrentLink({ url: "", description: "" });
      setIsLinkDialogOpen(false);
      setErrors((prev) => ({ ...prev, link: undefined }));
    } else {
      setErrors((prev) => ({
        ...prev,
        link: "La URL es inválida o está vacía",
      }));
    }
  }, [currentLink, setNewTask]);

  const removeLink = useCallback(
    (index) => {
      setNewTask((prev) => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index),
      }));
    },
    [setNewTask],
  );

  const handleClose = () => {
    setNewTask({ title: "", description: "", assigned_to: [], links: [] });
    setErrors({});
    setIsLinkDialogOpen(false);
    setCurrentLink({ url: "", description: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-0 overflow-hidden bg-white dark:bg-gray-800">
        <DialogHeader className="p-4 sm:p-6 pb-2 bg-purple-100 dark:bg-purple-900 sticky top-0 z-10">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-100">
            Agregar Nueva Tarea
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)] px-4 sm:px-6 py-4">
          <div className="space-y-1">
            <InputField
              id="taskTitle"
              label="Título"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              error={errors.title}
              maxLength={TITLE_MAX_LENGTH}
              placeholder="Ingrese el título de la tarea"
            />
            <TextareaField
              id="taskDescription"
              label="Descripción"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={errors.description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Ingrese la descripción de la tarea"
            />
            <AssigneeSection
              teamMembers={teamMembers}
              assignedTo={newTask.assigned_to}
              onChange={handleAssigneeChange}
              error={errors.assigned_to}
            />
            <LinksSection
              links={newTask.links}
              onAddLink={() => setIsLinkDialogOpen(true)}
              onRemoveLink={removeLink}
              maxLinks={MAX_LINKS}
            />
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 sm:p-6 pt-2 bg-purple-50 dark:bg-purple-900 sticky bottom-0 z-10">
          <div className="flex flex-col sm:flex-row w-full sm:justify-end gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddTask}
              className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" /> Agregar Tarea
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        currentLink={currentLink}
        setCurrentLink={setCurrentLink}
        onAddLink={handleAddLink}
        error={errors.link}
      />
    </Dialog>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-purple-700 dark:text-purple-300 block mb-1"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        className={`${
          error ? "border-red-500" : "border-purple-300"
        } focus:ring-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-offset-2 text-sm rounded-md transition-all duration-200`}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      <div className="flex justify-between items-center text-xs">
        <p className="text-red-500">{error}</p>
        {maxLength && (
          <p className="text-purple-600 dark:text-purple-400">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-purple-700 dark:text-purple-300 block mb-1"
      >
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        className={`${
          error ? "border-red-500" : "border-purple-300"
        } focus:ring-purple-500 focus:border-purple-500 text-sm rounded-md`}
        rows={4}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      <div className="flex justify-between items-center text-xs">
        <p className="text-red-500">{error}</p>
        {maxLength && (
          <p className="text-purple-600 dark:text-purple-400">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

function AssigneeSection({ teamMembers, assignedTo, onChange, error }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-purple-700 dark:text-purple-300 block mb-1">
        Asignar a
      </Label>
      <div className="flex flex-wrap gap-2">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className={`flex items-center space-x-2 bg-purple-50 dark:bg-purple-900 p-2 rounded-md transition-all duration-200 ${
              assignedTo?.some((assignee) => assignee.id === member.id)
                ? "border-2 border-purple-500"
                : "border border-purple-200 dark:border-purple-700"
            }`}
          >
            <Checkbox
              id={`member-${member.id}`}
              checked={assignedTo?.some(
                (assignee) => assignee.id === member.id,
              )}
              onCheckedChange={(checked) => onChange(member.id, checked)}
              className="border-purple-400 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
            />
            <Label
              htmlFor={`member-${member.id}`}
              className="text-sm text-purple-700 dark:text-purple-300"
            >
              {member.name} {member.last_name}
            </Label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function LinksSection({ links, onAddLink, onRemoveLink, maxLinks }) {
  const MAX_LINK_LENGTH = 30; // Longitud máxima para mostrar

  const truncateLink = (url) => {
    if (url.length > MAX_LINK_LENGTH) {
      return `${url.slice(0, MAX_LINK_LENGTH)}...`;
    }
    return url;
  };

  return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-purple-700 dark:text-purple-300 block mb-1">
          Enlaces ({links?.length || 0}/{maxLinks})
        </Label>
        <div className="space-y-2">
          <AnimatePresence>
            {links &&
                links.map((link, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                      <Badge
                          variant="secondary"
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 flex items-center max-w-full"
                      >
                        <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate flex-grow" title={link.url}>
                    {truncateLink(link.url)}
                  </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 p-0 h-auto text-purple-800 hover:text-purple-900 dark:text-purple-100 dark:hover:text-purple-200 flex-shrink-0"
                            onClick={() => onRemoveLink(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </motion.div>
                ))}
          </AnimatePresence>
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={onAddLink}
            className="w-full mt-2 text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-300 dark:hover:bg-purple-900"
            disabled={links && links.length >= maxLinks}
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar enlace
        </Button>
      </div>
  );
}

function LinkDialog({
  isOpen,
  onClose,
  currentLink,
  setCurrentLink,
  onAddLink,
  error,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] w-[95vw] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-purple-800 dark:text-purple-100">
            Agregar Enlace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <InputField
            id="linkUrl"
            label="URL"
            value={currentLink.url}
            onChange={(e) =>
              setCurrentLink((prev) => ({ ...prev, url: e.target.value }))
            }
            error={error}
            placeholder="https://ejemplo.com"
          />
          <InputField
            id="linkDescription"
            label="Descripción (opcional)"
            value={currentLink.description}
            onChange={(e) =>
              setCurrentLink((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Descripción del enlace"
          />
        </div>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row w-full sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:border-purple-300 dark:hover:bg-purple-900"
            >
              Cancelar
            </Button>
            <Button
              onClick={onAddLink}
              className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              Agregar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
