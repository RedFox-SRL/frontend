import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AlertTriangle} from 'lucide-react';
import ImageCropper from "./ImageCropper";

export default function JoinCreateGroup({
                                            isInManagement,
                                            groupCode,
                                            setGroupCode,
                                            groupData,
                                            setGroupData,
                                            errors,
                                            handleJoinGroup,
                                            handleCreateGroup,
                                            handleImageCropped
                                        }) {
    const [view, setView] = useState("join");

    if (!isInManagement) {
        return (<div className="space-y-4 p-4 sm:p-6 max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-center font-bold text-purple-800">
                        No perteneces a ningún grupo de la materia TIS
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <AlertTriangle className="h-16 w-16 text-yellow-500"/>
                        <p className="text-center text-gray-700">
                            Para crear o unirte a un grupo empresa, primero debes pertenecer a un grupo de la
                            materia TIS.
                        </p>
                        <div className="bg-white p-4 rounded-lg shadow-inner w-full">
                            <h4 className="font-semibold text-purple-700 mb-2">Pasos a seguir:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-800">
                                <li>Identifica tu grupo de la materia TIS y el docente asignado</li>
                                <li>Solicita el código de grupo al docente de tu grupo TIS</li>
                                <li>Utiliza el código para unirte al grupo de la materia en la plataforma</li>
                            </ol>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                            Una vez que te hayas unido a un grupo de la materia TIS, podrás crear o unirte a un
                            grupo empresa.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>);
    }

    return (<div className="space-y-4 p-4 sm:p-6 max-w-md sm:max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <Button
                onClick={() => setView("join")}
                className={`px-4 py-2 ${view === "join" ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-800"}`}
            >
                Unirse por código
            </Button>
            <Button
                onClick={() => setView("create")}
                className={`px-4 py-2 ${view === "create" ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-800"}`}
            >
                Crear grupo
            </Button>
        </div>

        {view === "join" && (<Card>
            <CardHeader>
                <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">
                    Unirse a un grupo empresa
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Input
                    type="text"
                    placeholder="Ingrese el código del grupo empresa"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    className="mb-4"
                />
                <Button
                    onClick={handleJoinGroup}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    Unirse al Grupo Empresa
                </Button>
            </CardContent>
        </Card>)}
        {view === "create" && (<Card>
            <CardHeader>
                <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">
                    Crear un grupo empresa
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            placeholder="Nombre corto del grupo empresa"
                            value={groupData.short_name}
                            onChange={(e) => setGroupData({...groupData, short_name: e.target.value})}
                            className={errors.short_name ? "border-red-500" : ""}
                            required
                        />
                        {errors.short_name && (<p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.short_name}
                        </p>)}
                    </div>
                    <div>
                        <Input
                            type="text"
                            placeholder="Nombre largo del grupo empresa"
                            value={groupData.long_name}
                            onChange={(e) => setGroupData({...groupData, long_name: e.target.value})}
                            className={errors.long_name ? "border-red-500" : ""}
                            required
                        />
                        {errors.long_name && (<p className="text-red-500  text-xs sm:text-sm mt-1">
                            {errors.long_name}
                        </p>)}
                    </div>
                    <div>
                        <Input
                            type="email"
                            placeholder="Email de contacto del grupo empresa"
                            value={groupData.contact_email}
                            onChange={(e) => setGroupData({
                                ...groupData, contact_email: e.target.value,
                            })}
                            className={errors.contact_email ? "border-red-500" : ""}
                        />
                        {errors.contact_email && (<p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.contact_email}
                        </p>)}
                    </div>
                    <div>
                        <Input
                            type="tel"
                            placeholder="Teléfono de contacto del grupo empresa"
                            value={groupData.contact_phone}
                            onChange={(e) => setGroupData({
                                ...groupData, contact_phone: e.target.value,
                            })}
                            className={errors.contact_phone ? "border-red-500" : ""}
                        />
                        {errors.contact_phone && (<p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.contact_phone}
                        </p>)}
                    </div>
                    <ImageCropper onImageCropped={handleImageCropped}/>
                    {errors.logo && (<p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.logo}
                    </p>)}
                    <Button
                        onClick={handleCreateGroup}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        Crear Grupo Empresa
                    </Button>
                </div>
            </CardContent>
        </Card>)}
    </div>);
}