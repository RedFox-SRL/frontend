import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {useToast} from "@/hooks/use-toast";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {
    CalendarDays,
    Check,
    Clipboard,
    Clock,
    Copy,
    Folder,
    GraduationCap,
    Lightbulb,
    Loader2,
    Megaphone,
    Settings,
    Star,
    Users
} from 'lucide-react';
import AnnouncementList from "./AnnouncementList";
import CreateAnnouncement from "./CreateAnnouncement";
import EvaluationView from "./EvaluationView";
import ParticipantList from "./ParticipantList";
import GroupDetails from "./GroupDetail";
import GroupListComponent from "./GroupListComponent";
import SpecialEvaluationsView from "./SpecialEvaluationsView";
import ProposalsView from "./ProposalsView";
import RatingsView from "./RatingsView";
import RatingView2 from "./RatingView2";
import ManagementSettingsView from "./ManagementSettingsView";
import {getData} from "../api/apiService";

const CopyButton = React.forwardRef(({textToCopy}, ref) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setIsCopied(false);
    }, [textToCopy]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (<Button
        ref={ref}
        onClick={handleCopy}
        variant="ghost"
        size="sm"
        className={`p-0 h-auto hover:bg-transparent ${isCopied ? 'text-green-500' : ''}`}
    >
        {isCopied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
    </Button>);
});

CopyButton.displayName = 'CopyButton';

const InfoItem = ({icon: Icon, title, value, copyable = false}) => (<div className="flex items-center space-x-2 py-1">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"/>
    <div className="flex-grow min-w-0">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="font-medium text-gray-600 truncate">{title}</p>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Código para compartir con estudiantes</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <div className="flex items-center space-x-2">
            <p className="font-semibold text-gray-800 truncate">{value}</p>
            {copyable && (<TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <CopyButton textToCopy={value}/>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Copiar código</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>)}
        </div>
    </div>
</div>);

const ManagementActions = ({onSettingsClick, onEvaluationsClick, onRatingsClick, onProposalsClick}) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Button onClick={onSettingsClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 h-auto">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"/>
            <span>Configuración</span>
        </Button>
        <Button onClick={onEvaluationsClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 h-auto">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"/>
            <span>Plantillas de evaluaciones</span>
        </Button>
        <Button onClick={onRatingsClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 h-auto">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"/>
            <span>Resumen notas</span>
        </Button>
        <Button onClick={onProposalsClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 h-auto">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"/>
            <span>Calificar propuestas</span>
        </Button>
    </div>);

const CourseInfo = ({managementDetails}) => {
    const formatDateWithTime = useCallback((date) => {
        if (!date) return "No establecido";
        const dateObj = new Date(date);
        return format(dateObj, "d MMM yyyy, HH:mm", {locale: es});
    }, []);

    const formatDateOnly = useCallback((date) => {
        if (!date) return "No establecido";
        const dateObj = new Date(date);
        return format(dateObj, "d MMM yyyy", {locale: es});
    }, []);

    const courseInfo = useMemo(() => [{
        icon: CalendarDays,
        title: "Entrega Parte A",
        value: formatDateWithTime(managementDetails.proposal_part_a_deadline),
    }, {
        icon: Clock, title: "Entrega Parte B", value: formatDateWithTime(managementDetails.proposal_part_b_deadline),
    }, {
        icon: CalendarDays,
        title: "Entrega Final",
        value: (!managementDetails.project_delivery_date || formatDateOnly(managementDetails.project_delivery_date) === "No establecido") ? "Ve a configuración" : formatDateOnly(managementDetails.project_delivery_date),
    }, {
        icon: Users,
        title: "Max. integrantes",
        value: (managementDetails.group_limit >= 1 && managementDetails.group_limit <= 3) ? "Ve a configuración" : managementDetails.group_limit,
    }, {
        icon: Clipboard, title: "Código de tu grupo", value: managementDetails.code, copyable: true,
    },], [managementDetails, formatDateWithTime, formatDateOnly]);

    return (<div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-3 bg-purple-100">
            <h3 className="font-semibold text-purple-800">
                Semestre {managementDetails.semester === "first" ? "1" : "2"}/{new Date(managementDetails.start_date).getFullYear()}
            </h3>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {courseInfo.map((item, index) => (<InfoItem
                key={index}
                {...item}
            />))}
        </div>
    </div>);
};

const ManagementView = ({management, onBack}) => {
    const [groups, setGroups] = useState([]);
    const [participants, setParticipants] = useState({teacher: null, students: []});
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isSpecialEvaluationsView, setIsSpecialEvaluationsView] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
    const [activeTab, setActiveTab] = useState("announcements");
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [isProposalView, setIsProposalView] = useState(false);
    const [isRatingsView2, setIsRatingsView2] = useState(false);
    const [showRatingsPopup, setShowRatingsPopup] = useState(false);
    const {toast} = useToast();
    const [currentManagement, setCurrentManagement] = useState(management);

    const updateManagementData = (updatedFields) => {
        setCurrentManagement((prev) => ({
            ...prev, ...updatedFields,
        }));
    };

    const fetchScoreStatus = async () => {
        try {
            const response = await getData(`/managements/${management.id}/scoreStatus`);
            if (response && response.code === 338) {
                setShowRatingsPopup(true);
            }
        } catch (error) {
            console.error("Error al obtener el estado de la configuración", error);
            if (error.response && error.response.status === 400) {
                setShowRatingsPopup(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchManagementDetails = async () => {
        try {
            const response = await getData(`/managements/${management.id}`);
            if (response && response.success) {
                setCurrentManagement(response.data);
            }
        } catch (error) {
            console.error("Error fetching management details:", error);
        }
    };

    const closeRatingsPopup = async () => {
        setShowRatingsPopup(false);
        await fetchManagementDetails();
        toast({
            title: "Configuración Completa",
            description: "La configuración de calificaciones se guardó correctamente.",
            variant: "success",
            className: "bg-green-500 text-white",
        });
    };

    const handleAnnouncementCreated = useCallback((newAnnouncement) => {
        setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    }, []);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const response = await getData(`/managements/${management.id}/groups`);
            if (response && response.success && response.data.groups.length > 0) {
                setGroups(response.data.groups);
            } else if (response && response.code === 404) {
                setErrorMessage("No hay grupos registrados en esta gestión.");
            } else {
                setErrorMessage("Error al cargar los grupos.");
            }
        } catch (error) {
            setErrorMessage("No hay grupos registrados en esta gestión.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await getData(`/managements/${management.id}/students`);
            if (response && response.success && response.data) {
                setParticipants(response.data);
            }
        } catch (error) {
            console.error("Error al cargar los participantes:", error);
        }
    };

    const handleEvaluateClick = (groupId) => {
        setIsEvaluating(true);
        setSelectedGroupId(groupId);
    };

    const handleViewDetails = (group) => {
        setSelectedGroupDetails(group);
    };

    const getInitials = (name, lastName) => `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    useEffect(() => {
        fetchScoreStatus();
    }, [management]);

    useEffect(() => {
        if (management && !showRatingsPopup) {
            fetchGroups();
            fetchParticipants();
        }
    }, [management, showRatingsPopup]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await getData(`/management/${management.id}/announcements`);
                if (response && response.data) {
                    setAnnouncements(response.data);
                }
            } catch (error) {
                console.error("Error fetching announcements:", error);
            }
        };

        if (management && !showRatingsPopup) {
            fetchAnnouncements();
        }
    }, [management, showRatingsPopup]);

    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
            <span className="ml-2 font-medium text-purple-600">Cargando...</span>
        </div>);
    }

    if (showRatingsPopup) {
        return (<RatingsView
            managementId={management.id}
            onBack={closeRatingsPopup}
            onUpdate={fetchManagementDetails}
        />);
    }

    return (<div className="relative min-h-screen">
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="sm:p-4 space-y-4 sm:space-y-6 max-w-7xl mx-auto"
        >
            <ManagementSettingsView
                management={currentManagement}
                isOpen={isSettingsDropdownOpen}
                onClose={() => setIsSettingsDropdownOpen(false)}
                onUpdate={updateManagementData}
            />

            <ManagementActions
                onSettingsClick={() => setIsSettingsDropdownOpen(true)}
                onEvaluationsClick={() => setIsSpecialEvaluationsView(true)}
                onRatingsClick={() => setIsRatingsView2(true)}
                onProposalsClick={() => setIsProposalView(true)}
            />

            <CourseInfo managementDetails={currentManagement}/>

            <Card className="bg-white shadow-md w-full rounded-lg mb-8">
                <CardContent className="p-1 sm:p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList
                            className="grid w-full grid-cols-3 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                            <TabsTrigger
                                value="announcements"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out"
                            >
                                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">Anuncios</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="groups"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out"
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">
                                        Grupos ({groups.length})
                                    </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="participants"
                                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out"
                            >
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5"/>
                                <span className="hidden sm:inline ml-1 sm:ml-2">
                                        Estudiantes ({participants?.students?.length || 0})
                                    </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="announcements">
                            <CreateAnnouncement
                                managementId={management.id}
                                onAnnouncementCreated={handleAnnouncementCreated}
                            />
                            <AnnouncementList
                                managementId={management.id}
                                announcements={announcements}
                                setAnnouncements={setAnnouncements}
                            />
                        </TabsContent>

                        <TabsContent value="groups">
                            {errorMessage ? (<p className="mt-4 text-red-500">{errorMessage}</p>) : (<GroupListComponent
                                groups={groups}
                                handleEvaluateClick={handleEvaluateClick}
                                handleViewDetails={handleViewDetails}
                                getInitials={getInitials}
                            />)}
                        </TabsContent>

                        <TabsContent value="participants">
                            <ParticipantList participants={participants} getInitials={getInitials}/>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </motion.div>

        {isEvaluating && (<div className="absolute inset-0 bg-white z-50 overflow-y-auto">
            <EvaluationView
                groupId={selectedGroupId}
                onBack={() => setIsEvaluating(false)}
            />
        </div>)}

        {isSpecialEvaluationsView && (<div className="absolute inset-0 bg-white z-50 overflow-y-auto">
            <SpecialEvaluationsView
                onBack={() => setIsSpecialEvaluationsView(false)}
                managementId={management.id}
            />
        </div>)}

        {isRatingsView2 && (<div className="absolute inset-0 bg-white z-50 overflow-y-auto">
            <RatingView2
                onBack={() => setIsRatingsView2(false)}
                managementId={management.id}
            />
        </div>)}

        {isProposalView && (<div className="absolute inset-0 bg-white z-50 overflow-y-auto">
            <ProposalsView
                onBack={() => setIsProposalView(false)}
                managementId={management.id}
            />
        </div>)}

        {selectedGroupDetails && (<div className="absolute inset-0 bg-white bg-opacity-90 z-50 overflow-y-auto">
            <GroupDetails
                group={selectedGroupDetails}
                onClose={() => setSelectedGroupDetails(null)}
                getInitials={getInitials}
            />
        </div>)}
    </div>);
};

export default ManagementView;