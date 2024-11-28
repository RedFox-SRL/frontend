import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getData, postData, putData, deleteData } from "../api/apiService";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";

const CATEGORIES = [
    { value: "documentation", label: "Documentación", description: "Manuales técnicos, guías de usuario, documentación de API, etc." },
    { value: "source_code", label: "Código Fuente", description: "Enlaces a repositorios o archivos de código fuente." },
    { value: "deployment", label: "Despliegue", description: "URLs de la aplicación desplegada, servicios en la nube, etc." },
    { value: "design", label: "Diseño", description: "Documentos de diseño, mockups, diagramas, etc." },
    { value: "presentation", label: "Presentación", description: "Diapositivas, videos de demostración, pósters, etc." },
    { value: "report", label: "Informe", description: "Informes finales, documentos de análisis, etc." },
    { value: "credentials", label: "Credenciales", description: "Información de acceso, claves de API, etc." },
    { value: "other", label: "Otro", description: "Cualquier recurso que no encaje en las categorías anteriores." },
];

export default function LinksManagerModal({ isOpen, onClose }) {
    const [links, setLinks] = useState([]);
    const [linkForm, setLinkForm] = useState({ url: "", category: "", description: "" });
    const [editingLinkId, setEditingLinkId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState(null);
    const [filterCategory, setFilterCategory] = useState(""); // Filtro de categorías
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

    const handleSave = async () => {
        if (!linkForm.url || !linkForm.category) {
            toast({
                title: "Error",
                description: "Los campos URL y categoría son obligatorios.",
                variant: "destructive",
                duration: 3000,
            });
            return;
        }

        try {
            if (editingLinkId) {
                await putData(`/project-links/${editingLinkId}`, linkForm);
                toast({
                    title: "Éxito",
                    description: "Enlace actualizado exitosamente.",
                    duration: 3000,
                    className: "bg-green-500 text-white",
                });
            } else {
                await postData("/project-links", { links: [linkForm] });
                toast({
                    title: "Éxito",
                    description: "Enlace añadido exitosamente.",
                    duration: 3000,
                    className: "bg-green-500 text-white",
                });
            }

            resetForm();
            fetchLinks();
        } catch (error) {
            console.error("Error saving link:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar el enlace.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleEdit = (link) => {
        setLinkForm(link);
        setEditingLinkId(link.id);
        setIsAdding(true);
    };

    const handleDelete = async () => {
        try {
            await deleteData(`/project-links/${linkToDelete}`);
            toast({
                title: "Éxito",
                description: "Enlace eliminado exitosamente.",
                duration: 3000,
                className: "bg-green-500 text-white",
            });
            setIsDeleteConfirmationOpen(false);
            fetchLinks();
        } catch (error) {
            console.error("Error deleting link:", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el enlace.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const resetForm = () => {
        setLinkForm({ url: "", category: "", description: "" });
        setEditingLinkId(null);
        setIsAdding(false);
    };

    const handleCancel = () => {
        if (links.length === 0) {
            onClose(); // Cierra el modal si no hay enlaces
        } else {
            setIsCancelConfirmationOpen(true); // Abre el diálogo de confirmación
        }
    };

    const confirmCancel = () => {
        setIsCancelConfirmationOpen(false);
        resetForm();
    };

    const handleOpenDeleteConfirmation = (linkId) => {
        setLinkToDelete(linkId);
        setIsDeleteConfirmationOpen(true);
    };

    const filteredLinks = links.filter((link) => filterCategory === "" || link.category === filterCategory);

    useEffect(() => {
        if (isOpen) {
            fetchLinks();
            resetForm();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white border-2 border-purple-500 rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-purple-700">Gestión de Enlaces del Proyecto</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="">Todas las Categorías</option>
                        {CATEGORIES.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                {links.length === 0 || isAdding ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-800">
                            {editingLinkId ? "Editar Enlace" : "Añadir Nuevo Enlace"}
                        </h3>
                        <Input
                            placeholder="URL"
                            value={linkForm.url}
                            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                            className="border border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <select
                            value={linkForm.category}
                            onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                            className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="" disabled>
                                Seleccionar Categoría
                            </option>
                            {CATEGORIES.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <Textarea
                            placeholder="Descripción (opcional)"
                            value={linkForm.description}
                            onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                            className="border border-purple-300 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <DialogFooter>
                            <Button
                                onClick={handleCancel}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="bg-purple-600 text-white hover:bg-purple-700">
                                {editingLinkId ? "Guardar Cambios" : "Añadir Enlace"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Enlaces Existentes</h3>
                        {/* SCROLL PARA LISTA DE ENLACES */}
                        <div className="max-h-64 overflow-y-auto">
                            {filteredLinks.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredLinks.map((link) => (
                                        <li
                                            key={link.id}
                                            className="flex justify-between items-center bg-purple-50 p-3 rounded-lg shadow"
                                        >
                                            <div>
                                                {/* LIMITAR LONGITUD DE URL CON "..." */}
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-purple-800 hover:underline truncate max-w-xs block"
                                                    style={{ wordBreak: "break-word" }}
                                                >
                                                    {link.url.length > 50
                                                        ? `${link.url.substring(0, 47)}...`
                                                        : link.url}
                                                </a>
                                                <p className="text-xs text-purple-600">
                                                    {CATEGORIES.find((cat) => cat.value === link.category)?.label || "Otro"}{" "}
                                                    - {link.description || "Sin descripción"}
                                                </p>
                                            </div>
                                            <div className="space-x-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(link)}
                                                    className="hover:bg-purple-100"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDeleteConfirmation(link.id)}
                                                    className="hover:bg-purple-100"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                /* MENSAJE SI NO HAY ENLACES EN UNA CATEGORÍA */
                                <p className="text-sm text-purple-600">No hay enlaces disponibles.</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full mt-4 bg-purple-600 text-white hover:bg-purple-700"
                                onClick={() => setIsAdding(true)}
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Añadir Nuevo Enlace
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>

            {/* Confirmación de Cancelar */}
            <Dialog open={isCancelConfirmationOpen} onOpenChange={setIsCancelConfirmationOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">¿Seguro que quieres cancelar?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Los cambios realizados no serán guardados si cancelas esta operación.
                    </p>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsCancelConfirmationOpen(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                        >
                            Volver
                        </Button>
                        <Button
                            onClick={confirmCancel}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Cancelar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmación de Eliminar */}
            <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">¿Seguro que quieres eliminar este enlace?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Esta acción no se puede deshacer. El enlace será eliminado permanentemente.
                    </p>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsDeleteConfirmationOpen(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
