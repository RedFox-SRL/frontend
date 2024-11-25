import React, { useEffect, useState } from "react";
import { getData } from "../api/apiService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function EvaluationModal({ onEvaluationSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [evaluations, setEvaluations] = useState([]);

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

    const handleCloseAttempt = () => {
        if (evaluations.length > 0) {
            setWarningOpen(true); // Advertir si hay evaluaciones pendientes
        } else {
            setIsOpen(false); // Permitir cerrar si no hay evaluaciones
        }
    };

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
            <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
                <DialogContent className="max-w-lg sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-purple-700">
                            Evaluaciones Activas
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {evaluations.length > 0 ? (
                            <ul className="space-y-4">
                                {evaluations.map((evaluation) => (
                                    <li
                                        key={evaluation.id}
                                        className="p-4 bg-purple-100 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"
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
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de advertencia */}
            <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
                <DialogContent className="max-w-md bg-gradient-to-br from-red-100 via-red-50 to-red-100 rounded-xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-700">
                            Atención Obligatoria
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-gray-700 text-sm mt-4">
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
                </DialogContent>
            </Dialog>
        </>
    );
}