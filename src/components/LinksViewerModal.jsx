import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getData } from "../api/apiService";

const CATEGORIES = [
    { value: "documentation", label: "Documentación" },
    { value: "source_code", label: "Código Fuente" },
    { value: "deployment", label: "Despliegue" },
    { value: "design", label: "Diseño" },
    { value: "presentation", label: "Presentación" },
    { value: "report", label: "Informe" },
    { value: "credentials", label: "Credenciales" },
    { value: "other", label: "Otro" },
];

export default function LinksViewerModal({ isOpen, onClose }) {
    const [links, setLinks] = useState([]);
    const { toast } = useToast();

    const fetchLinks = async () => {
        try {
            const response = await getData("/project-links");
            setLinks(response.data?.links || []);
        } catch (error) {
            console.error("Error fetching links:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los enlaces.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLinks();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white border-2 border-purple-500 rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-purple-700">Enlaces del Proyecto</DialogTitle>
                </DialogHeader>
                <div>
                    {links.length > 0 ? (
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li
                                    key={link.id}
                                    className="flex flex-col bg-purple-50 p-3 rounded-lg shadow"
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-purple-800 hover:underline"
                                    >
                                        {link.url}
                                    </a>
                                    <p className="text-xs text-purple-600">
                                        {CATEGORIES.find((cat) => cat.value === link.category)?.label || "Otro"}{" "}
                                        - {link.description || "Sin descripción"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-purple-600">No hay enlaces subidos por el momento.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
