import React, { useEffect, useState } from "react";
import { getData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CrossEvaluationForm from "./CrossEvaluationForm";

export default function CrossEvaluationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [evaluationData, setEvaluationData] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const fetchCrossEvaluation = async () => {
        setIsFetching(true);
        try {
            const response = await getData("/cross-evaluation");

            if (response?.success && response?.data) {
                setEvaluationData(response.data);
                setIsOpen(true); // Muestra el modal si hay una evaluación cruzada activa
            } else {
                setEvaluationData(null);
                setIsOpen(false); // Cierra el modal si no hay evaluación cruzada activa
            }
        } catch (error) {
            console.error("Error al obtener evaluación cruzada:", error);
            setEvaluationData(null);
            setIsOpen(false); // Cierra el modal en caso de error
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchCrossEvaluation();
    }, []);

    const handleSubmit = async () => {
        await fetchCrossEvaluation(); // Recarga los datos tras el envío
    };

    if (!isOpen) {
        // No muestra nada si no hay evaluación activa
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <Card className="max-w-5xl w-full bg-white shadow-lg rounded-lg overflow-auto h-[90%]">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-2xl font-bold text-purple-700">
                        Evaluación Cruzada
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isFetching ? (
                        <p className="text-center text-gray-500">Cargando...</p>
                    ) : (
                        <CrossEvaluationForm
                            evaluationData={evaluationData}
                            onSubmit={handleSubmit}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
