import React, { useEffect, useState, useRef } from "react";
import { getData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function EvaluationModal({ onEvaluationSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [evaluations, setEvaluations] = useState([]);
    const cardRef = useRef(null);

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                const response = await getData("/evaluations/active");
                const activeEvaluations =
                    response?.data?.evaluations?.evaluations?.active || [];
                setEvaluations(activeEvaluations);
                setIsOpen(activeEvaluations.length > 0); // Solo abrir si hay evaluaciones
            } catch (error) {
                console.error("Error al obtener evaluaciones activas:", error);
            }
        };
        fetchEvaluations();
    }, []);

    const handleClickOutside = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
            setWarningOpen(true); // Mostrar advertencia si se hace clic fuera del card
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const getEvaluationTypeLabel = (type) => {
        const types = {
            self: "Autoevaluación",
            peer: "Evaluación de pares",
            cross: "Evaluación Cruzada",
            final: "Evaluación final",
        };
        return types[type] || "Desconocido";
    };

    return (
        <>
            {/* Modal principal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <Card ref={cardRef} className="max-w-lg sm:max-w-xl w-full bg-white shadow-lg rounded-lg">
                        <CardHeader className="p-6 border-b">
                            <CardTitle className="text-2xl font-bold text-purple-700">
                                Evaluaciones Activas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-6">
                            {evaluations.length > 0 ? (
                                <ul className="space-y-4">
                                    {evaluations.map((evaluation) => (
                                        <li
                                            key={evaluation.id}
                                            className="p-4 bg-purple-50 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"
                                        >
                                            <div>
                                                <strong className="block text-lg font-semibold text-purple-900">
                                                    {evaluation.evaluation_period.evaluation_template.name}
                                                </strong>
                                                <p className="text-sm text-purple-700">
                                                    Tipo: {getEvaluationTypeLabel(evaluation.evaluation_period.type)}
                                                </p>
                                                <div className="flex items-center text-sm text-purple-600 mt-2">
                                                    <Calendar className="mr-2 h-5 w-5 text-purple-700" />
                                                    {new Date(evaluation.evaluation_period.starts_at).toLocaleDateString()}{" "}
                                                    -{" "}
                                                    {new Date(evaluation.evaluation_period.ends_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => onEvaluationSelect(evaluation)}
                                                className="mt-4 sm:mt-0 bg-purple-700 hover:bg-purple-800 text-white"
                                            >
                                                Realizar Evaluación
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500">No hay evaluaciones activas.</p>
                            )}
                            <p className="text-sm text-red-600 font-semibold text-center mt-4">
                                Realizar las evaluaciones es obligatorio.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de advertencia */}
            {warningOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <Card className="max-w-md w-full bg-red-50 shadow-lg rounded-lg">
                        <CardHeader className="p-6 border-b">
                            <CardTitle className="text-xl font-bold text-red-700">
                                Atención Obligatoria
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-gray-700 text-sm">
                                <p>
                                    <span className="text-red-700 font-semibold">
                                        Realizar las evaluaciones pendientes es obligatorio.
                                    </span>{" "}
                                    No podrás continuar utilizando la página hasta que completes todas.
                                </p>
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button
                                    onClick={() => setWarningOpen(false)}
                                    className="bg-purple-700 hover:bg-purple-800 text-white"
                                >
                                    Entendido
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
