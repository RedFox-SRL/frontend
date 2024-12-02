import React, { useEffect, useState } from "react";
import { getData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import EvaluationForm from "./EvaluationForm";

export default function EvaluationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [evaluations, setEvaluations] = useState([]);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);

    const fetchEvaluations = async () => {
        try {
            const response = await getData("/evaluations/active");
            const activeEvaluations = response?.data?.evaluations?.evaluations?.active || [];
            setEvaluations(activeEvaluations);
            setIsOpen(activeEvaluations.length > 0);
        } catch (error) {
            console.error("Error al obtener evaluaciones activas:", error);
        }
    };

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const handleEvaluationSubmit = () => {
        fetchEvaluations(); // Recarga las evaluaciones activas
        setSelectedEvaluation(null); // Regresa al listado
    };
    const getEvaluationTypeLabel = (type) => {
        const types = {
            self: "Autoevaluación",
            peer: "Evaluación de pares",
            cross: "Evaluación cruzada",
            final: "Evaluación final",
        };
        return types[type] || "Desconocido";
    };


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    {!selectedEvaluation ? (
                        <Card className="max-w-lg sm:max-w-xl w-full bg-white shadow-lg rounded-lg">
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
                                                    onClick={() => setSelectedEvaluation(evaluation)}
                                                    className="mt-4 sm:mt-0 bg-purple-700 hover:bg-purple-800 text-white"
                                                >
                                                    Realizar Evaluación
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500">
                                        No hay evaluaciones activas.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-auto h-[90%] p-0">
                            <CardHeader className="p-4 border-b">
                                <CardTitle className="text-2xl font-bold text-purple-700">
                                    Realizar Evaluación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <EvaluationForm
                                    evaluationData={selectedEvaluation}
                                    onBack={() => setSelectedEvaluation(null)}
                                    onSubmit={handleEvaluationSubmit}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </>
    );
}
