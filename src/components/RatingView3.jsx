import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getData } from "../api/apiService";
import { ArrowLeft } from "lucide-react";

const RatingView3 = ({ onBack, managementId }) => {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    const openModal = (student) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    useEffect(() => {
        const fetchGradeSummary = async () => {
            try {
                const response = await getData(`/grade-summary/${managementId}`);
                if (response.success) {
                    setGroups(response.data.groups);
                }
            } catch (error) {
                console.error("Error fetching grade summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGradeSummary();
    }, [managementId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-purple-50 min-h-screen p-6">
            {/* Botón de Retroceder con la flecha de Lucide React */}
            <h1 className="text-purple-700 font-bold text-2xl mb-6">Resumen de Calificaciones</h1>

            {groups.map((group) => (
                <div key={group.group_id} className="bg-purple-100 rounded-lg shadow-md mb-6 overflow-hidden">
                    <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => toggleGroup(group.group_id)}>
                        <h2 className="text-purple-700 font-bold">{group.group_name}</h2>
                        <span className="text-purple-500">{group.students.length} estudiantes</span>
                    </div>
                    {expandedGroup === group.group_id && (
                        <div className="p-4 bg-white">
                            {/* Información del grupo */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Sprints</h3>
                                    <p className="text-purple-800 font-bold">{group.group_scores.sprints}</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Propuestas</h3>
                                    <p className="text-purple-800 font-bold">{group.group_scores.proposal}</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-purple-600 font-semibold">Evaluación Cruzada</h3>
                                    <p className="text-purple-800 font-bold">{group.group_scores.cross_evaluation}</p>
                                </div>
                            </div>

                            {/* Configuración de puntuaciones */}
                            <div className="mb-6">
                                <h3 className="text-purple-600 font-semibold">Configuración de Puntajes</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="font-semibold">Sprints</p>
                                        <p className="text-purple-800">{group.score_configuration.sprints}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">Propuestas</p>
                                        <p className="text-purple-800">{group.score_configuration.proposal}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">Evaluación Cruzada</p>
                                        <p className="text-purple-800">{group.score_configuration.cross_evaluation}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de estudiantes */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Estudiante</th>
                                        <th className="py-2">Nota Final</th>
                                        <th className="py-2">Sprints</th>
                                        <th className="py-2">Propuesta</th>
                                        <th className="py-2">Evaluación Cruzada</th>
                                        <th className="py-2">Detalles</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {group.students.map((student) => (
                                        <tr key={student.student_id} className="border-b">
                                            <td className="py-2">{student.name} {student.last_name}</td>
                                            <td className="py-2 font-bold">{student.final_score}%</td>
                                            <td className="py-2">{student.sprint_final_score}%</td>
                                            <td className="py-2">{student.proposal_score}</td>
                                            <td className="py-2">{student.cross_evaluation_score}</td>
                                            <td className="py-2">
                                                <button onClick={() => openModal(student)} className="text-purple-500 hover:underline">
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Modal de detalles del estudiante */}
            {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={closeModal}>
                    <DialogContent className="bg-white p-4 sm:p-6 rounded-lg max-w-full sm:max-w-3xl mx-auto shadow-lg max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-purple-700 font-bold text-lg sm:text-xl">
                                Detalles de {selectedStudent.name} {selectedStudent.last_name}
                            </h2>
                        </div>

                        <div className="mb-6">
                            <p><strong>Sprint Final:</strong> {selectedStudent.sprint_final_score}</p>
                            <p><strong>Propuesta:</strong> {selectedStudent.proposal_score}</p>
                            <p><strong>Evaluación Cruzada:</strong> {selectedStudent.cross_evaluation_score}</p>
                            <p className="font-bold text-lg mt-2">
                                Nota Final: {selectedStudent.final_score}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-purple-600 font-semibold mb-2">Detalle de Sprints</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="py-2 px-4">Sprint</th>
                                        <th className="py-2 px-4">Docente</th>
                                        <th className="py-2 px-4">Autoevaluación</th>
                                        <th className="py-2 px-4">Cruzada</th>
                                        <th className="py-2 px-4">Final</th>
                                        <th className="py-2 px-4">Porcentaje</th>
                                        <th className="py-2 px-4">Autoeval %</th>
                                        <th className="py-2 px-4">Puntaje Ponderado</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedStudent.sprints_detail.map((detail, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 px-4">{detail.title}</td>
                                            <td className="py-2 px-4">{detail.teacher_grade}</td>
                                            <td className="py-2 px-4">{detail.self_evaluation_grade}</td>
                                            <td className="py-2 px-4">{detail.peer_evaluation_grade}</td>
                                            <td className="py-2 px-4">{detail.sprint_score}</td>
                                            <td className="py-2 px-4">{detail.percentage}</td>
                                            <td className="py-2 px-4">{detail.self_evaluation_percentage}</td>
                                            <td className="py-2 px-4">{detail.weighted_score}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default RatingView3;