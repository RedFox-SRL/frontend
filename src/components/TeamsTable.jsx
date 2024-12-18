import React, {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Loader2, Search, Users, Briefcase, School} from 'lucide-react';
import {getData} from "@/api/apiService";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";

export default function TeamsTable() {
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setIsLoading(true);
                const response = await getData("/group-names");
                setTeams(response || []);
                setIsLoading(false);
            } catch (error) {
                setError("Error al cargar los grupos empresa. Por favor, intente de nuevo más tarde.");
                setIsLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const filteredTeams = useMemo(() => {
        return teams.filter((team) => team.short_name.toLowerCase().includes(searchTerm.toLowerCase()) || (team.long_name && team.long_name.toLowerCase().includes(searchTerm.toLowerCase())) || (team.management && team.management.toLowerCase().includes(searchTerm.toLowerCase())) || (team.teacher && team.teacher.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [teams, searchTerm]);

    const groupedTeams = useMemo(() => {
        const grouped = filteredTeams.reduce((acc, team) => {
            const management = team.management || 'Sin gestión';
            if (!acc[management]) {
                acc[management] = [];
            }
            acc[management].push(team);
            return acc;
        }, {});

        return Object.entries(grouped).sort((a, b) => {
            if (a[0] === 'Sin gestión') return 1;
            if (b[0] === 'Sin gestión') return -1;
            return a[0].localeCompare(b[0]);
        });
    }, [filteredTeams]);

    if (error) {
        return (<Card className="w-full max-w-4xl mx-auto bg-red-50 border-red-200">
            <CardContent className="p-6">
                <p className="text-red-600 text-center">{error}</p>
            </CardContent>
        </Card>);
    }

    return (<Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
            <h3 className="text-2xl font-bold mb-6 text-purple-800">
                Grupos Empresa Registrados
            </h3>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input
                    type="search"
                    placeholder="Buscar grupos empresa..."
                    className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-md focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="h-[600px] pr-4">
                {isLoading ? (<div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-2"/>
                    <span className="text-lg text-gray-600">Cargando grupos empresa...</span>
                </div>) : filteredTeams.length === 0 ? (<div className="text-center text-gray-600 py-4">
                    No se encontraron grupos empresa que coincidan con la búsqueda.
                </div>) : (<Accordion type="single" collapsible className="w-full space-y-4">
                    {groupedTeams.map(([management, teams]) => (<AccordionItem key={management} value={management}
                                                                               className="border rounded-lg overflow-hidden">
                        <AccordionTrigger
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors">
                            <div className="flex items-center space-x-2">
                                <Briefcase className="w-5 h-5 text-purple-600"/>
                                <span className="font-medium text-gray-800">
                        Gestión: {management}
                      </span>
                                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                                    {teams.length} {teams.length === 1 ? 'grupo empresa' : 'grupos empresa'}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="divide-y divide-gray-200">
                                {teams.map((team, index) => (<li key={index}
                                                                 className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="sm:flex sm:justify-between sm:items-start">
                                        <div className="flex items-start space-x-3 mb-2 sm:mb-0">
                                            <Users className="w-5 h-5 text-purple-600 mt-1"/>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {team.short_name || 'Nombre corto no establecido'}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {team.long_name || 'Nombre largo no establecido'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:text-right mt-2 sm:mt-0">
                                            <div
                                                className="text-sm text-gray-500 flex items-center sm:justify-end">
                                                <School className="w-4 h-4 mr-1 text-purple-500"/>
                                                <span>{team.teacher || 'Docente no asignado'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>))}
                </Accordion>)}
            </ScrollArea>
        </CardContent>
    </Card>);
}
