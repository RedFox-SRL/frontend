import React from 'react';
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Plus} from "lucide-react";

export default function SprintHeader({sprints, currentSprint, onSprintChange, onNewTaskClick}) {
    return (<div className="bg-purple-600 p-4 sm:p-6">
        <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Tablero Kanban de Sprints</h2>
            <div className="flex flex-wrap gap-2">
                <Select onValueChange={onSprintChange}>
                    <SelectTrigger className="bg-white text-purple-600 border-purple-300 w-full sm:w-auto">
                        <SelectValue placeholder="Seleccionar Sprint"/>
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id.toString()}>{sprint.title}</SelectItem>))}
                    </SelectContent>
                </Select>

                <Button variant="secondary" className="bg-purple-500 text-white hover:bg-purple-400"
                        onClick={onNewTaskClick} disabled={!currentSprint}>
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                    <span>Nueva Tarea</span>
                </Button>
            </div>
        </div>
    </div>);
}