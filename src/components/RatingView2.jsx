import React, { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getData } from "../api/apiService"; // Suponiendo que getData es la función para hacer peticiones GET
import { ArrowLeft } from "lucide-react"; // Importar el ícono de Lucide React

const RatingView2 = ({ onBack, managementId }) => {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Toggle para abrir o cerrar detalles de un grupo
    const toggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    // Abrir el modal de detalles del estudiante
    const openModal = (student) => {
        setSelectedStudent(student);
    };

    // Cerrar el modal de detalles del estudiante
    const closeModal = () => {
        setSelectedStudent(null);
    };

    // Fetch de datos desde la API
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
            <Button
                variant="outline"
                className="mb-4 text-purple-600 hover:bg-purple-100 flex items-center space-x-2"
                onClick={onBack}
            >
                <ArrowLeft className="w-5 h-5 text-purple-600" /> {/* Flecha morada */}
                <span className="text-purple-600">Retroceder</span> {/* Texto morado */}
            </Button>

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
                            <div className="grid grid-cols-3 gap-4 mb-6">
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

                            {/* Lista de estudiantes */}
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
                                        <td className="py-2 font-bold">{student.final_score}</td>
                                        <td className="py-2">{student.sprint_final_score}</td>
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
                    )}
                </div>
            ))}

            {/* Modal de detalles del estudiante */}
            {selectedStudent && (
                <Dialog open={!!selectedStudent} onOpenChange={closeModal}>
                    <DialogContent className="bg-white p-6 rounded-lg max-w-lg mx-auto shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-purple-700 font-bold text-xl">
                                Detalles de {selectedStudent.name} {selectedStudent.last_name}
                            </h2>
                        </div>

                        {/* Información de calificaciones */}
                        <div className="mb-6">
                            <p><strong>Sprint Final:</strong> {selectedStudent.sprint_final_score}</p>
                            <p><strong>Propuesta:</strong> {selectedStudent.proposal_score}</p>
                            <p><strong>Evaluación Cruzada:</strong> {selectedStudent.cross_evaluation_score}</p>
                            <p className="font-bold text-lg mt-2">
                                Nota Final: {selectedStudent.final_score}
                            </p>
                        </div>

                        {/* Detalle de los sprints */}
                        <div>
                            <h3 className="text-purple-600 font-semibold mb-2">Detalle de Sprints</h3>
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b">
                                    <th className="py-2">Sprint</th>
                                    <th className="py-2">Docente</th>
                                    <th className="py-2">Autoevaluación</th>
                                    <th className="py-2">Evaluación Cruzada</th>
                                    <th className="py-2">Puntaje Final</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedStudent.sprints_detail.map((detail, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{detail.title}</td>
                                        <td className="py-2">{detail.teacher_grade}</td>
                                        <td className="py-2">{detail.self_evaluation_grade}</td>
                                        <td className="py-2">{detail.peer_evaluation_grade}</td>
                                        <td className="py-2">{detail.sprint_score}</td>
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

export default RatingView2;
