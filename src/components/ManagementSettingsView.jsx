import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@headlessui/react";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, ChevronDown, ArrowLeft } from "lucide-react";

export default function ManagementSettingsView({ management, onBack }) {
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const [selectedEvaluation, setSelectedEvaluation] = useState("");
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);
    const { toast } = useToast();

    const handleGroupLimitChange = (e) => {
        setNewGroupLimit(e.target.value);
    };

    const saveGroupLimit = async () => {
        try {
            toast({
                title: "Éxito",
                description: "Límite de grupos actualizado correctamente.",
                duration: 10000,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al actualizar el límite de grupos.",
                duration: 10000,
                className: "bg-red-500 text-white",
            });
        }
    };

    const toggleCodeStatus = async () => {
        try {
            setIsCodeActive(!isCodeActive);
            toast({
                title: "Éxito",
                description: "Estado del código actualizado correctamente.",
                duration: 10000,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al actualizar el estado del código.",
                duration: 10000,
                className: "bg-red-500 text-white",
            });
        }
    };

    const handleEvaluationSelection = (e) => {
        setSelectedEvaluation(e.target.value);
        setShowEvaluationForm(true);
    };

    const renderEvaluationForm = () => (
        <div className="mt-6 p-4 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold text-purple-700">
                {selectedEvaluation === "self"
                    ? "Autoevaluación de Desempeño"
                    : selectedEvaluation === "peer"
                        ? "Evaluación de Pares"
                        : "Evaluación Cruzada"}
            </h2>
            <section className="mt-6">
                <h3 className="text-lg font-semibold text-purple-600">
                    Habilidades Técnicas
                </h3>
                <p className="text-gray-700 mt-1">Conocimiento de Programación</p>
                <textarea
                    className="w-full p-2 mt-2 border rounded-md"
                    placeholder="Tu evaluación sobre Conocimiento de Programación"
                ></textarea>
                <p className="text-gray-700 mt-3">Resolución de Problemas</p>
                <textarea
                    className="w-full p-2 mt-2 border rounded-md"
                    placeholder="Tu evaluación sobre Resolución de Problemas"
                ></textarea>
            </section>
            <section className="mt-6">
                <h3 className="text-lg font-semibold text-purple-600">
                    Habilidades Blandas
                </h3>
                <p className="text-gray-700 mt-1">Comunicación</p>
                <textarea
                    className="w-full p-2 mt-2 border rounded-md"
                    placeholder="Tu evaluación sobre Comunicación"
                ></textarea>
                <p className="text-gray-700 mt-3">Trabajo en Equipo</p>
                <textarea
                    className="w-full p-2 mt-2 border rounded-md"
                    placeholder="Tu evaluación sobre Trabajo en Equipo"
                ></textarea>
            </section>
        </div>
    );

    return (
        <div className="p-8 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <Button
                    onClick={onBack}
                    className="bg-purple-500 text-white flex items-center gap-2"
                >
                    <ArrowLeft />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold text-purple-700">
                    Configuración de Gestión
                </h1>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <p className="text-gray-700 font-medium">Código de gestión:</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-800 font-bold">{management.code}</span>
                        <Switch
                            checked={isCodeActive}
                            onChange={toggleCodeStatus}
                            className={`${isCodeActive ? "bg-purple-600" : "bg-gray-400"} 
                inline-flex items-center h-6 rounded-full w-11`}
                        >
                            <span className="sr-only">Toggle code</span>
                            <span
                                className={`${isCodeActive ? "translate-x-6" : "translate-x-1"}
                  inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                            />
                        </Switch>
                    </div>
                </div>
                <div>
                    <p className="text-gray-700 font-medium">Límite de grupos:</p>
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="number"
                            value={newGroupLimit}
                            onChange={handleGroupLimitChange}
                            className="border rounded-md p-1 w-20"
                        />
                        <Button onClick={saveGroupLimit} className="bg-purple-500 text-white">
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
            <div className="mb-8">
                <p className="text-gray-700 font-medium">Evaluaciones Especiales:</p>
                <div className="relative mt-2">
                    <select
                        onChange={handleEvaluationSelection}
                        className="w-full p-2 border rounded-md bg-purple-500 text-white cursor-pointer"
                        value={selectedEvaluation}
                    >
                        <option value="" disabled>Seleccionar Evaluación</option>
                        <option value="self">Autoevaluación</option>
                        <option value="peer">Evaluación de Pares</option>
                        <option value="cross">Evaluación Cruzada</option>
                    </select>
                    <ChevronDown className="absolute top-3 right-3 text-white pointer-events-none" />
                </div>
            </div>
            {showEvaluationForm && renderEvaluationForm()}
        </div>
    );
}
