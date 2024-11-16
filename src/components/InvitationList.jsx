// src/components/InvitationList.jsx
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { getData, deleteData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const InvitationList = forwardRef(({ groupId }, ref) => {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useImperativeHandle(ref, () => ({
        fetchInvitations,
    }));

    useEffect(() => {
        fetchInvitations();
    }, [groupId]);

    const fetchInvitations = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/groups/${groupId}/invitations`);
            if (response.success && response.data && Array.isArray(response.data.invitations)) {
                setInvitations(response.data.invitations);
            } else {
                console.error("Unexpected response structure:", response);
                toast({
                    title: "Error",
                    description: "La estructura de la respuesta es inesperada.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error fetching invitations:", error);
            handleBackendError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackendError = (error) => {
        const errorCode = error.response?.data?.code;

        switch (errorCode) {
            case 313: // STUDENT_NOT_FOUND
                toast({
                    title: "Error",
                    description: "El estudiante invitado no fue encontrado.",
                    variant: "destructive",
                });
                break;
            case 268: // GROUP_FULL
                toast({
                    title: "Error",
                    description: "El grupo ya está lleno. No se pueden enviar más invitaciones.",
                    variant: "destructive",
                });
                break;
            case 310: // INVITATION_ALREADY_SENT
                toast({
                    title: "Error",
                    description: "Ya se envió una invitación pendiente a este estudiante.",
                    variant: "destructive",
                });
                break;
            case 309: // MAX_INVITATIONS_REACHED
                toast({
                    title: "Error",
                    description: "Se ha alcanzado el número máximo de invitaciones pendientes.",
                    variant: "destructive",
                });
                break;
            case 314: // STUDENT_NOT_IN_SAME_MANAGEMENT
                toast({
                    title: "Error",
                    description: "El estudiante no pertenece a la misma gestión que el grupo.",
                    variant: "destructive",
                });
                break;
            default:
                toast({
                    title: "Error",
                    description: "Ocurrió un error al cargar las invitaciones.",
                    variant: "destructive",
                });
                break;
        }
    };

    const handleDeleteInvitation = async () => {
        if (!selectedInvitation) return;

        try {
            const response = await deleteData(`/invitations/${selectedInvitation.id}`);
            if (response.success) {
                setInvitations((prevInvitations) =>
                    prevInvitations.filter((invitation) => invitation.id !== selectedInvitation.id)
                );
                toast({
                    title: "Invitación eliminada",
                    description: "La invitación ha sido eliminada exitosamente.",
                    className: "bg-green-500 text-white",
                });
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la invitación.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting invitation:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error al eliminar la invitación.",
                variant: "destructive",
            });
        } finally {
            setIsDialogOpen(false);
            setSelectedInvitation(null);
        }
    };

    const filteredInvitations = invitations.filter((invitation) =>
        filter === "all" ? true : invitation.status === filter
    );

    const getFilterLabel = () => {
        switch (filter) {
            case "pending":
                return "pendiente";
            case "accepted":
                return "aceptada";
            case "rejected":
                return "rechazada";
            default:
                return "";
        }
    };

    return (
        <Card className="w-full bg-white rounded-lg shadow-lg mt-6">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 py-3 px-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Estado de Invitaciones</h3>
                    <Select onValueChange={setFilter} defaultValue="all" className="w-20">
                        <SelectTrigger className="bg-white text-purple-800 border-purple-300 rounded-md shadow-md hover:bg-purple-300 transition-all duration-200 w-32">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="pending">Pendientes</SelectItem>
                            <SelectItem value="accepted">Aceptadas</SelectItem>
                            <SelectItem value="rejected">Rechazadas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                ) : filteredInvitations.length > 0 ? (
                    <ul className="space-y-4">
                        {filteredInvitations.map((invitation, index) => (
                            <li
                                key={invitation.id}
                                className="p-4 bg-purple-50 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-purple-100"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <p className="text-purple-800 font-semibold">
                                    Invitado: <span className="font-normal">{invitation.invited_student.user.name} {invitation.invited_student.user.last_name}</span>
                                </p>
                                <p className="text-purple-700">
                                    Email: <span className="font-normal">{invitation.invited_student.user.email}</span>
                                </p>
                                <p className="text-purple-800 font-semibold">
                                    Estado:
                                    <span className={`ml-2 px-3 py-1 rounded-full font-semibold ${
                                        invitation.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                            : invitation.status === "accepted"
                                                ? "bg-green-100 text-green-800 border border-green-300"
                                                : "bg-red-100 text-red-800 border border-red-300"
                                    }`}>
                    {invitation.status === "pending" ? "Pendiente" : invitation.status === "accepted" ? "Aceptada" : "Rechazada"}
                  </span>
                                </p>
                                {invitation.status === "pending" && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                            setSelectedInvitation(invitation);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar Invitación
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-500">
                        {filter === "all"
                            ? "No hay ninguna invitación enviada."
                            : `No hay ninguna invitación ${getFilterLabel()} actualmente.`}
                    </div>
                )}
            </CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro de que deseas eliminar esta invitación pendiente?</p>
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteInvitation} variant="destructive">
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
});

export default InvitationList;
