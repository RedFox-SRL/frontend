import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, ArrowLeft, AlertCircle } from "lucide-react";
import { postData } from "../api/apiService";

export default function CrossEvaluationForm({ evaluationData, onSubmit, onBack }) {
    const { toast } = useToast();
    const [responses, setResponses] = useState({});
    const [isAllFilled, setIsAllFilled] = useState(false);
    const [view, setView] = useState("links");

    const { evaluated_group, deadline, template } = evaluationData || {};
    const deadlineDate = new Date(deadline?.item).toLocaleString();

    // Determina si el usuario es representante legal basado en la existencia de criterios
    const isRepresentative = template && template.sections.length > 0;

    useEffect(() => {
        if (!template) return;

        const allCriteria = template.sections.flatMap((section) =>
            section.criteria.map((criterion) => criterion.id)
        );
        const allAnswered = allCriteria.every((id) => responses[id] !== undefined);
        setIsAllFilled(allAnswered);
    }, [responses, template]);

    const handleInputChange = (criterionId, value) => {
        setResponses((prev) => ({
            ...prev,
            [criterionId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!isAllFilled) {
            toast({
                title: "Error",
                description: "Por favor, completa todos los criterios antes de enviar.",
                variant: "destructive",
            });
            return;
        }

        try {
            const payload = { responses };
            await postData("/cross-evaluation/submit", payload);
            toast({
                title: "Éxito",
                description: "Evaluación enviada correctamente.",
                className: "bg-green-500 text-white",
            });
            onSubmit(); // Llama a la función para actualizar la vista
        } catch (error) {
            console.error("Error al enviar evaluación cruzada:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error al enviar la evaluación.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {view === "links" ? (
                <>
                    {/* Información del Grupo Evaluado */}
                    <div className="bg-white border-2 border-purple-500 p-6 rounded-lg shadow-lg text-purple-700">
                        <h2 className="text-2xl font-bold mb-2">
                            Evaluando al grupo: {evaluated_group?.name || "N/A"}
                        </h2>
                        <p className="text-sm">
                            <strong>Representante:</strong> {evaluated_group?.representative?.name}{" "}
                            {evaluated_group?.representative?.last_name}
                        </p>
                        <p className="text-sm">
                            <strong>Correo:</strong> {evaluated_group?.contact_email}
                        </p>
                        <p className="text-sm">
                            <strong>Teléfono:</strong> {evaluated_group?.contact_phone}
                        </p>
                        <p className="text-sm font-semibold">
                            <strong>Fecha límite:</strong>{" "}
                            <span className="text-purple-900">{deadlineDate}</span>
                        </p>
                    </div>

                    {/* Enlaces del Grupo */}
                    {evaluated_group?.links?.length > 0 ? (
                        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Enlaces del Grupo
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {evaluated_group.links.map((link, index) => (
                                    <li
                                        key={index}
                                        className="bg-white p-4 rounded-lg shadow flex items-start space-x-4"
                                    >
                                        <Link className="text-purple-700 w-6 h-6" />
                                        <div>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm font-semibold"
                                            >
                                                {link.description}
                                            </a>
                                            <p className="text-xs text-gray-500">
                                                Categoría: {link.category}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-red-100 p-6 rounded-lg shadow-md text-red-700 flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6" />
                            <p className="text-sm">
                                Este grupo no subió ningún enlace. Por favor, comunícate con su representante legal.
                            </p>
                        </div>
                    )}

                    {/* Mensaje para estudiantes normales */}
                    {!isRepresentative && (
                        <div className="bg-yellow-100 p-6 rounded-lg shadow-md text-yellow-700 flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6" />
                            <p className="text-sm">
                                Como no eres representante legal del grupo, no puedes completar la evaluación cruzada.
                                Por favor, comunícate con el representante para más detalles.
                            </p>
                        </div>
                    )}

                    {/* Botón para ir al formulario */}
                    {isRepresentative && (
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={() => setView("form")}
                                className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg shadow-md"
                            >
                                Continuar a Formulario
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Formulario */}
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => setView("links")}
                            className="text-purple-700 hover:text-purple-900 focus:outline-none"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h3 className="ml-4 text-lg font-bold text-purple-800">
                            Formulario de Evaluación
                        </h3>
                    </div>

                    {template?.sections.map((section) => (
                        <div
                            key={section.id}
                            className="p-6 bg-white rounded-lg shadow-lg space-y-6"
                        >
                            <h3 className="text-lg font-bold text-purple-700">
                                {section.title}
                            </h3>
                            {section.criteria.map((criterion) => (
                                <div
                                    key={criterion.id}
                                    className="space-y-2 border-b pb-4 last:border-none last:pb-0"
                                >
                                    <label className="block text-base font-bold text-gray-800">
                                        {criterion.name}
                                    </label>
                                    <p className="text-sm text-gray-500">
                                        {criterion.description || "Sin descripción"}
                                    </p>
                                    <div className="flex justify-between mt-2 space-x-2">
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
                                                    onChange={() =>
                                                        handleInputChange(criterion.id, value)
                                                    }
                                                />
                                                <span
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                                                        responses[criterion.id] === value
                                                            ? "bg-purple-700 text-white border-purple-700"
                                                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
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

                    {/* Botón de Enviar */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!isAllFilled}
                            className={`flex items-center px-6 py-3 rounded-lg shadow-md ${
                                isAllFilled
                                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Enviar Evaluación
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
