import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AlertTriangle, Loader2, CheckCircle, AlertCircle} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ImageCropper from "./ImageCropper";
import {postData} from "../api/apiService";

export default function JoinCreateGroup({isInManagement, onGroupJoined, onGroupCreated}) {
    const [activeTab, setActiveTab] = useState("join");
    const [isLoading, setIsLoading] = useState(false);
    const [groupCode, setGroupCode] = useState(Array(7).fill(''));
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState("");
    const [groupData, setGroupData] = useState({
        short_name: "", long_name: "", contact_email: "", contact_phone: "", logo: null
    });
    const [createErrors, setCreateErrors] = useState({});
    const [createSuccess, setCreateSuccess] = useState("");

    useEffect(() => {
        setJoinError("");
        setJoinSuccess("");
        setCreateErrors({});
        setCreateSuccess("");
    }, [activeTab]);

    const handlePaste = (e, index) => {
        e.preventDefault();
        let pastedText = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData.getData('Text');
        pastedText = pastedText.replace(/[^a-zA-Z0-9]/g, '');
        const remainingChars = 7 - index;
        const relevantText = pastedText.slice(0, remainingChars);

        const newCode = [...groupCode];
        for (let i = 0; i < relevantText.length; i++) {
            if (index + i < 7) {
                newCode[index + i] = relevantText[i];
            }
        }
        setGroupCode(newCode);

        const nextEmptyIndex = newCode.findIndex((char, i) => i >= index && char === '');
        const focusIndex = nextEmptyIndex === -1 ? 6 : nextEmptyIndex;
        document.getElementById(`group-code-input-${focusIndex}`)?.focus();
    };

    const handleCodeChange = (index, value) => {
        const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
        if (alphanumericValue.length <= 1) {
            const newCode = [...groupCode];
            newCode[index] = alphanumericValue;
            setGroupCode(newCode);

            if (alphanumericValue && index < 6) {
                document.getElementById(`group-code-input-${index + 1}`)?.focus();
            } else if (!alphanumericValue && index > 0) {
                document.getElementById(`group-code-input-${index - 1}`)?.focus();
            }
        }
        setJoinError("");
        setJoinSuccess("");
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !groupCode[index] && index > 0) {
            document.getElementById(`group-code-input-${index - 1}`).focus();
        }
    };

    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && isCodeComplete && !isLoading) {
            handleJoinGroupSubmit();
        }
    };

    const handleJoinGroupSubmit = async () => {
        const code = groupCode.join(''); // Update: Removed toUpperCase()
        console.log("Código a enviar:", code); // Added console.log
        if (code.length !== 7) {
            setJoinError("El código debe tener 7 caracteres.");
            return;
        }

        setIsLoading(true);
        setJoinError("");
        setJoinSuccess("");

        try {
            const response = await postData("/groups/join", {group_code: code});
            if (response.success) {
                setJoinSuccess("Te has unido al grupo exitosamente. Redirigiendo...");
                setTimeout(() => {
                    onGroupJoined(response.data.group);
                }, 2000);
            } else {
                throw new Error(response.message || "Error al unirse al grupo");
            }
        } catch (error) {
            console.error("Error al unirse al grupo:", error);
            setJoinError(error.response?.data?.message || error.message || "Ocurrió un error al intentar unirse al grupo. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!groupData.short_name.trim()) {
            newErrors.short_name = "El nombre corto es obligatorio";
        } else if (groupData.short_name.length > 20) {
            newErrors.short_name = "El nombre corto no puede tener más de 20 caracteres";
        }
        if (!groupData.long_name.trim()) {
            newErrors.long_name = "El nombre largo es obligatorio";
        } else if (groupData.long_name.length > 20) {
            newErrors.long_name = "El nombre largo no puede tener más de 20 caracteres";
        }
        if (!/^[67]\d{7}$/.test(groupData.contact_phone)) {
            newErrors.contact_phone = "Ingrese un número de teléfono válido de Bolivia (8 dígitos, comenzando con 6 o 7)";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(groupData.contact_email)) {
            newErrors.contact_email = "Ingrese un correo electrónico válido";
        }
        if (!groupData.logo) {
            newErrors.logo = "Debe subir una imagen para el logo del grupo (máximo 10MB, formatos: JPEG, PNG, WebP)";
        }
        setCreateErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateGroup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setCreateErrors({});
        setCreateSuccess("");

        try {
            const formData = new FormData();
            Object.keys(groupData).forEach((key) => {
                if (groupData[key] !== null) {
                    if (key === "logo" && groupData[key] instanceof Blob) {
                        formData.append(key, groupData[key], "group_logo.jpg");
                    } else {
                        formData.append(key, groupData[key]);
                    }
                }
            });
            console.log("Logo being sent:", groupData.logo); // Update: Log logo data

            const response = await postData("/groups", formData);
            if (response.success && response.data && response.data.group) {
                setCreateSuccess("Grupo creado exitosamente.");
                onGroupCreated(response.data.group);
            } else {
                throw new Error(response.message || "Error al crear el grupo");
            }
        } catch (error) {
            console.error("Error al crear el grupo:", error);
            setCreateErrors({general: error.message || "Error desconocido al crear el grupo"});
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageCropped = (croppedImageBlob) => {
        console.log("Cropped image blob:", croppedImageBlob); // Update: Log cropped image blob
        setGroupData((prev) => ({...prev, logo: croppedImageBlob}));
    };

    const isCodeComplete = groupCode.every(char => char !== '');

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

    return (<div className="flex items-start justify-center min-h-screen pt-10 px-4">
        <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-6 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="join">Unirse por código</TabsTrigger>
                        <TabsTrigger value="create">Crear grupo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="join">
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Para unirte a un grupo empresa, ingresa el código único de 7 dígitos proporcionado
                                por el representante del grupo.
                            </p>
                            <div
                                className="flex justify-center items-center w-full max-w-screen-lg mx-auto px-2 sm:px-4 py-4 sm:py-6">
                                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
                                    {groupCode.map((char, index) => (<input
                                        key={index}
                                        id={`group-code-input-${index}`}
                                        type="text"
                                        maxLength="1"
                                        className="w-10 h-12 sm:w-11 sm:h-13 md:w-12 md:h-14 text-center text-lg sm:text-xl md:text-2xl font-bold border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500 bg-white shadow-sm transition-all duration-200 ease-in-out"
                                        value={char}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => {
                                            handleKeyDown(index, e);
                                            handleEnterKey(e);
                                        }}
                                        onPaste={(e) => handlePaste(e, index)}
                                        pattern="[a-zA-Z0-9]"
                                    />))}
                                </div>
                            </div>
                            {(joinError || joinSuccess) && (<div
                                className={`flex items-center ${joinSuccess ? 'text-green-600' : 'text-red-600'} mt-2`}>
                                {joinSuccess ? (<CheckCircle className="h-5 w-5 mr-2"/>) : (
                                    <AlertCircle className="h-5 w-5 mr-2"/>)}
                                <p>{joinSuccess || joinError}</p>
                            </div>)}
                            <Button
                                onClick={handleJoinGroupSubmit}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition duration-300 ease-in-out"
                                disabled={isLoading || !isCodeComplete}
                            >
                                {isLoading ? (<>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline"/>
                                    Uniéndose...
                                </>) : ("Unirse al Grupo Empresa")}
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="create">
                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Nombre corto del grupo empresa"
                                value={groupData.short_name}
                                onChange={(e) => setGroupData({...groupData, short_name: e.target.value})}
                                className={createErrors.short_name ? "border-red-500" : ""}
                            />
                            {createErrors.short_name && (
                                <p className="text-red-500 text-sm mt-1">{createErrors.short_name}</p>)}
                            <Input
                                type="text"
                                placeholder="Nombre largo del grupo empresa"
                                value={groupData.long_name}
                                onChange={(e) => setGroupData({...groupData, long_name: e.target.value})}
                                className={createErrors.long_name ? "border-red-500" : ""}
                            />
                            {createErrors.long_name && (
                                <p className="text-red-500 text-sm mt-1">{createErrors.long_name}</p>)}
                            <Input
                                type="email"
                                placeholder="Email de contacto del grupo empresa"
                                value={groupData.contact_email}
                                onChange={(e) => setGroupData({...groupData, contact_email: e.target.value})}
                                className={createErrors.contact_email ? "border-red-500" : ""}
                            />
                            {createErrors.contact_email && (
                                <p className="text-red-500 text-sm mt-1">{createErrors.contact_email}</p>)}
                            <Input
                                type="tel"
                                placeholder="Teléfono de contacto del grupo empresa"
                                value={groupData.contact_phone}
                                onChange={(e) => setGroupData({...groupData, contact_phone: e.target.value})}
                                className={createErrors.contact_phone ? "border-red-500" : ""}
                            />
                            {createErrors.contact_phone && (
                                <p className="text-red-500 text-sm mt-1">{createErrors.contact_phone}</p>)}
                            <ImageCropper onImageCropped={handleImageCropped}/>
                            {createErrors.logo && (<p className="text-red-500 text-sm mt-1">{createErrors.logo}</p>)}
                            {createErrors.general && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4"
                                     role="alert">
                                    <p className="font-bold">Error</p>
                                    <p>{createErrors.general}</p>
                                </div>)}
                            {createSuccess && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-4"
                                     role="alert">
                                    <p className="font-bold">Éxito</p>
                                    <p>{createSuccess}</p>
                                </div>)}
                            <Button
                                onClick={handleCreateGroup}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (<>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 inline"/>
                                    Creando...
                                </>) : ("Crear Grupo Empresa")}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>);
}