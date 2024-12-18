import React, {useEffect, useState, useCallback} from "react";
import {ArrowLeft, PlusCircle, Trash, HelpCircle} from 'lucide-react';
import {getData, postData, putData} from "../api/apiService";
import {useToast} from "@/hooks/use-toast";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

export default function SpecialEvaluationsView({onBack, managementId}) {
    const {toast} = useToast();
    const [evaluationData, setEvaluationData] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmSectionDialogOpen, setConfirmSectionDialogOpen] = useState(false);
    const [criteriaToRemove, setCriteriaToRemove] = useState({sectionIndex: null, criteriaIndex: null});
    const [sectionToRemove, setSectionToRemove] = useState(null);

    const fetchEvaluationTemplates = useCallback(async () => {
        try {
            const response = await getData(`/evaluation-templates?management_id=${managementId}`);
            if (response && response.data && response.data.templates) {
                return response.data.templates;
            }
            return [];
        } catch (error) {
            console.error("Error fetching evaluation templates:", error);
            toast({
                title: "Error", description: "Error al cargar los templates de evaluación.", status: "error",
            });
            return [];
        }
    }, [managementId, toast]);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            if (managementId) {
                setIsLoading(true);
                try {
                    const fetchedTemplates = await fetchEvaluationTemplates();
                    if (isMounted) {
                        setTemplates(fetchedTemplates);
                        const defaultTemplate = fetchedTemplates.find(t => t.type === "self") || fetchedTemplates[0];
                        if (defaultTemplate) {
                            setEvaluationData({
                                id: defaultTemplate.id,
                                type: defaultTemplate.type,
                                sections: defaultTemplate.sections || [],
                            });
                            setIsEditing(true);
                        } else {
                            setEvaluationData({
                                type: "self", sections: [],
                            });
                            setIsEditing(false);
                        }
                    }
                } catch (error) {
                    console.error("Error loading initial data:", error);
                    toast({
                        title: "Error", description: "Error al cargar los datos iniciales.", status: "error",
                    });
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [managementId, fetchEvaluationTemplates, toast]);

    const loadTemplateData = useCallback((type) => {
        const existingTemplate = templates.find((template) => template.type === type);
        if (existingTemplate) {
            setEvaluationData({
                id: existingTemplate.id, type: existingTemplate.type, sections: existingTemplate.sections || [],
            });
            setIsEditing(true);
        } else {
            setEvaluationData({
                type, sections: [],
            });
            setIsEditing(false);
        }
    }, [templates]);

    const handleTypeChange = (type) => {
        const existingTemplate = templates.find((template) => template.type === type);
        if (existingTemplate) {
            setEvaluationData({
                id: existingTemplate.id, type: existingTemplate.type, sections: existingTemplate.sections || [],
            });
            setIsEditing(true);
        } else {
            setEvaluationData({
                type, sections: [],
            });
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        try {
            const dataToSave = {
                management_id: managementId, type: evaluationData.type, sections: evaluationData.sections,
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

            await fetchEvaluationTemplates();
            loadTemplateData(evaluationData.type);
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
            title: "", criteria: [{name: "", description: ""}],
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
        const newCriteria = {name: "", description: ""};
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria = updatedSections[sectionIndex].criteria || [];
        updatedSections[sectionIndex].criteria.push(newCriteria);
        setEvaluationData({...evaluationData, sections: updatedSections});
    };

    const handleRemoveSection = () => {
        const updatedSections = evaluationData.sections.filter((_, index) => index !== sectionToRemove);
        setEvaluationData({...evaluationData, sections: updatedSections});
        toast({
            title: "Sección Eliminada",
            description: "La sección ha sido eliminada con éxito.",
            status: "success",
            className: "bg-green-500 text-white",
        });
        setConfirmSectionDialogOpen(false);
    };

    const handleRemoveCriteria = () => {
        const {sectionIndex, criteriaIndex} = criteriaToRemove;
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria.splice(criteriaIndex, 1);
        setEvaluationData({...evaluationData, sections: updatedSections});
        toast({
            title: "Criterio Eliminado",
            description: "El criterio ha sido eliminado con éxito.",
            status: "success",
            className: "bg-green-500 text-white",
        });
        setConfirmDialogOpen(false);
    };

    const handleCriteriaNameChange = (e, sectionIndex, criteriaIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 50);
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria[criteriaIndex].name = value;
        setEvaluationData({...evaluationData, sections: updatedSections});
    };

    const handleCriteriaDescriptionChange = (e, sectionIndex, criteriaIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 200);
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].criteria[criteriaIndex].description = value;
        setEvaluationData({...evaluationData, sections: updatedSections});
    };

    const handleSectionTitleChange = (e, sectionIndex) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 50);
        const updatedSections = evaluationData.sections ? [...evaluationData.sections] : [];
        updatedSections[sectionIndex].title = value;
        setEvaluationData({...evaluationData, sections: updatedSections});
    };

    const isSaveDisabled = () => {
        if (evaluationData.sections.length === 0) return true;
        for (const section of evaluationData.sections) {
            if (!section.title || section.title.length > 50) return true;
            if (section.criteria.length === 0) return true;
            for (const criteria of section.criteria) {
                if (!criteria.name || criteria.name.length > 50) return true;
                if (!criteria.description || criteria.description.length > 200) return true;
            }
        }
        return false;
    };

    if (isLoading || !evaluationData) {
        return <div>Cargando...</div>;
    }

    return (<div className="mt-4 p-4 border rounded-lg shadow-lg bg-white space-y-6">
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="flex items-center text-purple-600">
                <ArrowLeft className="mr-2"/> Retroceder
            </button>
            <button onClick={() => setHelpDialogOpen(true)} className="flex items-center text-blue-600">
                <HelpCircle className="mr-2"/> Ayuda
            </button>
        </div>

        <div className="flex space-x-4">
            <button onClick={() => handleTypeChange("self")}
                    className={`p-2 rounded-md ${evaluationData.type === "self" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Autoevaluación
            </button>
            <button onClick={() => handleTypeChange("peer")}
                    className={`p-2 rounded-md ${evaluationData.type === "peer" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Evaluación
                de Pares
            </button>
            <button onClick={() => handleTypeChange("cross")}
                    className={`p-2 rounded-md ${evaluationData.type === "cross" ? "bg-purple-600 text-white" : "bg-gray-200"}`}>Evaluación
                Cruzada
            </button>
        </div>

        {(evaluationData.sections || []).map((section, sectionIndex) => (
            <section key={sectionIndex} className="mt-6 border p-4 rounded-md bg-gray-100">
                <div className="flex justify-between items-center">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={section.title || ""}
                            onChange={(e) => handleSectionTitleChange(e, sectionIndex)}
                            className="w-full border-b mb-2"
                            placeholder="Nueva Sección"
                        />
                        <span className="absolute right-2 bottom-2 text-gray-500">{section.title.length}/50</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSectionToRemove(sectionIndex);
                                setConfirmSectionDialogOpen(true);
                            }}
                            className="text-red-500"
                        >
                            <Trash className="inline mr-1"/> Eliminar Sección
                        </button>
                    </div>
                </div>

                {(section.criteria || []).map((criteria, criteriaIndex) => (
                    <div key={criteriaIndex} className="mt-4 bg-white p-3 rounded-md shadow-sm">
                        <div className="relative">
                            <input
                                type="text"
                                value={criteria.name}
                                onChange={(e) => handleCriteriaNameChange(e, sectionIndex, criteriaIndex)}
                                className="w-full mb-1 border-b"
                                placeholder="Nombre del Criterio"
                            />
                            <span
                                className="absolute right-2 bottom-2 text-gray-500">{criteria.name.length}/50</span>
                        </div>
                        <div className="relative">
                                <textarea
                                    value={criteria.description}
                                    onChange={(e) => handleCriteriaDescriptionChange(e, sectionIndex, criteriaIndex)}
                                    className="w-full p-2 mt-1 border rounded-md"
                                    placeholder="Descripción del Criterio"
                                ></textarea>
                            <span
                                className="absolute right-2 bottom-2 text-gray-500">{criteria.description.length}/200</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            {criteriaIndex === section.criteria.length - 1 && (<button
                                onClick={() => handleAddCriteria(sectionIndex)}
                                className="text-green-500"
                            >
                                <PlusCircle className="mr-1"/> Añadir Criterio
                            </button>)}
                            <button
                                className="text-red-500 ml-auto"
                                onClick={() => {
                                    setCriteriaToRemove({sectionIndex, criteriaIndex});
                                    setConfirmDialogOpen(true);
                                }}
                            >
                                <Trash className="mr-1"/> Eliminar
                            </button>
                        </div>
                    </div>))}
                <p className="text-right text-gray-500">Criterios: {section.criteria.length}/10</p>
            </section>))}
        <p className="text-right text-gray-500">Secciones: {evaluationData.sections.length}/10</p>

        <div className="flex justify-between mt-6">
            <button onClick={handleAddSection} className="text-blue-500">
                <PlusCircle className="inline mr-1"/> Añadir Sección
            </button>
            <button onClick={handleSave}
                    className={`px-4 py-2 rounded-lg shadow ${isSaveDisabled() ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 text-white"}`}
                    disabled={isSaveDisabled()}>
                {isEditing ? "Guardar Cambios" : "Guardar"}
            </button>
        </div>

        <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ayuda</DialogTitle>
                </DialogHeader>
                <p>Este componente permite crear y gestionar evaluaciones especiales. Para habilitar el botón de
                    guardar, asegúrese de que:</p>
                <ul className="list-disc list-inside">
                    <li>Haya al menos una sección con un título no vacío y un máximo de 50 caracteres.</li>
                    <li>Cada sección tenga al menos un criterio con un nombre no vacío y un máximo de 50
                        caracteres.
                    </li>
                    <li>Cada criterio tenga una descripción no vacía y un máximo de 200 caracteres.</li>
                </ul>
                <DialogFooter>
                    <Button onClick={() => setHelpDialogOpen(false)}
                            className="bg-purple-600 text-white">Cerrar</Button>
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
                    <Button onClick={() => setConfirmDialogOpen(false)}
                            className="bg-red-600 text-white">Cancelar</Button>
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
                    <Button onClick={() => setConfirmSectionDialogOpen(false)}
                            className="bg-red-600 text-white">Cancelar</Button>
                    <Button onClick={handleRemoveSection} className="bg-purple-600 text-white">Eliminar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>);
}