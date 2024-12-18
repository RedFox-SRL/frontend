import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getData, postData } from "../api/apiService";
import { useToast } from "@/hooks/use-toast";

export default function ProposalsView({ onBack, managementId }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partAScore, setPartAScore] = useState("");
    const [partBScore, setPartBScore] = useState("");
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

    const handleEvaluationSubmit = async (groupId, part, score) => {
        if (score < 0 || score > 100 || isNaN(score)) {
            toast({
                title: "Error",
                description: "La calificación debe ser un número entre 0 y 100.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await postData(`/proposal/${groupId}/${part}`, { score });
            if (response.success) {
                toast({
                    title: "Evaluación Enviada",
                    description: "La evaluación se ha enviado correctamente.",
                    variant: "default",
                });
                const updatedResponse = await getData(`/proposal/${managementId}/proposal-submissions`);
                setGroups(updatedResponse.data.items);
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
        }
    };

    if (loading) {
        return <div className="fixed inset-0 bg-white z-50 flex justify-center items-center">Cargando...</div>;
    }

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4 sm:p-6">
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>

            <h3 className="text-2xl font-bold text-purple-700 mb-6">Propuestas de Grupos</h3>

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
                                <a
                                    href={group.part_a.file_url || "#"}
                                    target="_blank"
                                    className={`text-sm ${group.part_a.status === 'submitted' ? 'text-yellow-500' : 'text-green-500'} hover:underline`}
                                >
                                    {group.part_a.status === 'submitted' ? 'Descargar' : 'Pendiente'}
                                </a>
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
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Puntaje"
                                        className="border p-2 rounded-md"
                                        value={partAScore}
                                        onChange={(e) => setPartAScore(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleEvaluationSubmit(group.group_id, 'a', partAScore)}
                                        className="bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                        Enviar Evaluación
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold">Parte B</span>
                                <a
                                    href={group.part_b.file_url || "#"}
                                    target="_blank"
                                    className={`text-sm ${group.part_b.status === 'submitted' ? 'text-yellow-500' : 'text-green-500'} hover:underline`}
                                >
                                    {group.part_b.status === 'submitted' ? 'Descargar' : 'Pendiente'}
                                </a>
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
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Puntaje"
                                        className="border p-2 rounded-md"
                                        value={partBScore}
                                        onChange={(e) => setPartBScore(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleEvaluationSubmit(group.group_id, 'b', partBScore)}
                                        className="bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                        Enviar Evaluación
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

ProposalsView.propTypes = {
    onBack: PropTypes.func.isRequired,
    managementId: PropTypes.string.isRequired,
};