import React, { useState } from "react";
import { postData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function EvaluationForm({ evaluationData, onBack }) {
    const [responses, setResponses] = useState({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const sections = evaluationData.evaluation_period.evaluation_template.sections;

    const handleInputChange = (criteriaId, value) => {
        setResponses((prev) => ({
            ...prev,
            [criteriaId]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const allCriteria = sections.flatMap((section) =>
                section.criteria.map((c) => c.id)
            );
            const allAnswered = allCriteria.every(
                (id) => responses[id] !== undefined
            );

            if (!allAnswered) {
                toast({
                    title: "Error",
                    description: "Por favor, completa todos los criterios antes de enviar.",
                    variant: "destructive",
                });
                return;
            }

            await postData(`/evaluations/${evaluationData.id}/submit`, {
                responses,
            });

            toast({
                title: "Éxito",
                description: "Evaluación enviada correctamente.",
            });

            setIsDialogOpen(false); // Cerrar el dialog
            onBack(); // Volver a la vista anterior
        } catch (error) {
            console.error("Error al enviar evaluación:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error al enviar la evaluación. Inténtalo de nuevo.",
                variant: "destructive",
            });
        }
    };

    const confirmSubmit = () => {
        setIsDialogOpen(true); // Abrir el diálogo de confirmación
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="text-purple-700 hover:text-purple-900 focus:outline-none"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="ml-4 text-2xl font-bold text-purple-800">
                    {evaluationData.evaluation_period.evaluation_template.name}
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        className="p-4 bg-white bg-opacity-50 rounded-lg shadow space-y-6"
                    >
                        <h3 className="text-lg font-semibold text-purple-600">
                            {section.title}
                        </h3>
                        {section.criteria.map((criterion) => (
                            <div key={criterion.id} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {criterion.name}
                                </label>
                                <p className="text-xs text-gray-500">
                                    {criterion.description}
                                </p>
                                <div className="flex justify-between">
                                    {[0, 1, 2, 3, 4, 5].map((value) => (
                                        <label
                                            key={value}
                                            className="flex flex-col items-center cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name={`criterion-${criterion.id}`}
                                                value={value}
                                                className="hidden"
                                                onChange={() => handleInputChange(criterion.id, value)}
                                            />
                                            <span
                                                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                                                    responses[criterion.id] === value
                                                        ? "bg-purple-700 text-white border-purple-700"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                {value}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={confirmSubmit}
                    className="flex items-center bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg shadow-md"
                >
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Evaluación
                </Button>
            </div>

            {/* Dialogo de confirmación */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-purple-700">
                            Confirmar Envío
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        ¿Estás seguro de que deseas enviar esta evaluación? Una vez enviada, no se
                        podrá modificar.
                    </p>
                    <DialogFooter className="mt-4 flex justify-end">
                        <Button
                            onClick={() => setIsDialogOpen(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="ml-3 flex items-center bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}