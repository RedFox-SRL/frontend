import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Hash, Copy, Edit2, Check, X, Settings, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { putData } from '../api/apiService';
import ReportView from './ReportView'; // Importamos el componente de reportes

export default function GroupDetailCreator({ selectedGroup, onUpdateGroup }) {
    const [groupData, setGroupData] = useState({
        contact_email: selectedGroup.contact_email,
        contact_phone: selectedGroup.contact_phone,
    });
    const [errors, setErrors] = useState({});
    const [editingField, setEditingField] = useState(null);
    const [originalData, setOriginalData] = useState({
        contact_email: selectedGroup.contact_email,
        contact_phone: selectedGroup.contact_phone,
    });
    const [isViewingReport, setIsViewingReport] = useState(false); // Estado para ver la vista de reportes
    const { toast } = useToast();
    const reportRef = useRef(null); // Referencia para el componente de reportes
    const topRef = useRef(null); // Referencia para la parte superior de la página

    useEffect(() => {
        setGroupData({
            contact_email: selectedGroup.contact_email,
            contact_phone: selectedGroup.contact_phone,
        });
        setOriginalData({
            contact_email: selectedGroup.contact_email,
            contact_phone: selectedGroup.contact_phone,
        });
        setIsViewingReport(false); // Resetear la vista de reportes al seleccionar un nuevo grupo
    }, [selectedGroup]);

    const validateField = (field, value) => {
        if (!value.trim()) {
            return "Este campo no puede estar vacío";
        }
        if (field === 'contact_phone' && !/^[67]\d{7}$/.test(value)) {
            return "Ingrese un número válido de Bolivia (8 dígitos, comenzando con 6 o 7)";
        }
        if (field === 'contact_email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Ingrese un correo electrónico válido";
        }
        return null;
    };

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleCancel = () => {
        setGroupData(prevData => ({
            ...prevData,
            [editingField]: originalData[editingField]
        }));
        setEditingField(null);
        setErrors({});
    };

    const handleSave = async (field) => {
        const newValue = groupData[field];
        const error = validateField(field, newValue);
        if (error) {
            setErrors({ [field]: error });
            return;
        }

        try {
            const response = await putData('/groups/contact-info', { [field]: newValue });
            if (response.success) {
                setOriginalData(prevData => ({
                    ...prevData,
                    [field]: newValue
                }));
                toast({
                    title: "Éxito",
                    description: "Información actualizada exitosamente.",
                    duration: 3000,
                });
                setEditingField(null);
                onUpdateGroup();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "No se pudo actualizar la información.",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error al actualizar la información:', error);
            toast({
                title: "Error",
                description: "Ocurrió un error al actualizar la información.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGroupData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setErrors({});
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copiado",
                description: "Código copiado al portapapeles",
                duration: 3000,
            });
        }, (err) => {
            console.error('Error al copiar: ', err);
        });
    };

    const renderEditableField = (field, icon) => {
        const isEditing = editingField === field;
        const displayValue = groupData[field] || originalData[field] || 'No especificado';
        return (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 transition-all duration-300 hover:bg-gray-200">
                {icon}
                {isEditing ? (
                    <div className="flex-grow flex items-center space-x-2">
                        <Input
                            type={field === 'contact_email' ? 'email' : 'tel'}
                            name={field}
                            value={groupData[field] || ''}
                            onChange={handleInputChange}
                            className="flex-grow bg-white text-gray-800 text-sm h-8 border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                        />
                        <Button onClick={() => handleSave(field)} size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-100">
                            <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button onClick={handleCancel} size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-100">
                            <X className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-between">
                        <span className="text-sm text-gray-700">{displayValue}</span>
                        <Button onClick={() => handleEdit(field)} size="icon" variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-100">
                            <Edit2 className="h-4 w-4 text-purple-600" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    // Función para manejar la vista de reportes y hacer scroll al componente
    const handleViewReport = () => {
        setIsViewingReport(!isViewingReport); // Cambiar el estado de reportes
        setTimeout(() => {
            if (isViewingReport) {
                // Si se oculta el reporte, hacer scroll hacia la parte superior de la página
                topRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Si se muestra el reporte, hacer scroll hacia el componente de reportes
                reportRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <>
            {/* Referencia a la parte superior de la página */}
            <div ref={topRef}></div>

            <Card className="bg-white shadow-lg border-t-4 border-t-purple-500">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <CardTitle className="text-2xl font-bold text-gray-800">Detalles del Grupo (Creador)</CardTitle>
                    <CardDescription className="text-gray-600">Información y gestión de tu grupo de trabajo</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16 border-2 border-purple-300 ring-2 ring-purple-100">
                                <AvatarImage src={selectedGroup.logo} alt={selectedGroup.short_name} />
                                <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
                                    {selectedGroup.short_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedGroup.short_name}</h2>
                                <p className="text-sm text-gray-600">{selectedGroup.long_name}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {renderEditableField('contact_email', <Mail className="h-5 w-5 text-purple-500" />)}
                            {errors.contact_email && <p className="text-red-500 text-xs ml-7">{errors.contact_email}</p>}

                            {renderEditableField('contact_phone', <Phone className="h-5 w-5 text-purple-500" />)}
                            {errors.contact_phone && <p className="text-red-500 text-xs ml-7">{errors.contact_phone}</p>}

                            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                                <div className="flex items-center space-x-2">
                                    <Hash className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm text-gray-700">{selectedGroup.code}</span>
                                </div>
                                <Button
                                    onClick={() => copyToClipboard(selectedGroup.code)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-purple-100"
                                >
                                    <Copy className="h-4 w-4 text-purple-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Acciones del Grupo</h3>
                        <p className="text-sm text-gray-600">
                            Como creador del grupo, puedes gestionar la información y realizar acciones adicionales.
                        </p>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300">
                                <Settings className="w-4 h-4 mr-2" />
                                Configuración
                            </Button>

                            {/* Botón de "Reportes" para ver/ocultar las evaluaciones */}
                            <Button
                                variant="outline"
                                className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300"
                                onClick={handleViewReport}
                            >
                                <BarChart className="w-4 h-4 mr-2" />
                                {isViewingReport ? 'Ocultar Reportes' : 'Reportes'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Componente de ReportView */}
            {isViewingReport && (
                <div ref={reportRef}> {/* Referencia al componente de reportes */}
                    <ReportView groupId={selectedGroup.id} />
                </div>
            )}
        </>
    );
}
