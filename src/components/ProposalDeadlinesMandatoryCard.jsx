import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { postData } from "../api/apiService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ProposalDeadlinesMandatoryCard({ managementId, onSuccess }) {
    const { toast } = useToast();
    const [partADeadline, setPartADeadline] = useState("");
    const [partBDeadline, setPartBDeadline] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpenA, setIsCalendarOpenA] = useState(false);
    const [isCalendarOpenB, setIsCalendarOpenB] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await postData(`/management/${managementId}/proposal-deadlines`, {
                proposal_part_a_deadline: partADeadline,
                proposal_part_b_deadline: partBDeadline,
                _method: "PUT",
            });
            toast({
                title: "Éxito",
                description: "Fechas de las propuestas actualizadas correctamente.",
                className: "bg-green-500 text-white",
            });
            onSuccess();
        } catch (error) {
            console.error("Error al actualizar las fechas:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar las fechas. Inténtalo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChangeA = (event) => {
        setPartADeadline(event.target.value);
        setIsCalendarOpenA(false); // Cierra el calendario al seleccionar una fecha
    };

    const handleDateChangeB = (event) => {
        setPartBDeadline(event.target.value);
        setIsCalendarOpenB(false); // Cierra el calendario al seleccionar una fecha
    };

    return (
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-purple-700">
                        Configurar Fechas de Propuestas
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600 text-center mb-4">
                    Antes de continuar, es obligatorio establecer las fechas límite para las partes A y B de la propuesta.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha límite Parte A</label>
                        <input
                            type="datetime-local"
                            value={partADeadline}
                            onChange={handleDateChangeA}
                            onFocus={() => setIsCalendarOpenA(true)}
                            onBlur={() => setIsCalendarOpenA(false)} // Asegura que se cierre al hacer clic fuera
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha límite Parte B</label>
                        <input
                            type="datetime-local"
                            value={partBDeadline}
                            onChange={handleDateChangeB}
                            onFocus={() => setIsCalendarOpenB(true)}
                            onBlur={() => setIsCalendarOpenB(false)} // Asegura que se cierre al hacer clic fuera
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end mt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!partADeadline || !partBDeadline || isSubmitting}
                        className={`px-6 py-3 rounded-lg shadow-md ${
                            partADeadline && partBDeadline
                                ? "bg-purple-700 hover:bg-purple-800 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
