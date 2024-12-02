import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getData } from "../api/apiService";

export default function ProposalsViewer({ isOpen, onClose }) {
    const [partAStatus, setPartAStatus] = useState("pending");
    const [partBStatus, setPartBStatus] = useState("pending");
    const [partAFileUrl, setPartAFileUrl] = useState(null);
    const [partBFileUrl, setPartBFileUrl] = useState(null);
    const { toast } = useToast();

    const fetchProposalStatus = async () => {
        try {
            const response = await getData("/proposal-submission");
            if (response.success) {
                const { part_a, part_b } = response.data;

                setPartAStatus(part_a.status);
                setPartBStatus(part_b.status);

                if (part_a.status === "submitted") {
                    setPartAFileUrl(part_a.file_url);
                }
                if (part_b.status === "submitted") {
                    setPartBFileUrl(part_b.file_url);
                }
            } else {
                toast({
                    title: "Error",
                    description: "Error al obtener el estado de las propuestas.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Ocurrió un problema al cargar las propuestas.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProposalStatus();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg mx-auto overflow-y-auto max-h-[80vh] p-6 space-y-6 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">Propuestas del Grupo</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Parte A */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">Parte A</h3>
                        {partAStatus === "pending" ? (
                            <p className="text-red-600 text-sm mt-2">
                                La Parte A está pendiente. Comunícate con el representante legal.
                            </p>
                        ) : (
                            <div className="flex items-center space-x-2 mt-2">
                                <a
                                    href={partAFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Descargar Parte A
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Parte B */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">Parte B</h3>
                        {partBStatus === "pending" ? (
                            <p className="text-red-600 text-sm mt-2">
                                La Parte B está pendiente. Comunícate con el representante legal.
                            </p>
                        ) : (
                            <div className="flex items-center space-x-2 mt-2">
                                <a
                                    href={partBFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Descargar Parte B
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="text-gray-800 border-gray-300 hover:bg-gray-100">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
