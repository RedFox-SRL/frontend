import React from 'react';
import {Button} from "./ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {Plus, Calendar} from "lucide-react";

export default function SprintHeader({sprints, currentSprint, onSprintChange, onNewTaskClick}) {
    return (<div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 sm:p-6">
        <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tablero Kanban de Sprints</h2>
                {currentSprint && (<p className="text-purple-200 flex items-center">
                    <Calendar className="h-4 w-4 mr-2"/>
                    {currentSprint.start_date} - {currentSprint.end_date}
                </p>)}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Select
                    onValueChange={onSprintChange}
                    value={currentSprint?.id?.toString()}
                    disabled={sprints.length === 0}
                >
                    <SelectTrigger className="bg-white text-purple-800 border-purple-300 w-full sm:w-56">
                        <SelectValue placeholder="Seleccionar Sprint"/>
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map((sprint) => (<SelectItem key={sprint.id} value={sprint.id.toString()}>
                            {sprint.title}
                        </SelectItem>))}
                    </SelectContent>
                </Select>

                <Button
                    variant="secondary"
                    className="bg-purple-500 text-white hover:bg-purple-400 transition-colors duration-200 w-full sm:w-auto"
                    onClick={onNewTaskClick}
                    disabled={!currentSprint}
                >
                    <Plus className="h-5 w-5 mr-2"/>
                    <span>Nueva Tarea</span>
                </Button>
            </div>
        </div>
    </div>);
}