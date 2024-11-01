import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ParticipantList({ participants, getInitials }) {
    return (
        <Card className="border border-purple-300">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-purple-700">
                    Participantes del Curso
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px]">
                    <div className="space-y-4">
                        {participants.teacher && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-purple-600 mb-2">Profesor</h3>
                                <div className="flex items-center space-x-4">
                                    <Avatar className="bg-purple-200">
                                        <AvatarFallback className="text-purple-700 bg-purple-200">
                                            {getInitials(
                                                participants.teacher.name,
                                                participants.teacher.last_name,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-purple-800">{`${participants.teacher.name} ${participants.teacher.last_name}`}</p>
                                        <p className="text-sm text-purple-500">
                                            {participants.teacher.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {participants.students && participants.students.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-purple-600 mb-2">Estudiantes</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {participants.students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center space-x-4"
                                        >
                                            <Avatar className="bg-purple-300">
                                                <AvatarFallback className="text-purple-800 bg-purple-300">
                                                    {getInitials(student.name, student.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-purple-800">{`${student.name} ${student.last_name}`}</p>
                                                <p className="text-sm text-purple-500">{student.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
