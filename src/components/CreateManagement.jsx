import React, { useState, useEffect } from "react";
import { postData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function CreateManagement({ onManagementCreated, onCancel }) {
    const [newManagement, setNewManagement] = useState({
        semester: "",
        year: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // Maneja tanto errores como éxito
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        setNewManagement({
            semester: currentMonth <= 6 ? "first" : "second",
            year: currentYear.toString(),
        });
    }, []);

    const handleCreateManagement = async () => {
        setIsLoading(true);
        setMessage(null); // Limpia mensajes previos

        try {
            const response = await postData("/managements", newManagement);
            if (response?.success) {
                setMessage({
                    type: "success",
                    text: `Gestión creada exitosamente: ${
                        newManagement.semester === "first" ? "Primer semestre" : "Segundo semestre"
                    } del año ${newManagement.year}.`,
                });

                setTimeout(() => {
                    onManagementCreated(response.data.management); // Informar al padre de la nueva gestión creada
                    onCancel(); // Volver al listado de gestiones
                }, 500);
            } else {
                handleServerError(response);
            }
        } catch (error) {
            handleServerError(error.response?.data || {});
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleServerError = (response) => {
        const { code, message } = response;
        switch (code) {
            case 261:
                setMessage({
                    type: "error",
                    text: "Ya existe una gestión con el mismo semestre y año para este docente.",
                });
                break;
            case 321:
                setMessage({
                    type: "error",
                    text: "La fecha de la gestión está en el pasado. Por favor, elige un año válido.",
                });
                break;
            case 322:
                setMessage({
                    type: "error",
                    text: "La fecha de la gestión está en el futuro. Solo se permiten gestiones para el año actual o próximos años.",
                });
                break;
            default:
                setMessage({
                    type: "error",
                    text: message || "Error desconocido al crear la gestión.",
                });
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto relative">
            <h3 className="text-2xl font-bold mb-4 text-purple-700">Crear una nueva gestión</h3>

            {/* Semestre */}
            <label className="block text-sm font-medium text-purple-700 mb-2">
                Semestre <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={newManagement.semester === "first" ? "Primer semestre" : "Segundo semestre"}
                disabled
                className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-2 mb-4"
            />

            {/* Año */}
            <label className="block text-sm font-medium text-purple-700 mb-2">
                Año <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={newManagement.year}
                disabled
                className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-2 mb-4"
            />

            {/* Botón de Crear Gestión */}
            <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
            >
                {isLoading ? "Creando..." : "Crear Gestión"}
            </Button>

            {/* Mensaje de éxito o error */}
            {message && (
                <p
                    className={`text-center mt-4 flex items-center justify-center ${
                        message.type === "success" ? "text-green-500" : "text-red-500"
                    }`}
                >
                    {message.type === "success" ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                    {message.text}
                </p>
            )}

            {/* Diálogo de Confirmación */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-purple-700 font-bold text-lg">
                            Confirmar creación de gestión
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-purple-700 text-sm mb-4">
                        <strong>Nota:</strong> El primer semestre cubre del 1 de enero al 30 de junio, y el segundo semestre
                        del 1 de julio al 31 de diciembre.
                    </p>
                    <p className="text-gray-700">
                        Se creará una gestión correspondiente al{" "}
                        <span className="font-semibold text-purple-600">
                            {newManagement.semester === "first" ? "Primer semestre" : "Segundo semestre"} del año{" "}
                            {newManagement.year}.
                        </span>
                    </p>
                    <p className="text-gray-600 mt-2 italic">
                        Si cree que hay un error, comuníquese con los administradores.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsDialogOpen(false)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateManagement}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
