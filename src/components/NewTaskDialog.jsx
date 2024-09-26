import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function NewTaskDialog({ isOpen, onClose, newTask, setNewTask, addNewTask, teamMembers }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskDescription" className="text-right">Descripción</Label>
                        <Input
                            id="taskDescription"
                            value={newTask.description || ''}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taskAssignee" className="text-right">Asignar a</Label>
                        <Select onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                            <SelectTrigger className="col-span-3">
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
                    </div>
                </div>
                <Button onClick={addNewTask} className="bg-purple-600 text-white hover:bg-purple-700">Agregar Tarea</Button>
            </DialogContent>
        </Dialog>
    );
}