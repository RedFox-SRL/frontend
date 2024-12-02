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
import { postData, getData } from "../api/apiService";
import { Upload, Download } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ProposalModal({ isOpen, onClose }) {
    const [partAStatus, setPartAStatus] = useState("pending");
    const [partBStatus, setPartBStatus] = useState("pending");
    const [partAFileUrl, setPartAFileUrl] = useState(null);
    const [partBFileUrl, setPartBFileUrl] = useState(null);
    const [file, setFile] = useState(null);
    const { toast } = useToast();

    const fetchProposalStatus = async () => {
        try {
            const response = await getData("/proposal-submission");
            if (response.success) {
                setPartAStatus(response.data.part_a.status);
                setPartBStatus(response.data.part_b.status);
                setPartAFileUrl(response.data.part_a.file_url || null);
                setPartBFileUrl(response.data.part_b.file_url || null);
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
                description: "Hubo un error al intentar obtener el estado de las propuestas.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (isOpen) fetchProposalStatus();
    }, [isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > MAX_FILE_SIZE) {
                toast({
                    title: "Error",
                    description: "El archivo es demasiado grande. Máximo 10MB.",
                    variant: "destructive",
                });
            } else {
                setFile(selectedFile);
            }
        }
    };

    const handleUpload = async (part) => {
        if (!file) {
            toast({
                title: "Error",
                description: "Por favor, selecciona un archivo para subir.",
                variant: "destructive",
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            const endpoint =
                part === "partA"
                    ? "/proposal-submission/part-a"
                    : "/proposal-submission/part-b";

            const response = await postData(endpoint, formData);

            if (response.success) {
                toast({
                    title: "Éxito",
                    description: `Parte ${part === "partA" ? "A" : "B"} subida exitosamente.`,
                    variant: "success",
                    className: "bg-green-500 text-white",
                });
                setFile(null);
                fetchProposalStatus();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Hubo un problema al subir el archivo.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un error al intentar subir el archivo.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg mx-auto overflow-y-auto max-h-[80vh] p-6 space-y-4">
                <DialogHeader>
                    <DialogTitle>Gestión de Propuestas</DialogTitle>
                </DialogHeader>
                <div>
                    <h3 className="text-lg font-semibold text-purple-700">
                        {partAStatus === "submitted" && partBStatus === "pending"
                            ? "Parte A subida, falta la Parte B"
                            : partAStatus === "pending" && partBStatus === "pending"
                                ? "Debes subir la Parte A y la Parte B"
                                : "Ambas propuestas están subidas"}
                    </h3>
                    <div className="flex space-x-6 mt-4">
                        {/* Parte A */}
                        <div className="flex flex-col items-center space-y-2 w-full md:w-1/2">
                            {partAFileUrl ? (
                                <div className="flex items-center space-x-2">
                                    <a
                                        href={partAFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:underline text-sm"
                                    >
                                        Descargar Parte A
                                    </a>
                                    <Download className="text-purple-600 h-8 w-8 cursor-pointer" />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf, .doc, .docx"
                                        className="hidden"
                                    />
                                    <Upload
                                        className="text-purple-600 h-16 w-16 cursor-pointer"
                                        onClick={() => document.querySelector("input[type='file']").click()}
                                    />
                                </div>
                            )}
                            {partAStatus === "pending" && !partAFileUrl && (
                                <Button
                                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => handleUpload("partA")}
                                    disabled={!file}
                                >
                                    Subir Parte A
                                </Button>
                            )}
                        </div>

                        {/* Parte B */}
                        <div className="flex flex-col items-center space-y-2 w-full md:w-1/2">
                            {partBFileUrl ? (
                                <div className="flex items-center space-x-2">
                                    <a
                                        href={partBFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:underline text-sm"
                                    >
                                        Descargar Parte B
                                    </a>
                                    <Download className="text-purple-600 h-8 w-8 cursor-pointer" />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf, .doc, .docx"
                                        className="hidden"
                                    />
                                    <Upload
                                        className="text-purple-600 h-16 w-16 cursor-pointer"
                                        onClick={() => document.querySelector("input[type='file']").click()}
                                    />
                                </div>
                            )}
                            {partBStatus === "pending" && !partBFileUrl && (
                                <Button
                                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => handleUpload("partB")}
                                    disabled={!file}
                                >
                                    Subir Parte B
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
