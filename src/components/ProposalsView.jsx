import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getData, postData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProposalsView({ onBack, managementId }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partAScore, setPartAScore] = useState("");
    const [partBScore, setPartBScore] = useState("");
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [currentPart, setCurrentPart] = useState("");
    const [currentScore, setCurrentScore] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await getData(`/proposal/${managementId}/proposal-submissions`);
                setGroups(response.data.items);
            } catch (error) {
                console.error('Error fetching proposals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [managementId]);

    const handleEvaluationSubmit = async () => {
        setIsLoadingSubmit(true);

        try {
            const response = await postData(`/proposal/${currentGroup}/${currentPart}`, { score: currentScore });
            if (response.success) {
                toast({
                    title: "Evaluación Enviada",
                    description: "La evaluación se ha enviado correctamente.",
                    variant: "default",
                    className: "bg-green-500 text-white",
                });
                const updatedResponse = await getData(`/proposal/${managementId}/proposal-submissions`);
                setGroups(updatedResponse.data.items);
                setPartAScore("");
                setPartBScore("");
            } else {
                toast({
                    title: "Error",
                    description: "Hubo un problema al enviar la evaluación.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            toast({
                title: "Error",
                description: "Hubo un error al enviar la evaluación.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingSubmit(false);
            setIsConfirmDialogOpen(false);
        }
    };

    const handleScoreChange = (setter) => (e) => {
        const value = e.target.value;
        if (value === "" || /^[0-9\b]+$/.test(value)) {
            if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                setter(value);
            }
        }
    };

    const openConfirmDialog = (groupId, part, score) => {
        if (score === "" || isNaN(score) || parseInt(score) < 0 || parseInt(score) > 100) {
            toast({
                title: "Error",
                description: "La calificación debe ser un número entre 0 y 100.",
                variant: "destructive",
            });
            return;
        }

        setCurrentGroup(groupId);
        setCurrentPart(part);
        setCurrentScore(score);
        setIsConfirmDialogOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">Cargando...</div>;
    }

    return (
        <div className="bg-white overflow-auto p-4 sm:p-6">
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-purple-700">Propuestas de Grupos</h3>
                <button onClick={() => setIsHelpDialogOpen(true)} className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white">
                    <HelpCircle className="h-6 w-6" />
                </button>
            </div>

            {groups.map((group) => (
                <div key={group.group_id} className="mb-4 border border-purple-200 rounded-md">
                    <div className="flex items-center justify-between p-4 bg-purple-100 rounded-t-md">
                        <h4 className="text-lg font-bold text-purple-700">{group.short_name}</h4>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <span className="font-semibold text-purple-700">Representante Legal:</span>
                            <span className="text-purple-600">{group.representative.name} {group.representative.last_name}</span>
                            <span className="text-purple-500">{group.representative.email}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold">Parte A</span>
                                {group.part_a.status === 'submitted' ? (
                                    <a
                                        href={group.part_a.file_url || "#"}
                                        target="_blank"
                                        className="text-sm text-yellow-500 hover:underline"
                                    >
                                        Descargar
                                    </a>
                                ) : (
                                    <span className="text-sm text-green-500">Pendiente</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <span>Enviado el: {group.part_a.submitted_at ? new Date(group.part_a.submitted_at).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            {group.part_a.status === 'submitted' && group.part_a.score !== undefined ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-semibold text-green-500">Puntaje: {group.part_a.score}</span>
                                </div>
                            ) : group.part_a.status === 'submitted' ? (
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="text"
                                        placeholder="Puntaje"
                                        className="border p-2 rounded-md w-20"
                                        value={partAScore}
                                        onChange={handleScoreChange(setPartAScore)}
                                    />
                                    <Button
                                        onClick={() => openConfirmDialog(group.group_id, 'a', partAScore)}
                                        className="bg-purple-600 text-white hover:bg-purple-700"
                                        disabled={partAScore === ""}
                                    >
                                        Enviar Evaluación
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold">Parte B</span>
                                {group.part_b.status === 'submitted' ? (
                                    <a
                                        href={group.part_b.file_url || "#"}
                                        target="_blank"
                                        className="text-sm text-yellow-500 hover:underline"
                                    >
                                        Descargar
                                    </a>
                                ) : (
                                    <span className="text-sm text-green-500">Pendiente</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <span>Enviado el: {group.part_b.submitted_at ? new Date(group.part_b.submitted_at).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            {group.part_b.status === 'submitted' && group.part_b.score !== undefined ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-semibold text-green-500">Puntaje: {group.part_b.score}</span>
                                </div>
                            ) : group.part_b.status === 'submitted' ? (
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="text"
                                        placeholder="Puntaje"
                                        className="border p-2 rounded-md w-20"
                                        value={partBScore}
                                        onChange={handleScoreChange(setPartBScore)}
                                    />
                                    <Button
                                        onClick={() => openConfirmDialog(group.group_id, 'b', partBScore)}
                                        className="bg-purple-600 text-white hover:bg-purple-700"
                                        disabled={partBScore === ""}
                                    >
                                        Enviar Evaluación
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}

            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Acción</DialogTitle>
                    </DialogHeader>
                    <p>¿Está seguro de que desea enviar esta evaluación? No se puede revertir después.</p>
                    <DialogFooter>
                        <Button onClick={() => setIsConfirmDialogOpen(false)}  className="bg-red-600 hover:bg-red-700 text-white" variant="outline">
                            Cancelar
                        </Button>
                        <Button onClick={handleEvaluationSubmit} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {isLoadingSubmit ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reglas del Formulario</DialogTitle>
                    </DialogHeader>
                    <p>Para usar este formulario:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>El campo de puntaje solo permite números entre 0 y 100.</li>
                        <li>Solo debes ingresar el puntaje.</li>
                        <li>Asegúrate de revisar bien antes de enviar la evaluación.</li>
                        <li>El valor que tendra en las propuestas sera de acuerdo al porcentaje establecido al crear la gestion</li>
                    </ul>
                    <DialogFooter>
                        <Button onClick={() => setIsHelpDialogOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ProposalsView.propTypes = {
    onBack: PropTypes.func.isRequired,
    managementId: PropTypes.string.isRequired,
};