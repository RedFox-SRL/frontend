import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function NewSprintDialog({ isOpen, onClose, newSprint, setNewSprint, addNewSprint }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                            onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Fecha Inicio</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={newSprint.startDate}
                            onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">Fecha Fin</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={newSprint.endDate}
                            onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <Button onClick={addNewSprint} className="bg-purple-600 text-white hover:bg-purple-700">Crear Sprint</Button>
            </DialogContent>
        </Dialog>
    );
}