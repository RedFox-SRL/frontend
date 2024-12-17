import React, { useEffect, useState } from "react";
import { ArrowLeft, PlusCircle, Trash, HelpCircle } from "lucide-react";
import { getData, postData, putData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SpecialEvaluationsView({ onBack, managementId }) {
    const { toast } = useToast();
    const [evaluationData, setEvaluationData] = useState({
        type: "self", name: "", sections: [],
    });
    const [templates, setTemplates] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmSectionDialogOpen, setConfirmSectionDialogOpen] = useState(false);
    const [criteriaToRemove, setCriteriaToRemove] = useState({ sectionIndex: null, criteriaIndex: null });
    const [sectionToRemove, setSectionToRemove] = useState(null);

    const fetchEvaluationTemplates = async () => {
        try {
            const response = await getData(`/evaluation-templates?management_id=${managementId}`);
            if (response && response.data && response.data.templates) {
                setTemplates(response.data.templates);
            }
        } catch (error) {
            console.error("Error fetching evaluation templates:", error);
            toast({
                title: "Error", description: "Error al cargar los templates de evaluación.", status: "error",
            });
        }
    };

    useEffect(() => {
        if (managementId) {
            fetchEvaluationTemplates();
        }
    }, [managementId]);

    const handleTypeChange = (type) => {
        setEvaluationData((prevData) => ({ ...prevData, type }));

        const existingTemplate = templates.find((template) => template.type === type);
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
                type, name: "", sections: [],
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
                    className: "bg-green-500 text-white",
                });
            } else {
                await postData("/evaluation-templates", dataToSave);
                toast({
                    title: "Éxito",
                    description: "Evaluación creada exitosamente.",
                    status: "success",
                    className: "bg-green-500 text-white",
                });
            }

            fetchEvaluationTemplates();
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving evaluation:", error);
            toast({
                title: "Error", description: "Error al guardar la evaluación.", status: "error",
            });
        }
    };

    const handleAddSection = () => {
        if (evaluationData.sections.length >= 10) {
            toast({
                title: "Límite alcanzado",
                description: "No se pueden añadir más de 10 secciones.",
                status: "warning",
                className: "bg-red-500 text-white",
            });
            return;
        }
        const newSection = {
            title: "", criteria: [{ name: "", description: "" }],
        };
        setEvaluationData((prevData) => ({
            ...prevData, sections: [...(prevData.sections || []), newSection],
        }));
    };

    const handleAddCriteria = (sectionIndex) => {
        if (evaluationData.sections[sectionIndex].criteria.length >= 10) {
            toast({
                title: "Límite alcanzado",
                description: "No se pueden añadir más de 10 criterios por sección.",
                status: "warning",
                className: "bg-red-500 text-white",
            });
            return;
        }
        const newCriteria = { name: "", description: "" };
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria = updatedSections[sectionIndex].criteria || [];
        updatedSections[sectionIndex].criteria.push(newCriteria);
        setEvaluationData({ ...evaluationData, sections: updatedSections });
    };

    const handleRemoveSection = () => {
        const updatedSections = evaluationData.sections.filter((_, index) => index !== sectionToRemove);
        setEvaluationData({ ...evaluationData, sections: updatedSections });
        toast({
            title: "Sección Eliminada",
            description: "La sección ha sido eliminada con éxito.",
            status: "success",
            className: "bg-green-500 text-white",
        });
        setConfirmSectionDialogOpen(false);
    };

    const handleRemoveCriteria = () => {
        const { sectionIndex, criteriaIndex } = criteriaToRemove;
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria.splice(criteriaIndex, 1);
        setEvaluationData({ ...evaluationData, sections: updatedSections });
        toast({
            title: "Criterio Eliminado",
            description: "El criterio ha sido eliminado con éxito.",
            status: "success",
            className: "bg-green-500 text-white",
        });
        setConfirmDialogOpen(false);
    };

    const handleCriteriaNameChange = (e, sectionIndex, criteriaIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria[criteriaIndex].name = value;
        setEvaluationData({ ...evaluationData, sections: updatedSections });
    };

    const handleCriteriaDescriptionChange = (e, sectionIndex, criteriaIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria[criteriaIndex].description = value;
        setEvaluationData({ ...evaluationData, sections: updatedSections });
    };

    const handleSectionTitleChange = (e, sectionIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].title = value;
        setEvaluationData({ ...evaluationData, sections: updatedSections });
    };

    return (
        <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white space-y-6">
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>
            <button onClick={() => setHelpDialogOpen(true)} className="flex items-center text-blue-600 mb-4">
                <HelpCircle className="mr-2" /> Ayuda
            </button>

            <div className="flex space-x-4">
                <button onClick={() => handleTypeChange("self")} className={`p-2 rounded-md ${evaluationData.type === "self" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Autoevaluación</button>
                <button onClick={() => handleTypeChange("peer")} className={`p-2 rounded-md ${evaluationData.type === "peer" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Evaluación de Pares</button>
                <button onClick={() => handleTypeChange("cross")} className={`p-2 rounded-md ${evaluationData.type === "cross" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Evaluación Cruzada</button>
            </div>

            <input
                type="text"
                placeholder="Nombre de la evaluación"
                value={evaluationData.name}
                onChange={(e) => setEvaluationData({ ...evaluationData, name: e.target.value.replace(/[^a-zA-Z0-9 ]/g, "") })}
                className="w-full p-2 border rounded-md mt-4"
            />

            {(evaluationData.sections || []).map((section, sectionIndex) => (
                <section key={sectionIndex} className="mt-6 border p-4 rounded-md bg-gray-100">
                    <div className="flex justify-between items-center">
                        <input
                            type="text"
                            value={section.title || ""}
                            onChange={(e) => handleSectionTitleChange(e, sectionIndex)}
                            className="w-full border-b mb-2"
                            placeholder="Nueva Sección"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSectionToRemove(sectionIndex);
                                    setConfirmSectionDialogOpen(true);
                                }}
                                className="text-red-500"
                            >
                                <Trash className="inline mr-1" /> Eliminar Sección
                            </button>
                        </div>
                    </div>

                    {(section.criteria || []).map((criteria, criteriaIndex) => (
                        <div key={criteriaIndex} className="mt-4 bg-white p-3 rounded-md shadow-sm">
                            <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => handleCriteriaNameChange(e, sectionIndex, criteriaIndex)}
                                className="w-full mb-1 border-b"
                                placeholder="Nombre del Criterio"
                            />
                            <textarea
                                value={criteria.description}
                                onChange={(e) => handleCriteriaDescriptionChange(e, sectionIndex, criteriaIndex)}
                                className="w-full p-2 mt-1 border rounded-md"
                                placeholder="Descripción del Criterio"
                            ></textarea>
                            <div className="flex justify-between mt-2">
                                {criteriaIndex === section.criteria.length - 1 && (
                                    <button
                                        onClick={() => handleAddCriteria(sectionIndex)}
                                        className="text-green-500"
                                    >
                                        <PlusCircle className="mr-1" /> Añadir Criterio
                                    </button>
                                )}
                                <button
                                    className="text-red-500"
                                    onClick={() => {
                                        setCriteriaToRemove({ sectionIndex, criteriaIndex });
                                        setConfirmDialogOpen(true);
                                    }}
                                >
                                    <Trash className="mr-1" /> Eliminar
                                </button>
                            </div>
                        </div>))}
                    <p className="text-right text-gray-500">Criterios: {section.criteria.length}/10</p>
                </section>))}
            <p className="text-right text-gray-500">Secciones: {evaluationData.sections.length}/10</p>

            <div className="flex justify-between mt-6">
                <button onClick={handleAddSection} className="text-blue-500">
                    <PlusCircle className="inline mr-1" /> Añadir Sección
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow">
                    {isEditing ? "Guardar Cambios" : "Guardar"}
                </button>
            </div>

            <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ayuda</DialogTitle>
                    </DialogHeader>
                    <p>Este componente permite crear y gestionar evaluaciones especiales.</p>
                    <DialogFooter>
                        <Button onClick={() => setHelpDialogOpen(false)} className="bg-purple-600 text-white">Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro de que deseas eliminar este criterio?</p>
                    <DialogFooter>
                        <Button onClick={() => setConfirmDialogOpen(false)} className="bg-red-600 text-white">Cancelar</Button>
                        <Button onClick={handleRemoveCriteria} className="bg-purple-600 text-white">Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmSectionDialogOpen} onOpenChange={setConfirmSectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro de que deseas eliminar esta sección?</p>
                    <DialogFooter>
                        <Button onClick={() => setConfirmSectionDialogOpen(false)} className="bg-red-600 text-white">Cancelar</Button>
                        <Button onClick={handleRemoveSection} className="bg-purple-600 text-white">Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}