import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const useFormValues = () => {
    const [formValues, setFormValues] = useState({
        sprint_points: "",
        cross_evaluation_points: "",
        proposal_points: "",
        sprint_teacher_percentage: "",
        sprint_self_percentage: "",
        sprint_peer_percentage: "",
        proposal_part_a_percentage: "",
        proposal_part_b_percentage: "",
    });

    const handleInputChange = (e, keys) => {
        const { name, value } = e.target;
        if (!value || (/^[0-9]*$/.test(value) && value >= 0 && value <= 100)) {
            setFormValues((prev) => {
                const newValues = { ...prev, [name]: value };
                const total = keys.reduce((sum, key) => sum + parseInt(newValues[key] || 0), 0);
                if (total > 100) {
                    let excess = total - 100;
                    keys.filter((key) => key !== name).forEach((key) => {
                        const currentValue = parseInt(newValues[key]) || 0;
                        const newValue = Math.max(0, currentValue - excess);
                        newValues[key] = newValue;
                        excess -= (currentValue - newValue);
                    });
                }
                return newValues;
            });
        }
    };

    return [formValues, handleInputChange];
};

const useDeadlines = () => {
    const [partADeadline, setPartADeadline] = useState("");
    const [partBDeadline, setPartBDeadline] = useState("");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const minDate = `${currentYear}-${currentMonth >= 7 ? '07' : '01'}-01`;
    const maxDate = `${currentYear}-${currentMonth >= 7 ? '12' : '06'}-31`;

    const handleDateChange = (setter) => (event) => {
        const date = new Date(event.target.value);
        if (date.getFullYear() === currentYear &&
            ((currentMonth >= 7 && date.getMonth() + 1 >= 7) || (currentMonth < 7 && date.getMonth() + 1 < 7))) {
            setter(event.target.value);
        }
    };

    return { partADeadline, setPartADeadline, partBDeadline, setPartBDeadline, handleDateChange, minDate, maxDate };
};

const useFormValidation = (formValues) => {
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const {
            sprint_points, cross_evaluation_points, proposal_points,
            sprint_teacher_percentage, sprint_self_percentage, sprint_peer_percentage,
            proposal_part_a_percentage, proposal_part_b_percentage,
        } = formValues;

        const valid = [
            [sprint_points, cross_evaluation_points, proposal_points],
            [sprint_teacher_percentage, sprint_self_percentage, sprint_peer_percentage],
            [proposal_part_a_percentage, proposal_part_b_percentage]
        ].every(group => group.reduce((sum, val) => sum + parseInt(val || 0), 0) === 100);

        setIsFormValid(valid);
    }, [formValues]);

    return isFormValid;
};

const RatingsView = ({ onBack = () => {}, managementId, onUpdate }) => {
    const [formValues, handleInputChange] = useFormValues();
    const { partADeadline, setPartADeadline, partBDeadline, setPartBDeadline, handleDateChange, minDate, maxDate } = useDeadlines();
    const isFormValid = useFormValidation(formValues);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const { toast } = useToast();

    const isCurrentStepValid = () => {
        const {
            sprint_points, cross_evaluation_points, proposal_points,
            sprint_teacher_percentage, sprint_self_percentage, sprint_peer_percentage,
            proposal_part_a_percentage, proposal_part_b_percentage,
        } = formValues;

        switch (currentStep) {
            case 0:
                return [sprint_points, cross_evaluation_points, proposal_points]
                    .reduce((sum, val) => sum + parseInt(val || 0), 0) === 100;
            case 1:
                return [sprint_teacher_percentage, sprint_self_percentage, sprint_peer_percentage]
                    .reduce((sum, val) => sum + parseInt(val || 0), 0) === 100;
            case 2:
                return [proposal_part_a_percentage, proposal_part_b_percentage]
                    .reduce((sum, val) => sum + parseInt(val || 0), 0) === 100;
            case 3:
                return partADeadline && partBDeadline;
            default:
                return false;
        }
    };

    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await postData(`/managements/${managementId}/score`, {
                ...formValues,
                proposal_part_a_deadline: partADeadline,
                proposal_part_b_deadline: partBDeadline,
            });

            if (response && response.success) {
                toast({
                    title: "Configuración Enviada",
                    description: "La configuración de puntuación se guardó correctamente.",
                    variant: "success",
                    className: "bg-green-500 text-white",
                });
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
                window.location.reload(); // Reload the page
            } else {
                toast({
                    title: "Error al Enviar",
                    description: "Hubo un problema al enviar la configuración. Intenta de nuevo.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error de Conexión",
                description: "Hubo un error al intentar realizar la solicitud. Intenta nuevamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const stepComponents = [
            {
                title: "Paso 1: Puntos de Evaluación",
                description: "Ingresa el valor que asignarás a las calificaciones de los sprints, a la evaluación cruzada y cuánto valdrán las propuestas A y B.",
                reminder: "La suma total debe ser igual a 100.",
                inputs: [
                    { label: "Puntos de Sprint", name: "sprint_points" },
                    { label: "Puntos de Evaluación Cruzada", name: "cross_evaluation_points" },
                    { label: "Puntos de Propuesta", name: "proposal_points" }
                ],
                keys: ["sprint_points", "cross_evaluation_points", "proposal_points"]
            },
            {
                title: "Paso 2: Porcentajes de Sprint",
                description: "Asigna el valor que tendrá la calificación del sprint, las autoevaluaciones y la evaluación de pares en las notas.",
                reminder: "La suma total debe ser igual a 100.",
                inputs: [
                    { label: "Porcentaje de Sprint (Profesor)", name: "sprint_teacher_percentage" },
                    { label: "Porcentaje de Sprint (Autoevaluación)", name: "sprint_self_percentage" },
                    { label: "Porcentaje de Sprint (Evaluación de Pares)", name: "sprint_peer_percentage" }
                ],
                keys: ["sprint_teacher_percentage", "sprint_self_percentage", "sprint_peer_percentage"]
            },
            {
                title: "Paso 3: Porcentajes de Propuesta",
                description: "Ingresa el porcentaje de nota que valdrán las propuestas A y B.",
                reminder: "La suma total debe ser igual a 100.",
                inputs: [
                    { label: "Porcentaje Parte A Propuesta", name: "proposal_part_a_percentage" },
                    { label: "Porcentaje Parte B Propuesta", name: "proposal_part_b_percentage" }
                ],
                keys: ["proposal_part_a_percentage", "proposal_part_b_percentage"]
            },
            {
                title: "Paso 4: Fechas de Propuestas",
                description: "Ingresa la fecha de entrega para la parte A y B. Recuerda que no se aceptarán fechas en diferentes años o días que pertenezcan a otro semestre.",
                inputs: [
                    { label: "Fecha límite Parte A", value: partADeadline, onChange: handleDateChange(setPartADeadline) },
                    { label: "Fecha límite Parte B", value: partBDeadline, onChange: handleDateChange(setPartBDeadline) }
                ],
                isDate: true
            }
        ];

        const { title, description, reminder, inputs, keys, isDate } = stepComponents[currentStep];

        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-purple-700">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
                {reminder && <p className="text-sm text-gray-600 italic">{reminder}</p>}
                {inputs.map(({ label, name, value, onChange }) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-purple-700 mb-2">{label}</label>
                        {isDate ? (
                            <input
                                type="datetime-local"
                                value={value}
                                onChange={onChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                min={minDate}
                                max={maxDate}
                            />
                        ) : (
                            <Input
                                name={name}
                                type="number"
                                value={formValues[name]}
                                onChange={(e) => handleInputChange(e, keys)}
                                className="w-full border-purple-300"
                                min="1"
                                max="100"
                                placeholder="Ingresa un valor entre 1 y 100"
                            />
                        )}
                    </div>
                ))}
                {!isDate && (
                    <p className="text-sm text-gray-600">
                        Total: {keys.reduce((sum, key) => sum + parseInt(formValues[key] || 0), 0)}%
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-purple-700 font-bold text-2xl mb-6">Configurar Ponderaciones</h1>
            <form className="grid grid-cols-1 gap-6" onSubmit={(e) => { e.preventDefault(); setIsConfirmationDialogOpen(true); }}>
                {renderStep()}
                <div className="flex justify-between mt-4">
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            className="bg-purple-600 text-white hover:bg-purple-700"
                            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                        >
                            Anterior
                        </Button>
                    )}
                    {currentStep < 3 ? (
                        <Button
                            type="button"
                            className="bg-purple-600 text-white hover:bg-purple-700"
                            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
                            disabled={!isCurrentStepValid()}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button type="submit" className="bg-purple-600 text-white hover:bg-purple-700" disabled={!isFormValid || !partADeadline || !partBDeadline || isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Configuración"}
                        </Button>
                    )}
                </div>
            </form>

            <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmación</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro? Esto no puede cambiarse más adelante.</p>
                    <DialogFooter>
                        <Button onClick={() => setIsConfirmationDialogOpen(false)} className="bg-red-600 text-white hover:bg-red-700">Cancelar</Button>
                        <Button
                            onClick={async () => {
                                setIsConfirmationDialogOpen(false);
                                await handleFormSubmit();
                            }}
                            className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                            Aceptar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RatingsView;