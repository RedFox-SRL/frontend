import React, { useState } from "react";
import { putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { Switch } from "@headlessui/react";
import { useToast } from "@/hooks/use-toast";

export default function ManagementSettingsView({ management }) {
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const [newDeliveryDate, setNewDeliveryDate] = useState(
        management.project_delivery_date.slice(0, 16)
    ); // Compatible con el input datetime-local
    const { toast } = useToast();

    const formatDateTime = (datetime) => {
        // Convierte el valor del input al formato Y-m-d H:i:s
        const [date, time] = datetime.split("T");
        return `${date} ${time}:00`;
    };

    const handleGroupLimitChange = (e) => {
        setNewGroupLimit(e.target.value);
    };

    const saveGroupLimit = async () => {
        try {
            await putData(`/managements/${management.id}/update-group-limit`, {
                group_limit: parseInt(newGroupLimit, 10),
            });
            toast({
                title: "Éxito",
                description: "Límite de grupos actualizado correctamente.",
                duration: 5000,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al actualizar el límite de grupos.",
                duration: 5000,
                className: "bg-red-500 text-white",
            });
        }
    };

    const toggleCodeStatus = async () => {
        try {
            const response = await putData(`/managements/${management.id}/toggle-code`);
            setIsCodeActive(response.data.management.is_code_active);
            toast({
                title: "Éxito",
                description: "Estado del código actualizado correctamente.",
                duration: 5000,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al actualizar el estado del código.",
                duration: 5000,
                className: "bg-red-500 text-white",
            });
        }
    };

    const handleDateChange = (e) => {
        setNewDeliveryDate(e.target.value);
    };

    const saveDeliveryDate = async () => {
        try {
            const formattedDate = formatDateTime(newDeliveryDate);
            await putData(`/managements/${management.id}/projectDate`, {
                project_delivery_date: formattedDate,
            });
            toast({
                title: "Éxito",
                description: "Fecha de entrega del proyecto actualizada correctamente.",
                duration: 5000,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            const errorMessage =
                error.response?.data?.data?.project_delivery_date?.[0] ||
                "Error al actualizar la fecha de entrega.";
            toast({
                title: "Error",
                description: errorMessage,
                duration: 5000,
                className: "bg-red-500 text-white",
            });
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-md w-full max-w-md space-y-6">
            <h2 className="text-lg font-semibold text-purple-700">
                Configuraciones de la Gestión
            </h2>
            <div className="space-y-4">
                {/* Código de gestión */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                        Código de gestión:
                    </label>
                    <Switch
                        checked={isCodeActive}
                        onChange={toggleCodeStatus}
                        className={`${isCodeActive ? "bg-purple-600" : "bg-gray-400"}
                            relative inline-flex items-center h-6 rounded-full w-11`}
                    >
                        <span className="sr-only">Toggle code</span>
                        <span
                            className={`${
                                isCodeActive ? "translate-x-6" : "translate-x-1"
                            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                        />
                    </Switch>
                </div>

                {/* Límite de grupos */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                        Límite de grupos:
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={newGroupLimit}
                            onChange={handleGroupLimitChange}
                            className="border rounded p-2 w-24 text-sm"
                        />
                        <Button
                            onClick={saveGroupLimit}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                        >
                            Guardar
                        </Button>
                    </div>
                </div>

                {/* Fecha de entrega del proyecto */}
                <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">
                        Fecha de entrega del proyecto:
                    </label>
                    <div className="flex flex-col space-y-2">
                        <input
                            type="datetime-local"
                            value={newDeliveryDate}
                            onChange={handleDateChange}
                            className="border rounded p-2 text-sm w-full"
                        />
                        <Button
                            onClick={saveDeliveryDate}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm w-full"
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}