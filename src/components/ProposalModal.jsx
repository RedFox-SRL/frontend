import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { postData, getData } from "../api/apiService";
import { Upload, Download, Trash, Loader, AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function ProposalModal({ isOpen, onClose }) {
    const [partAStatus, setPartAStatus] = useState("pending");
    const [partBStatus, setPartBStatus] = useState("pending");
    const [partAFileUrl, setPartAFileUrl] = useState(null);
    const [partBFileUrl, setPartBFileUrl] = useState(null);
    const [partAFile, setPartAFile] = useState(null);
    const [partBFile, setPartBFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, part: "" });

    const fetchProposalStatus = async () => {
        try {
            const response = await getData("/proposal-submission");
            if (response.success) {
                setPartAStatus(response.data.part_a.status);
                setPartBStatus(response.data.part_b.status);
                setPartAFileUrl(response.data.part_a.file_url || null);
                setPartBFileUrl(response.data.part_b.file_url || null);
            } else {
                setMessage({ type: "error", text: "Error al obtener el estado de las propuestas." });
                clearMessageAfterTimeout();
            }
        } catch (error) {
            setMessage({ type: "error", text: "Hubo un error al intentar obtener el estado de las propuestas." });
            clearMessageAfterTimeout();
        }
    };

    useEffect(() => {
        if (isOpen) fetchProposalStatus();
    }, [isOpen]);

    const handleFileChange = (e, part) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
                setMessage({ type: "error", text: "Formato de archivo incorrecto. Solo se permiten archivos PDF, DOC y DOCX." });
                clearMessageAfterTimeout();
            } else if (selectedFile.size > MAX_FILE_SIZE) {
                setMessage({ type: "error", text: "El archivo es demasiado grande. Máximo 10MB." });
                clearMessageAfterTimeout();
            } else {
                if (part === "partA") {
                    setPartAFile(selectedFile);
                } else {
                    setPartBFile(selectedFile);
                }
                setMessage({ type: "", text: "" });
            }
        }
    };

    const handleRemoveFile = (part) => {
        if (part === "partA") {
            setPartAFile(null);
        } else {
            setPartBFile(null);
        }
        setMessage({ type: "", text: "" });
    };

    const handleUpload = async (part) => {
        const file = part === "partA" ? partAFile : partBFile;
        if (!file) {
            setMessage({ type: "error", text: "Por favor, selecciona un archivo para subir." });
            clearMessageAfterTimeout();
            return;
        }

        setConfirmDialog({ isOpen: true, part });
    };

    const confirmUpload = async () => {
        const { part } = confirmDialog;
        const file = part === "partA" ? partAFile : partBFile;

        setLoading(true);
        setConfirmDialog({ isOpen: false, part: "" });

        try {
            const formData = new FormData();
            formData.append("file", file);

            const endpoint = part === "partA" ? "/proposal-submission/part-a" : "/proposal-submission/part-b";

            const response = await postData(endpoint, formData);

            if (response.success) {
                setMessage({ type: "success", text: `Parte ${part === "partA" ? "A" : "B"} subida exitosamente.` });
                handleRemoveFile(part);
                fetchProposalStatus();
            } else {
                setMessage({ type: "error", text: response.message || "Hubo un problema al subir el archivo." });
            }
            clearMessageAfterTimeout();
        } catch (error) {
            setMessage({ type: "error", text: "Hubo un error al intentar subir el archivo." });
            clearMessageAfterTimeout();
        } finally {
            setLoading(false);
        }
    };

    const clearMessageAfterTimeout = () => {
        setTimeout(() => {
            setMessage({ type: "", text: "" });
        }, 5000);
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
                                <div className="flex flex-col items-center space-y-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e, "partA")}
                                        accept=".pdf, .doc, .docx"
                                        className="hidden"
                                        id="partAFileInput"
                                    />
                                    <Upload
                                        className="text-purple-600 h-16 w-16 cursor-pointer"
                                        onClick={() => document.getElementById("partAFileInput").click()}
                                    />
                                    {partAFile && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-700">{partAFile.name}</span>
                                            <Trash
                                                className="text-red-600 h-5 w-5 cursor-pointer"
                                                onClick={() => handleRemoveFile("partA")}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {partAStatus === "pending" && !partAFileUrl && (
                                <Button
                                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => handleUpload("partA")}
                                    disabled={!partAFile || loading}
                                >
                                    {loading && confirmDialog.part === "partA" ? (
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Subir Parte A"
                                    )}
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
                                <div className="flex flex-col items-center space-y-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e, "partB")}
                                        accept=".pdf, .doc, .docx"
                                        className="hidden"
                                        id="partBFileInput"
                                    />
                                    <Upload
                                        className="text-purple-600 h-16 w-16 cursor-pointer"
                                        onClick={() => document.getElementById("partBFileInput").click()}
                                    />
                                    {partBFile && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-700">{partBFile.name}</span>
                                            <Trash
                                                className="text-red-600 h-5 w-5 cursor-pointer"
                                                onClick={() => handleRemoveFile("partB")}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {partBStatus === "pending" && !partBFileUrl && (
                                <Button
                                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => handleUpload("partB")}
                                    disabled={!partBFile || loading}
                                >
                                    {loading && confirmDialog.part === "partB" ? (
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Subir Parte B"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {message.text && (
                    <div className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"} text-center mt-4`}>
                        {message.text}
                    </div>
                )}
                <DialogFooter className="flex flex-col space-y-4 items-center">
                    <span className="text-sm text-gray-600">
                        Puedes continuar con tu trabajo y subir después las propuestas, pero no olvides que tienes una fecha límite en el inicio.
                    </span>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>

            {confirmDialog.isOpen && (
                <Dialog open={confirmDialog.isOpen} onOpenChange={() => setConfirmDialog({ isOpen: false, part: "" })}>
                    <DialogContent className="max-w-md mx-auto p-6">
                        <DialogHeader>
                            <DialogTitle>Confirmar Subida</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <AlertTriangle className="h-16 w-16 text-yellow-600" />
                            <p className="text-center">
                                ¿Estás seguro de que quieres subir la Parte {confirmDialog.part === "partA" ? "A" : "B"}? No podrás cancelar el envío después de confirmar.
                            </p>
                        </div>
                        <DialogFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, part: "" })}>
                                Cancelar
                            </Button>
                            <Button
                                className="bg-purple-600 text-white hover:bg-purple-700"
                                onClick={confirmUpload}
                            >
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}