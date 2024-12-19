import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Mail, Phone, Users, AlertCircle} from 'lucide-react';

const colorSchemes = [{
    bg: "bg-gradient-to-br from-blue-500 to-blue-700",
    text: "text-white",
    hover: "hover:from-blue-600 hover:to-blue-800",
}, {
    bg: "bg-gradient-to-br from-green-500 to-green-700",
    text: "text-white",
    hover: "hover:from-green-600 hover:to-green-800",
}, {
    bg: "bg-gradient-to-br from-purple-500 to-purple-700",
    text: "text-white",
    hover: "hover:from-purple-600 hover:to-purple-800",
}, {
    bg: "bg-gradient-to-br from-red-500 to-red-700", text: "text-white", hover: "hover:from-red-600 hover:to-red-800",
},];

export default function GroupList({groups, onSelectGroup, getInitials}) {
    return (<>
        {groups.length === 0 ? (<Card className="overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-purple-300 mb-4"/>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay grupos
                    registrados</h3>
                <p className="text-gray-500 text-sm max-w-md">
                    Actualmente no hay grupos para mostrar. Los grupos aparecerán aquí a medida
                    que se vayan registrando.
                </p>
            </CardContent>
        </Card>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => {
                const colorScheme = colorSchemes[index % colorSchemes.length];
                return (<Card
                    key={index}
                    className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                    <CardContent className="p-0">
                        <div
                            className={`${colorScheme.bg} p-4 flex items-center space-x-4`}
                        >
                            <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                                <AvatarImage
                                    src={group.logo || "/placeholder.svg?height=64&width=64"}
                                    alt={group.short_name}
                                />
                                <AvatarFallback className="text-xl bg-white text-gray-800 font-semibold">
                                    {getInitials(group.short_name, group.long_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className={`text-xl font-bold ${colorScheme.text}`}>
                                    {group.short_name}
                                </h3>
                                <p className={`text-sm ${colorScheme.text} opacity-90`}>
                                    {group.long_name}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="space-y-2 mb-4">
                                <p className="flex items-center text-sm text-gray-600">
                                    <Mail className="mr-2 h-4 w-4 text-gray-400"/>
                                    {group.contact_email}
                                </p>
                                <p className="flex items-center text-sm text-gray-600">
                                    <Phone className="mr-2 h-4 w-4 text-gray-400"/>
                                    {group.contact_phone}
                                </p>
                                <p className="flex items-center text-sm text-gray-600">
                                    <Users className="mr-2 h-4 w-4 text-gray-400"/>
                                    {Object.keys(group.members).length} integrantes
                                </p>
                            </div>
                            <Button
                                className={`w-full ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} transition-colors duration-300`}
                                onClick={() => onSelectGroup(group)}
                            >
                                Ver Detalles
                            </Button>
                        </div>
                    </CardContent>
                </Card>);
            })}
        </div>)}
    </>);
}
