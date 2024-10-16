import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Hash, BarChart, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ReportView from './ReportView'; // Importamos el componente de reportes

export default function GroupDetailMember({ selectedGroup }) {
    const { toast } = useToast();
    const [isViewingReport, setIsViewingReport] = useState(false); // Estado para ver la vista de reportes
    const reportRef = useRef(null); // Referencia para el componente de reportes
    const topRef = useRef(null); // Referencia para la parte superior de la página

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
                    <CardTitle className="text-2xl font-bold text-gray-800">Detalles del Grupo</CardTitle>
                    <CardDescription className="text-gray-600">Información de tu grupo de trabajo</CardDescription>
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
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                                <Mail className="h-5 w-5 text-purple-500" />
                                <span className="text-sm text-gray-700">{selectedGroup.contact_email}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                                <Phone className="h-5 w-5 text-purple-500" />
                                <span className="text-sm text-gray-700">{selectedGroup.contact_phone}</span>
                            </div>
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
                        <h3 className="text-lg font-semibold text-gray-800">Información del Grupo</h3>
                        <p className="text-sm text-gray-600">Este es tu grupo de trabajo actual.</p>
                        <div className="space-y-2">
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
