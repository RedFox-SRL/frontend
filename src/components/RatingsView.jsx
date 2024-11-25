import React, { useState } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RatingsView = ({ onBack }) => {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filter, setFilter] = useState("Todos los Grupos");

    const toggleGroup = (group) => {
        setExpandedGroup(expandedGroup === group ? null : group);
    };

    const openModal = (student) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    const groups = [
        {
            name: "Grupo A",
            metrics: {
                sprints: "47.5/60",
                proposals: "27.0/30",
                peerEvaluation: "8.0/10",
            },
            students: [
                {
                    name: "Juan Pérez",
                    sprints: "45/60",
                    proposals: "27/30",
                    peerEvaluation: "8/10",
                    finalGrade: "80/100",
                    sprintDetails: [
                        { sprint: "Sprint 1", teacher: "39/70", auto: "12/15", peers: "9/15", total: "60/100" },
                        { sprint: "Sprint 2", teacher: "65/70", auto: "13/15", peers: "7/15", total: "85/100" },
                        { sprint: "Sprint 3", teacher: "8/70", auto: "0/15", peers: "12/15", total: "20/100" },
                    ],
                },
                {
                    name: "Ana García",
                    sprints: "50/60",
                    proposals: "27/30",
                    peerEvaluation: "8/10",
                    finalGrade: "85/100",
                    sprintDetails: [],
                },
            ],
        },
        {
            name: "Grupo B",
            metrics: {
                sprints: "50.0/60",
                proposals: "28.0/30",
                peerEvaluation: "9.0/10",
            },
            students: [
                {
                    name: "Carlos López",
                    sprints: "50/60",
                    proposals: "28/30",
                    peerEvaluation: "9/10",
                    finalGrade: "90/100",
                    sprintDetails: [],
                },
                {
                    name: "María Fernández",
                    sprints: "55/60",
                    proposals: "28/30",
                    peerEvaluation: "9/10",
                    finalGrade: "92/100",
                    sprintDetails: [],
                },
            ],
        },
    ];

    const filteredGroups =
        filter === "Todos los Grupos"
            ? groups
            : groups.filter((group) => group.name === filter);

    return (
        <div className="bg-purple-50 min-h-screen p-6">
            <Button
                variant="outline"
                className="mb-4"
                onClick={onBack}
            >
                ← Volver
            </Button>
            <h1 className="text-purple-700 font-bold text-2xl mb-6">
                Resumen de Calificaciones
            </h1>
            <div className="mb-4">
                <select
                    className="border border-purple-300 rounded-md px-4 py-2"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option>Todos los Grupos</option>
                    {groups.map((group, index) => (
                        <option key={index}>{group.name}</option>
                    ))}
                </select>
            </div>
            {filteredGroups.map((group, index) => (
                <div
                    key={index}
                    className="bg-purple-100 rounded-lg shadow-md mb-4 overflow-hidden"
                >
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() => toggleGroup(group.name)}
                    >
                        <h2 className="text-purple-700 font-bold">{group.name}</h2>
                        <span className="text-purple-500">{group.students.length} estudiantes</span>
                    </div>
                    {expandedGroup === group.name && (
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Sprints</h3>
                                    <p className="text-purple-800 font-bold">{group.metrics.sprints}</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Propuestas</h3>
                                    <p className="text-purple-800 font-bold">{group.metrics.proposals}</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Evaluación Cruzada</h3>
                                    <p className="text-purple-800 font-bold">{group.metrics.peerEvaluation}</p>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b">
                                    <th className="py-2">Estudiante</th>
                                    <th className="py-2">Sprints (60%)</th>
                                    <th className="py-2">Nota Final</th>
                                    <th className="py-2">Detalles</th>
                                </tr>
                                </thead>
                                <tbody>
                                {group.students.map((student, studentIndex) => (
                                    <tr key={studentIndex} className="border-b">
                                        <td className="py-2">{student.name}</td>
                                        <td className="py-2">{student.sprints}</td>
                                        <td className="py-2 font-bold">{student.finalGrade}</td>
                                        <td className="py-2">
                                            <button
                                                onClick={() => openModal(student)}
                                                className="text-purple-500 hover:underline"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}

            {/* Modal */}
            {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={closeModal}>
                    <DialogContent className="bg-white p-6 rounded-lg max-w-lg mx-auto shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-purple-700 font-bold text-xl">
                                Detalles de {selectedStudent.name} - {expandedGroup}
                            </h2>
                            <DialogClose asChild>
                                <button className="text-purple-500 hover:text-purple-700">
                                    ✖
                                </button>
                            </DialogClose>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-purple-600 font-semibold mb-2">Resumen de Calificaciones</h3>
                            <p><strong>Sprints:</strong> {selectedStudent.sprints}</p>
                            <p><strong>Propuestas:</strong> {selectedStudent.proposals}</p>
                            <p><strong>Evaluación Cruzada:</strong> {selectedStudent.peerEvaluation}</p>
                            <p className="font-bold text-lg mt-2">
                                Nota Final: {selectedStudent.finalGrade}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-purple-600 font-semibold mb-2">Detalle de Sprints</h3>
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b">
                                    <th className="py-2">Sprint</th>
                                    <th className="py-2">Docente (70%)</th>
                                    <th className="py-2">Auto (15%)</th>
                                    <th className="py-2">Pares (15%)</th>
                                    <th className="py-2">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedStudent.sprintDetails.map((detail, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{detail.sprint}</td>
                                        <td className="py-2">{detail.teacher}</td>
                                        <td className="py-2">{detail.auto}</td>
                                        <td className="py-2">{detail.peers}</td>
                                        <td className="py-2">{detail.total}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default RatingsView;