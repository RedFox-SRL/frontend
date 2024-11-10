import React, { useState } from "react";
import { putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { Switch } from "@headlessui/react";
import { useToast } from "@/hooks/use-toast";

export default function ManagementSettingsView({ management }) {
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const { toast } = useToast();

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

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">
                Configuraciones de la Gestión
            </h2>
            <div className="mb-4">
                <label className="block font-semibold text-gray-700">Código de gestión:</label>
                <Switch
                    checked={isCodeActive}
                    onChange={toggleCodeStatus}
                    className={`${isCodeActive ? "bg-purple-600" : "bg-gray-400"} 
            relative inline-flex items-center h-6 rounded-full w-11`}
                >
                    <span className="sr-only">Toggle code</span>
                    <span
                        className={`${isCodeActive ? "translate-x-6" : "translate-x-1"} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                </Switch>
            </div>
            <div className="mb-4">
                <label className="block font-semibold text-gray-700">Límite de grupos:</label>
                <input
                    type="number"
                    value={newGroupLimit}
                    onChange={handleGroupLimitChange}
                    className="border rounded p-2 w-20 mr-4"
                />
                <Button onClick={saveGroupLimit} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Guardar
                </Button>
            </div>
        </div>
    );
}
