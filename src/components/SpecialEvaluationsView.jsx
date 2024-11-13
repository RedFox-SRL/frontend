import React, { useState, useEffect } from "react";
import { ArrowLeft, PlusCircle, Trash } from "lucide-react";
import { getData, postData, putData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";

export default function SpecialEvaluationsView({ onBack, managementId }) {
    const { toast } = useToast();
    const [evaluationData, setEvaluationData] = useState({
        type: "",
        name: "",
        sections: [],
    });
    const [templates, setTemplates] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const fetchEvaluationTemplates = async () => {
        try {
            const response = await getData(`/evaluation-templates?management_id=${managementId}`);
            if (response && response.data && response.data.templates) {
                setTemplates(response.data.templates);
            }
        } catch (error) {
            console.error("Error fetching evaluation templates:", error);
            toast({
                title: "Error",
                description: "Error al cargar los templates de evaluación.",
                status: "error",
            });
        }
    };

    useEffect(() => {
        if (managementId) {
            fetchEvaluationTemplates();
        }
    }, [managementId]);

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setEvaluationData((prevData) => ({ ...prevData, type: selectedType }));

        const existingTemplate = templates.find((template) => template.type === selectedType);
        if (existingTemplate) {
            setEvaluationData({
                id: existingTemplate.id,
                type: existingTemplate.type,
                name: existingTemplate.name,
                sections: existingTemplate.sections,
            });
            setIsEditing(true);
        } else {
            setEvaluationData({
                type: selectedType,
                name: "",
                sections: [],
            });
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        try {
            const dataToSave = {
                management_id: managementId,
                type: evaluationData.type,
                name: evaluationData.name,
                sections: evaluationData.sections,
            };

            if (isEditing) {
                await putData(`/evaluation-templates/${evaluationData.id}`, dataToSave);
                toast({
                    title: "Éxito",
                    description: "Evaluación actualizada exitosamente.",
                    status: "success",
                });
            } else {
                await postData("/evaluation-templates", dataToSave);
                toast({
                    title: "Éxito",
                    description: "Evaluación creada exitosamente.",
                    status: "success",
                });
            }

            fetchEvaluationTemplates();
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving evaluation:", error);
            toast({
                title: "Error",
                description: "Error al guardar la evaluación.",
                status: "error",
            });
        }
    };

    const handleAddSection = () => {
        const newSection = {
            title: "Nueva Sección",
            criteria: [{ name: "", description: "" }],
        };
        setEvaluationData((prevData) => ({
            ...prevData,
            sections: [...(prevData.sections || []), newSection],
        }));
    };

    const handleAddCriteria = (sectionIndex) => {
        const newCriteria = { name: "", description: "" };
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria = updatedSections[sectionIndex].criteria || [];
        updatedSections[sectionIndex].criteria.push(newCriteria);
        setEvaluationData({ ...evaluationData, sections: updatedSections });
    };

    return (
        <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white space-y-6">
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>

            <div>
                <label className="text-lg font-semibold text-purple-700">Tipo de Evaluación</label>
                <select
                    className="w-full p-2 border rounded-md mt-2"
                    value={evaluationData.type}
                    onChange={handleTypeChange}
                >
                    <option value="">Selecciona un tipo de evaluación</option>
                    <option value="self">Autoevaluación</option>
                    <option value="peer">Evaluación de Pares</option>
                    <option value="cross">Evaluación Cruzada</option>
                    <option value="final">Evaluación Final</option>
                </select>
            </div>

            <input
                type="text"
                placeholder="Nombre de la evaluación"
                value={evaluationData.name}
                onChange={(e) => setEvaluationData({ ...evaluationData, name: e.target.value })}
                className="w-full p-2 border rounded-md mt-4"
            />

            {(evaluationData.sections || []).map((section, sectionIndex) => (
                <section key={sectionIndex} className="mt-6 border p-4 rounded-md bg-gray-100">
                    <div className="flex justify-between items-center">
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                                const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
                                updatedSections[sectionIndex].title = e.target.value;
                                setEvaluationData({ ...evaluationData, sections: updatedSections });
                            }}
                            className="text-lg font-semibold text-purple-600 w-full border-b mb-2"
                            placeholder="Título de la Sección"
                        />
                        <button onClick={() => handleAddCriteria(sectionIndex)} className="text-green-500">
                            <PlusCircle className="inline mr-1" /> Añadir Criterio
                        </button>
                    </div>

                    {(section.criteria || []).map((criteria, criteriaIndex) => (
                        <div key={criteriaIndex} className="mt-4 bg-white p-3 rounded-md shadow-sm">
                            <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => {
                                    const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
                                    updatedSections[sectionIndex].criteria[criteriaIndex].name = e.target.value;
                                    setEvaluationData({ ...evaluationData, sections: updatedSections });
                                }}
                                className="text-gray-800 font-semibold w-full mb-1 border-b"
                                placeholder="Nombre del Criterio"
                            />
                            <textarea
                                value={criteria.description}
                                onChange={(e) => {
                                    const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
                                    updatedSections[sectionIndex].criteria[criteriaIndex].description = e.target.value;
                                    setEvaluationData({ ...evaluationData, sections: updatedSections });
                                }}
                                className="w-full p-2 mt-1 border rounded-md"
                                placeholder="Descripción del Criterio"
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button
                                    className="text-red-500"
                                    onClick={() => {
                                        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
                                        updatedSections[sectionIndex].criteria.splice(criteriaIndex, 1);
                                        setEvaluationData({ ...evaluationData, sections: updatedSections });
                                    }}
                                >
                                    <Trash className="mr-1" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            ))}

            <div className="flex justify-between mt-6">
                <button onClick={handleAddSection} className="text-blue-500">
                    <PlusCircle className="inline mr-1" /> Añadir Sección
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow">
                    {isEditing ? "Guardar Cambios" : "Guardar"}
                </button>
            </div>
        </div>
    );
}
