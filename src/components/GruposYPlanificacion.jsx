import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getData, postData, putData } from '../api/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Calendar, Users, LayoutDashboard, Clipboard, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CalendarioEventos from './CalendarioEventos';
import SprintKanbanBoard from './SprintKanbanBoard';
import GroupMemberListCreator from './GroupMemberListCreator';
import GroupMemberListMember from './GroupMemberListMember';
import GroupDetailCreator from './GroupDetailCreator';
import GroupDetailMember from './GroupDetailMember';
import ReportView from './ReportView';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

export default function GruposYPlanificacion() {
    const [isLoading, setIsLoading] = useState(true);
    const [isInManagement, setIsInManagement] = useState(false);
    const [isInGroup, setIsInGroup] = useState(false);
    const [managementCode, setManagementCode] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [managementDetails, setManagementDetails] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [view, setView] = useState('join');
    const [groupData, setGroupData] = useState({
        short_name: '',
        long_name: '',
        contact_email: '',
        contact_phone: '',
        logo: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedPreview, setCroppedPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [calendarId, setCalendarId] = useState(null);
    const [groupId, setGroupId] = useState(null);
    const [activeCard, setActiveCard] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [userId, setUserId] = useState(null);
    const { toast } = useToast();
    const calendarRef = useRef(null);
    const kanbanRef = useRef(null);
    const equipoRef = useRef(null);
    const reportesRef = useRef(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        checkManagementAndGroup();
    }, []);

    useEffect(() => {
        if (userId !== null && selectedGroup !== null && selectedGroup.representative) {
            setIsCreator(selectedGroup.representative.id === userId);
        }
    }, [userId, selectedGroup]);

    useEffect(() => {
        if (activeCard === 'planificacion' && calendarRef.current) {
            calendarRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeCard === 'tablero' && kanbanRef.current) {
            kanbanRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeCard === 'equipo' && equipoRef.current) {
            equipoRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (activeCard === 'reportes' && reportesRef.current) {
            reportesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeCard]);

    const checkManagementAndGroup = async () => {
        setIsLoading(true);
        try {
            const userResponse = await getData('/me');
            if (userResponse && userResponse.success) {
                const studentId = userResponse.data.item.student_id;
                setUserId(studentId);
            }

            const response = await getData('/student/management');
            if (response && response.success && response.data && response.data.management) {
                setManagementDetails(response.data.management);
                setIsInManagement(true);
                await checkGroup();
            } else {
                setIsInManagement(false);
                setIsInGroup(false);
            }
        } catch (error) {
            console.error('Error al verificar la gestión:', error);
            setIsInManagement(false);
            setIsInGroup(false);
        } finally {
            setIsLoading(false);
        }
    };

    const checkGroup = async () => {
        try {
            const groupResponse = await getData('/groups/details');
            if (groupResponse && groupResponse.success && groupResponse.data && groupResponse.data.group) {
                setIsInGroup(true);
                setSelectedGroup(groupResponse.data.group);
                setCalendarId(groupResponse.data.group.calendar_id);
                setGroupId(groupResponse.data.group.id);
                if (groupResponse.data.group.representative && userId) {
                    setIsCreator(groupResponse.data.group.representative.id === userId);
                }
            } else {
                setIsInGroup(false);
                setSelectedGroup(null);
                setCalendarId(null);
                setGroupId(null);
                setIsCreator(false);
            }
        } catch (error) {
            console.error('Error al verificar el grupo:', error);
            setIsInGroup(false);
            setSelectedGroup(null);
            setCalendarId(null);
            setGroupId(null);
            setIsCreator(false);
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
            newErrors.logo = "Debe subir una imagen para el logo del grupo";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleJoinManagement = async () => {
        try {
            const response = await postData('/managements/join', {management_code: managementCode});
            if (response.success) {
                toast({
                    title: "Éxito",
                    description: response.message || "Te has unido al curso exitosamente.",
                    duration: 3000,
                });
                await checkManagementAndGroup();
            } else {
                handleError(response);
            }
        } catch (error) {
            console.error('Error al unirse al curso:', error);
            handleError(error.response?.data);
        } finally {
            setManagementCode('');
        }
    };

    const handleJoinGroup = async () => {
        try {
            const response = await postData('/groups/join', {group_code: groupCode});
            if (response.success) {
                toast({
                    title: "Éxito",
                    description: response.message || "Te has unido al grupo exitosamente.",
                    duration: 3000,
                });
                await checkManagementAndGroup();
            } else {
                handleError(response);
            }
        } catch (error) {
            console.error('Error al unirse al grupo:', error);
            handleError(error.response?.data);
        } finally {
            setGroupCode('');
        }
    };

    const handleCreateGroup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.keys(groupData).forEach(key => {
                if (groupData[key] !== null) {
                    if (key === 'logo' && groupData[key] instanceof Blob) {
                        formData.append(key, groupData[key], 'group_logo.jpg');
                    } else {
                        formData.append(key, groupData[key]);
                    }
                }
            });

            const response = await postData('/groups', formData);
            if (response.success && response.data && response.data.group) {
                toast({
                    title: "Éxito",
                    description: "Grupo creado exitosamente.",
                    duration: 3000,
                });
                setSelectedGroup(response.data.group);
                setCalendarId(response.data.group.calendar_id);
                setGroupId(response.data.group.id);
                setIsInGroup(true);
                if (response.data.group.representative && userId) {
                    setIsCreator(response.data.group.representative.id === userId);
                }
                await checkManagementAndGroup();
            } else {
                handleError(response);
            }
        } catch (error) {
            console.error('Error al crear el grupo:', error);
            handleError(error.response?.data || { message: "Error desconocido al crear el grupo" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (error) => {
        let errorMessage = error.message || "Ha ocurrido un error.";
        if (error.code === 252) {
            errorMessage = error.data?.management_code?.[0] || "Código inválido.";
        } else if (error.code === 264) {
            errorMessage = "El código aún no está activo.";
        }
        toast({
            title: "Error",
            description: errorMessage,
            duration: 3000,
            variant: "destructive",
        });
    };

    const handleCardClick = (card) => {
        setActiveCard(activeCard === card ? null : card);
    };

    const handleUpdateGroup = async () => {
        await checkGroup();
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "Error",
                    description: "El archivo no debe superar los 10MB",
                    variant: "destructive",
                });
                return;
            }

            handleRemoveImage(); // Clear existing image data

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = Math.max(pixelCrop.width, pixelCrop.height);
        canvas.width = maxSize;
        canvas.height = maxSize;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const offsetX = (maxSize - pixelCrop.width) / 2;
        const offsetY = (maxSize - pixelCrop.height) / 2;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            offsetX,
            offsetY,
            pixelCrop.width,
            pixelCrop.height
        );

        // Create circular clipping path
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(maxSize / 2, maxSize / 2, maxSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    };

    const handleCropSave = async () => {
        if (croppedAreaPixels) {
            const croppedImageBlob = await getCroppedImg(previewImage, croppedAreaPixels);
            const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
            setCroppedPreview(croppedImageUrl);
            setGroupData(prev => ({ ...prev, logo: croppedImageBlob }));
            setIsCropping(false);
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setPreviewImage(null);
        setCroppedPreview(null);
        setGroupData(prev => ({ ...prev, logo: null }));
    };

    const handleRemoveImage = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setPreviewImage(null);
        setCroppedPreview(null);
        setGroupData(prev => ({ ...prev, logo: null }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
                <span className="ml-2 text-lg font-medium  text-purple-600">Cargando...</span>
            </div>
        );
    }

    if (!isInManagement) {
        return (
            <div className="space-y-4 p-6 max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-2xl text-purple-700">No estás inscrito en un curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="text"
                            placeholder="Ingrese el código de la clase"
                            value={managementCode}
                            onChange={(e) => setManagementCode(e.target.value)}
                            className="mb-4"
                        />
                        <Button onClick={handleJoinManagement} className="w-full bg-purple-600 hover:bg-purple-700">
                            Unirse a Clase
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isInManagement && !isInGroup) {
        return (
            <div className="space-y-4 p-6 max-w-2xl mx-auto">
                <div className="flex space-x-4 mb-4">
                    <Button
                        onClick={() => setView('join')}
                        className={`px-4 py-2 ${view === 'join' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                        Unirse por código
                    </Button>
                    <Button
                        onClick={() => setView('create')}
                        className={`px-4 py-2 ${view === 'create' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                        Crear grupo
                    </Button>
                </div>

                {view === 'join' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-2xl text-purple-700">Unirse a un grupo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                type="text"
                                placeholder="Ingrese el código del grupo"
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                className="mb-4"
                            />
                            <Button onClick={handleJoinGroup} className="w-full bg-purple-600 hover:bg-purple-700">
                                Unirse al Grupo
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {view === 'create' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-2xl text-purple-700">Crear un grupo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Nombre corto"
                                        value={groupData.short_name}
                                        onChange={(e) => setGroupData({...groupData, short_name: e.target.value})}
                                        className={errors.short_name ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.short_name && <p className="text-red-500 text-sm mt-1">{errors.short_name}</p>}
                                </div>
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Nombre largo"
                                        value={groupData.long_name}
                                        onChange={(e) => setGroupData({...groupData, long_name: e.target.value})}
                                        className={errors.long_name ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.long_name && <p className="text-red-500 text-sm mt-1">{errors.long_name}</p>}
                                </div>
                                <div>
                                    <Input
                                        type="email"
                                        placeholder="Email de contacto"
                                        value={groupData.contact_email}
                                        onChange={(e) => setGroupData({...groupData, contact_email: e.target.value})}
                                        className={errors.contact_email ? "border-red-500" : ""}
                                    />
                                    {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
                                </div>
                                <div>
                                    <Input
                                        type="tel"
                                        placeholder="Teléfono de contacto"
                                        value={groupData.contact_phone}
                                        onChange={(e) => setGroupData({...groupData, contact_phone: e.target.value})}
                                        className={errors.contact_phone ? "border-red-500" : ""}
                                    />
                                    {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
                                </div>
                                <div className="flex items-center justify-center w-full">
                                    <div
                                        {...getRootProps()}
                                        className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-visible group"
                                    >
                                        <input {...getInputProps()} />
                                        {croppedPreview ? (
                                            <>
                                                <img src={croppedPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-full" />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                    <p className="text-white text-sm">Click para cambiar</p>
                                                </div>
                                                <Button
                                                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-100 transition-opacity"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                                <p className="text-xs text-gray-500">Click para subir</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                                <Button onClick={handleCreateGroup} className="w-full bg-purple-600 hover:bg-purple-700">
                                    Crear Grupo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={isCropping} onOpenChange={setIsCropping}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Recortar imagen</DialogTitle>
                        </DialogHeader>
                        <div className="w-full h-64 relative">
                            <Cropper
                                image={previewImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="zoom" className="block text-sm font-medium text-gray-700">
                                Zoom
                            </label>
                            <Slider
                                id="zoom"
                                min={1}
                                max={3}
                                step={0.1}
                                value={[zoom]}
                                onValueChange={(value) => setZoom(value[0])}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCropCancel} variant="outline">
                                Cancelar
                            </Button>
                            <Button onClick={handleCropSave} className="bg-purple-600 hover:bg-purple-700">
                                Guardar recorte
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    if (isInGroup && selectedGroup) {
        return (
            <div className="space-y-6">
                {isCreator ? (
                    <GroupDetailCreator
                        selectedGroup={selectedGroup}
                        onUpdateGroup={handleUpdateGroup}
                    />
                ) : (
                    <GroupDetailMember selectedGroup={selectedGroup} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'planificacion' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('planificacion')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Calendar className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Planificación</CardTitle>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'tablero' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('tablero')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <LayoutDashboard className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Tablero</CardTitle>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'equipo' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('equipo')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Users className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Equipo</CardTitle>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-all duration-200 ${activeCard === 'reportes' ? 'bg-purple-100 ring-2 ring-purple-600' : 'bg-white hover:bg-purple-50'}`}
                        onClick={() => handleCardClick('reportes')}>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <Clipboard className="h-12 w-12 text-purple-600 mb-4" />
                            <CardTitle className="text-xl font-bold text-purple-800">Reportes</CardTitle>
                        </CardContent>
                    </Card>
                </div>
                <div ref={calendarRef} className={activeCard === 'planificacion' ? '' : 'hidden'}>
                    <CalendarioEventos calendarId={calendarId} />
                </div>
                <div ref={kanbanRef} className={activeCard === 'tablero' ? '' : 'hidden'}>
                    <SprintKanbanBoard groupId={groupId} />
                </div>
                <div ref={equipoRef} className={activeCard === 'equipo' ? '' : 'hidden'}>
                    {isCreator ? (
                        <GroupMemberListCreator groupId={groupId} members={selectedGroup.members} userId={userId} />
                    ) : (
                        <GroupMemberListMember groupId={groupId} members={selectedGroup.members} />
                    )}
                </div>
                <div ref={reportesRef} className={activeCard === 'reportes' ? '' : 'hidden'}>
                    <ReportView groupId={groupId} />
                </div>
            </div>
        );
    }

    return null;
}
