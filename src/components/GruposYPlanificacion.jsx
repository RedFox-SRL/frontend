import React, { useEffect, useRef, useState } from "react";
import { getData, postData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clipboard,
  LayoutDashboard,
  Loader2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CalendarioEventos from "./CalendarioSprints.jsx";
import SprintKanbanBoard from "./SprintKanbanBoard";
import GroupMemberListCreator from "./GroupMemberListCreator";
import GroupMemberListMember from "./GroupMemberListMember";
import GroupDetailCreator from "./GroupDetailCreator";
import GroupDetailMember from "./GroupDetailMember";
import ReportView from "./ReportView";
import ImageCropper from "./ImageCropper";
import RatingView3 from "./RatingView3";
export default function GruposYPlanificacion() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInManagement, setIsInManagement] = useState(false);
  const [isInGroup, setIsInGroup] = useState(false);
  const [managementCode, setManagementCode] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [managementDetails, setManagementDetails] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState("join");
  const [groupData, setGroupData] = useState({
    short_name: "",
    long_name: "",
    contact_email: "",
    contact_phone: "",
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [groupId, setGroupId] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const calendarRef = useRef(null);
  const kanbanRef = useRef(null);
  const equipoRef = useRef(null);
  const reportesRef = useRef(null);

  useEffect(() => {
    checkManagementAndGroup();
  }, []);

  useEffect(() => {
    if (
        userId !== null &&
        selectedGroup !== null &&
        selectedGroup.representative
    ) {
      setIsCreator(selectedGroup.representative.id === userId);
    }
  }, [userId, selectedGroup]);

  useEffect(() => {
    if (activeCard === "planificacion" && calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeCard === "tablero" && kanbanRef.current) {
      kanbanRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeCard === "equipo" && equipoRef.current) {
      equipoRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeCard === "reportes" && reportesRef.current) {
      reportesRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeCard === "notas" && reportesRef.current) {
      reportesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeCard]);

  const checkManagementAndGroup = async () => {
    setIsLoading(true);
    try {
      const userResponse = await getData("/me");
      if (userResponse && userResponse.success) {
        const studentId = userResponse.data.item.student_id;
        setUserId(studentId);
      }

      const response = await getData("/student/management");
      if (
          response &&
          response.success &&
          response.data &&
          response.data.management
      ) {
        setManagementDetails(response.data.management);
        setIsInManagement(true);
        await checkGroup();
      } else {
        setIsInManagement(false);
        setIsInGroup(false);
      }
    } catch (error) {
      console.error("Error al verificar la gestión:", error);
      setIsInManagement(false);
      setIsInGroup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGroup = async () => {
    try {
      const groupResponse = await getData("/groups/details");
      if (
          groupResponse &&
          groupResponse.success &&
          groupResponse.data &&
          groupResponse.data.group
      ) {
        setIsInGroup(true);
        setSelectedGroup(groupResponse.data.group);
        setGroupId(groupResponse.data.group.id);
        if (groupResponse.data.group.representative && userId) {
          setIsCreator(groupResponse.data.group.representative.id === userId);
        }
      } else {
        setIsInGroup(false);
        setSelectedGroup(null);
        setGroupId(null);
        setIsCreator(false);
      }
    } catch (error) {
      console.error("Error al verificar el grupo:", error);
      setIsInGroup(false);
      setSelectedGroup(null);
      setGroupId(null);
      setIsCreator(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!groupData.short_name.trim()) {
      newErrors.short_name = "El nombre corto es obligatorio";
    } else if (groupData.short_name.length > 20) {
      newErrors.short_name =
          "El nombre corto no puede tener más de 20 caracteres";
    }
    if (!groupData.long_name.trim()) {
      newErrors.long_name = "El nombre largo es obligatorio";
    } else if (groupData.long_name.length > 20) {
      newErrors.long_name =
          "El nombre largo no puede tener más de 20 caracteres";
    }
    if (!/^[67]\d{7}$/.test(groupData.contact_phone)) {
      newErrors.contact_phone =
          "Ingrese un número de teléfono válido de Bolivia (8 dígitos, comenzando con 6 o 7)";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(groupData.contact_email)) {
      newErrors.contact_email = "Ingrese un correo electrónico válido";
    }
    if (!groupData.logo) {
      newErrors.logo =
          "Debe subir una imagen para el logo del grupo (máximo 10MB, formatos: JPEG, PNG, WebP)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinManagement = async () => {
    try {
      const response = await postData("/managements/join", {
        management_code: managementCode,
      });
      if (response.success) {
        toast({
          title: "Éxito",
          description:
              response.message || "Te has unido al curso exitosamente.",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
        await checkManagementAndGroup();
      } else {
        handleError(response);
      }
    } catch (error) {
      console.error("Error al unirse al curso:", error);
      handleError(error.response?.data);
    } finally {
      setManagementCode("");
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await postData("/groups/join", {
        group_code: groupCode,
      });
      if (response.success) {
        toast({
          title: "Éxito",
          description:
              response.message || "Te has unido al grupo exitosamente.",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
        await checkManagementAndGroup();
      } else {
        handleError(response);
      }
    } catch (error) {
      console.error("Error al unirse al grupo:", error);
      handleError(error.response?.data);
    } finally {
      setGroupCode("");
    }
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
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

      const response = await postData("/groups", formData);
      if (response.success && response.data && response.data.group) {
        toast({
          title: "Éxito",
          description: "Grupo creado exitosamente.",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
        setSelectedGroup(response.data.group);
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
      console.error("Error al crear el grupo:", error);
      handleError(
          error.response?.data || {
            message: "Error desconocido al crear el grupo",
          },
      );
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
    if (activeCard !== card) {
      setActiveCard(card);
      if (card === "tablero") {
        setRefreshKey((prevKey) => prevKey + 1);
      }
    } else {
      setActiveCard(null);
    }
  };

  const handleUpdateGroup = (updatedGroupData) => {
    setSelectedGroup((prevGroup) => ({
      ...prevGroup,
      ...updatedGroupData,
    }));
    toast({
      title: "Éxito",
      description: "Información del grupo actualizada correctamente.",
      duration: 3000,
      className: "bg-green-500 text-white",
    });
  };

  const handleImageCropped = (croppedImageBlob) => {
    setGroupData((prev) => ({ ...prev, logo: croppedImageBlob }));
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg font-medium text-purple-600">
          Cargando...
        </span>
        </div>
    );
  }

  if (!isInManagement) {
    return (
        <div className="space-y-4 p-4 sm:p-6 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">
                No estás inscrito en un curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                  type="text"
                  placeholder="Ingrese el código de la clase"
                  value={managementCode}
                  onChange={(e) => setManagementCode(e.target.value)}
                  className="mb-4"
              />
              <Button
                  onClick={handleJoinManagement}
                  className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Unirse a Clase
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (isInManagement && !isInGroup) {
    return (
        <div className="space-y-4 p-4 sm:p-6 max-w-md sm:max-w-2xl mx-auto">
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

          {view === "join" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">
                    Unirse a un grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                      type="text"
                      placeholder="Ingrese el código del grupo"
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      className="mb-4"
                  />
                  <Button
                      onClick={handleJoinGroup}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Unirse al Grupo
                  </Button>
                </CardContent>
              </Card>
          )}
          {view === "create" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">
                    Crear un grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Input
                          type="text"
                          placeholder="Nombre corto"
                          value={groupData.short_name}
                          onChange={(e) =>
                              setGroupData({ ...groupData, short_name: e.target.value })
                          }
                          className={errors.short_name ? "border-red-500" : ""}
                          required
                      />
                      {errors.short_name && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.short_name}
                          </p>
                      )}
                    </div>
                    <div>
                      <Input
                          type="text"
                          placeholder="Nombre largo"
                          value={groupData.long_name}
                          onChange={(e) =>
                              setGroupData({ ...groupData, long_name: e.target.value })
                          }
                          className={errors.long_name ? "border-red-500" : ""}
                          required
                      />
                      {errors.long_name && (
                          <p className="text-red-500  text-xs sm:text-sm mt-1">
                            {errors.long_name}
                          </p>
                      )}
                    </div>
                    <div>
                      <Input
                          type="email"
                          placeholder="Email de contacto"
                          value={groupData.contact_email}
                          onChange={(e) =>
                              setGroupData({
                                ...groupData,
                                contact_email: e.target.value,
                              })
                          }
                          className={errors.contact_email ? "border-red-500" : ""}
                      />
                      {errors.contact_email && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.contact_email}
                          </p>
                      )}
                    </div>
                    <div>
                      <Input
                          type="tel"
                          placeholder="Teléfono de contacto"
                          value={groupData.contact_phone}
                          onChange={(e) =>
                              setGroupData({
                                ...groupData,
                                contact_phone: e.target.value,
                              })
                          }
                          className={errors.contact_phone ? "border-red-500" : ""}
                      />
                      {errors.contact_phone && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.contact_phone}
                          </p>
                      )}
                    </div>
                    <ImageCropper onImageCropped={handleImageCropped} />
                    {errors.logo && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.logo}
                        </p>
                    )}
                    <Button
                        onClick={handleCreateGroup}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Crear Grupo
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
    );
  }

  if (isInGroup && selectedGroup) {
    return (
        <div className="space-y-6 sm:p-4">
          {isCreator ? (
              <GroupDetailCreator
                  initialGroupData={selectedGroup}
                  onUpdateGroup={handleUpdateGroup}
              />
          ) : (
              <GroupDetailMember selectedGroup={selectedGroup}/>
          )}
          <div className="grid grid-cols-5 gap-4">
            <Card
                className={`cursor-pointer transition-all duration-200 ${activeCard === "planificacion" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                onClick={() => handleCardClick("planificacion")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Calendar className="h-8 w-8 text-purple-600 mb-2"/>
                <CardTitle className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
                  Planificación
                </CardTitle>
              </CardContent>
            </Card>
            <Card
                className={`cursor-pointer transition-all duration-200 ${activeCard === "tablero" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                onClick={() => handleCardClick("tablero")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <LayoutDashboard className="h-8 w-8 text-purple-600 mb-2"/>
                <CardTitle className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
                  Tablero
                </CardTitle>
              </CardContent>
            </Card>
            <Card
                className={`cursor-pointer transition-all duration-200 ${activeCard === "equipo" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                onClick={() => handleCardClick("equipo")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Users className="h-8 w-8 text-purple-600 mb-2"/>
                <CardTitle className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
                  Equipo
                </CardTitle>
              </CardContent>
            </Card>
            <Card
                className={`cursor-pointer transition-all duration-200 ${activeCard === "reportes" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                onClick={() => handleCardClick("reportes")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Clipboard className="h-8 w-8 text-purple-600 mb-2"/>
                <CardTitle className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
                  Reportes
                </CardTitle>
              </CardContent>
            </Card>
            <Card
                className={`cursor-pointer transition-all duration-200 ${activeCard === "notas" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                onClick={() => handleCardClick("notas")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Clipboard className="h-8 w-8 text-purple-600 mb-2"/>
                <CardTitle className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
                  Notas
                </CardTitle>
              </CardContent>
            </Card>
          </div>


          <div
              ref={calendarRef}
              className={activeCard === "planificacion" ? "" : "hidden"}
          >
            <CalendarioEventos groupId={groupId}/>
          </div>
          <div
              ref={kanbanRef}
              className={activeCard === "tablero" ? "" : "hidden"}
          >
            <SprintKanbanBoard key={refreshKey} groupId={groupId}/>
          </div>
          <div
              ref={equipoRef}
              className={activeCard === "equipo" ? "" : "hidden"}
          >
            {isCreator ? (
                <GroupMemberListCreator
                    groupId={groupId}
                    members={selectedGroup.members}
                    userId={userId}
                />
            ) : (
                <GroupMemberListMember
                    groupId={groupId}
                    members={selectedGroup.members}
                />
            )}
          </div>
          <div
              ref={reportesRef}
              className={activeCard === "reportes" ? "" : "hidden"}
          >
            <ReportView groupId={groupId}/>
          </div>
          <div className={activeCard === "notas" ? "" : "hidden"}>
            {managementDetails && (
                <RatingView3 managementId={managementDetails.id}/>
            )}
          </div>
        </div>
    );
  }

  return null;
}
