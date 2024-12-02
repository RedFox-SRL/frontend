import { useEffect, useState } from 'react';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getData, postData } from "../api/apiService"; // Importa también la función POST
import { useToast } from "@/hooks/use-toast"; // Importa el hook de toast

export default function ProposalsView({ onBack, managementId }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partAScore, setPartAScore] = useState("");
    const [partBScore, setPartBScore] = useState("");
    const { toast } = useToast(); // Inicializa el hook de toast

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await getData(`/proposal/${managementId}/proposal-submissions`);
                setGroups(response.data.items); // Ajusta según la estructura de la respuesta
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
                // Recargar los datos después de enviar la evaluación
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
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white space-y-6">
            {/* Botón para retroceder */}
            <button onClick={onBack} className="flex items-center text-purple-600 mb-4">
                <ArrowLeft className="mr-2" /> Retroceder
            </button>

            <h1 className="text-2xl font-bold text-purple-700 mb-6">Propuestas de Grupos</h1>

            {/* Listado de grupos */}
            {groups.map((group) => (
                <div key={group.group_id} className="mb-4 border border-purple-200 rounded-md">
                    {/* Cabecera del grupo */}
                    <div className="flex items-center justify-between p-4 bg-purple-100 rounded-t-md">
                        <h3 className="text-lg font-bold text-purple-700">{group.short_name}</h3>
                    </div>

                    {/* Detalles del grupo */}
                    <div className="p-4 space-y-4">
                        {/* Información del representante */}
                        <div className="flex flex-col space-y-2">
                            <span className="font-semibold text-purple-700">Representante Legal:</span>
                            <span className="text-purple-600">{group.representative.name} {group.representative.last_name}</span>
                            <span className="text-purple-500">{group.representative.email}</span>
                        </div>

                        {/* Progreso de las partes */}
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
                                // Mostrar el puntaje si ya fue evaluado
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-semibold text-green-500">Puntaje: {group.part_a.score}</span>
                                </div>
                            ) : group.part_a.status === 'submitted' ? (
                                // Mostrar la caja para ingresar el puntaje y el botón de envío
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
                                // Mostrar el puntaje si ya fue evaluado
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-semibold text-green-500">Puntaje: {group.part_b.score}</span>
                                </div>
                            ) : group.part_b.status === 'submitted' ? (
                                // Mostrar la caja para ingresar el puntaje y el botón de envío
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
