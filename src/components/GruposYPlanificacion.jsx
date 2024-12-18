import React, {useEffect, useRef, useState} from "react";
import {getData} from "../api/apiService";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {Calendar, Clipboard, LayoutDashboard, Loader2, Users} from 'lucide-react';
import CalendarioEventos from "./CalendarioSprints.jsx";
import SprintKanbanBoard from "./SprintKanbanBoard";
import GroupMemberListCreator from "./GroupMemberListCreator";
import GroupMemberListMember from "./GroupMemberListMember";
import GroupDetailCreator from "./GroupDetailCreator";
import GroupDetailMember from "./GroupDetailMember";
import ReportView from "./ReportView";
import RatingView3 from "./RatingView3";
import JoinCreateGroup from "./JoinCreateGroup";

export default function GruposYPlanificacion() {
    const [isLoading, setIsLoading] = useState(true);
    const [isInManagement, setIsInManagement] = useState(false);
    const [isInGroup, setIsInGroup] = useState(false);
    const [managementDetails, setManagementDetails] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupId, setGroupId] = useState(null);
    const [activeCard, setActiveCard] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [userId, setUserId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const calendarRef = useRef(null);
    const kanbanRef = useRef(null);
    const equipoRef = useRef(null);
    const reportesRef = useRef(null);

    useEffect(() => {
        checkManagementAndGroup();
    }, []);

    useEffect(() => {
        if (userId !== null && selectedGroup !== null && selectedGroup.representative) {
            setIsCreator(selectedGroup.representative.id === userId);
        }
    }, [userId, selectedGroup]);

    useEffect(() => {
        if (activeCard === "planificacion" && calendarRef.current) {
            calendarRef.current.scrollIntoView({behavior: "smooth"});
        } else if (activeCard === "tablero" && kanbanRef.current) {
            kanbanRef.current.scrollIntoView({behavior: "smooth"});
        } else if (activeCard === "equipo" && equipoRef.current) {
            equipoRef.current.scrollIntoView({behavior: "smooth"});
        } else if (activeCard === "reportes" && reportesRef.current) {
            reportesRef.current.scrollIntoView({behavior: "smooth"});
        } else if (activeCard === "notas" && reportesRef.current) {
            reportesRef.current.scrollIntoView({behavior: "smooth"});
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
            if (response && response.success && response.data && response.data.management) {
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
            if (groupResponse && groupResponse.success && groupResponse.data && groupResponse.data.group) {
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
            ...prevGroup, ...updatedGroupData,
        }));
    };

    const handleGroupJoined = async (group) => {
        setSelectedGroup(group);
        setGroupId(group.id);
        setIsInGroup(true);
        if (group.representative && userId) {
            setIsCreator(group.representative.id === userId);
        }
        // Re-fetch group details to ensure we have the most up-to-date information
        await checkGroup();
    };

    const handleGroupCreated = async (group) => {
        setSelectedGroup(group);
        setGroupId(group.id);
        setIsInGroup(true);
        setIsCreator(true);
        // Re-fetch group details to ensure we have the most up-to-date information
        await checkGroup();
    };

    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
            <span className="ml-2 text-lg font-medium text-purple-600">
                    Cargando...
                </span>
        </div>);
    }

    if (!isInGroup) {
        return (<JoinCreateGroup
            isInManagement={isInManagement}
            onGroupJoined={handleGroupJoined}
            onGroupCreated={handleGroupCreated}
        />);
    }

    if (isInGroup && selectedGroup) {
        return (<div className="space-y-6 sm:p-4">
            {isCreator ? (<GroupDetailCreator
                initialGroupData={selectedGroup}
                onUpdateGroup={handleUpdateGroup}
            />) : (<GroupDetailMember selectedGroup={selectedGroup}/>)}
            <div className="grid grid-cols-5 gap-4">
                <Card
                    className={`cursor-pointer transition-all duration-200 ${activeCard === "planificacion" ? "bg-purple-100 ring-2 ring-purple-600" : "bg-white hover:bg-purple-50"}`}
                    onClick={() => handleCardClick("planificacion")}
                >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2"/>
                        <CardTitle
                            className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
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
                        <CardTitle
                            className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
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
                        <CardTitle
                            className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
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
                        <CardTitle
                            className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
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
                        <CardTitle
                            className="text-sm sm:text-lg font-bold text-purple-800 text-center hidden sm:block">
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
                {isCreator ? (<GroupMemberListCreator
                    groupId={groupId}
                    members={selectedGroup.members}
                    userId={userId}
                />) : (<GroupMemberListMember
                    groupId={groupId}
                    members={selectedGroup.members}
                />)}
            </div>
            <div
                ref={reportesRef}
                className={activeCard === "reportes" ? "" : "hidden"}
            >
                <ReportView groupId={groupId}/>
            </div>
            <div className={activeCard === "notas" ? "" : "hidden"}>
                {managementDetails && (<RatingView3 managementId={managementDetails.id}/>)}
            </div>
        </div>);
    }

    return null;
}