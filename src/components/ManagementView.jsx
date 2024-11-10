import React, { useEffect, useMemo, useState } from "react";
import { getData } from "../api/apiService";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clipboard,
  GraduationCap,
  Megaphone,
  TrendingUp,
  Users,
  Settings,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnnouncementList from "./AnnouncementList";
import CreateAnnouncement from "./CreateAnnouncement";
import EvaluationView from "./EvaluationView";
import ParticipantList from "./ParticipantList";
import GroupDetails from "./GroupDetail";
import GroupListComponent from "./GroupListComponent";
import ManagementSettingsView from "./ManagementSettingsView";
import SpecialEvaluationsView from "./SpecialEvaluationsView";

const AnimatedProgressBar = ({ value }) => (
    <div className="relative pt-1">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
        <motion.div
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
);

const AnimatedPercentage = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animationDuration = 1000;
    const startTime = Date.now();

    const animateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animationDuration, 1);
      setDisplayValue(Math.round(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    requestAnimationFrame(animateValue);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default function ManagementView({ management, onBack }) {
  const [groups, setGroups] = useState([]);
  const [participants, setParticipants] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSpecialEvaluationsView, setIsSpecialEvaluationsView] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("announcements");
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const toggleSettingsDropdown = () => {
    setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
  };

  const handleAnnouncementCreated = async () => {
    await fetchAnnouncements();
  };

  const progress = useMemo(() => {
    const startDate = new Date(management.start_date);
    const endDate = new Date(management.end_date);
    const today = new Date();

    const totalDuration = endDate - startDate;
    const completedDuration = today - startDate;

    let calculatedProgress = (completedDuration / totalDuration) * 100;
    return calculatedProgress > 100
        ? 100
        : calculatedProgress < 0
            ? 0
            : calculatedProgress;
  }, [management.start_date, management.end_date]);

  useEffect(() => {
    if (management) {
      fetchGroups();
      fetchParticipants();
      fetchAnnouncements();
    }
  }, [management]);

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
      if (response && response.teacher && response.students) {
        setParticipants(response);
      }
    } catch (error) {
      console.error("Error al cargar los participantes:", error);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await getData(`/management/${management.id}/announcements`);
      if (response && response.data) {
        setAnnouncements(response.data);
      } else {
        console.error("Error en la respuesta de los anuncios:", response);
      }
    } catch (error) {
      console.error("Error al cargar los anuncios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateClick = (groupId) => {
    setIsEvaluating(true);
    setSelectedGroupId(groupId);
  };

  const handleViewDetails = (group) => {
    setSelectedGroupDetails(group);
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:p-4 p-0 max-w-7xl mx-auto"
      >
        {!isEvaluating && !isSpecialEvaluationsView && (
            <div className="flex justify-between mb-4">
              <Button onClick={onBack} className="bg-transparent hover:bg-purple-200 p-2 rounded-full">
                <ArrowLeft className="text-purple-600 hover:text-purple-700" />
              </Button>
              <div className="flex gap-4">
                <div className="relative">
                  <Button onClick={toggleSettingsDropdown} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white">
                    <Settings className="mr-2" />
                    Configuración
                  </Button>
                  {isSettingsDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                        <ManagementSettingsView management={management} />
                      </div>
                  )}
                </div>
                <Button onClick={() => setIsSpecialEvaluationsView(true)} className="flex items-center bg-purple-500 text-white hover:bg-purple-600">
                  <Star className="mr-2" />
                  Evaluaciones Especiales
                </Button>
              </div>
            </div>
        )}

        {isEvaluating ? (
            <EvaluationView groupId={selectedGroupId} onBack={() => setIsEvaluating(false)} />
        ) : isSpecialEvaluationsView ? (
            <SpecialEvaluationsView onBack={() => setIsSpecialEvaluationsView(false)} />
        ) : (
            <>
              {/* Información General de Gestión */}
              <div className="bg-white shadow-md p-6 rounded-lg mb-8">
                <h1 className="text-3xl font-bold mb-4 text-purple-700">
                  Gestión {management.semester === "first" ? "1" : "2"}/{new Date(management.start_date).getFullYear()}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-semibold">Fecha de inicio:</p>
                      <p>{management.start_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-semibold">Fecha de fin:</p>
                      <p>{management.end_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-semibold">Límite de grupos:</p>
                      <p>{management.group_limit}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clipboard className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-semibold">Código de la gestión:</p>
                      <p className="font-bold text-lg">{management.code}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-700">Progreso del curso</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-900">
                  <AnimatedPercentage value={progress} />%
                </span>
                  </div>
                  <AnimatedProgressBar value={progress} />
                </div>
              </div>

              {/* Tabs de Gestión */}
              <Card className="bg-white shadow-md w-full rounded-lg mb-8">
                <CardHeader className="p-2 sm:p-4">
                  <CardTitle className="text-lg sm:text-xl text-purple-700">Gestión</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                      <TabsTrigger
                          value="announcements"
                          className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                      >
                        <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline ml-1 sm:ml-2">Anuncios</span>
                      </TabsTrigger>
                      <TabsTrigger
                          value="groups"
                          className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                      >
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline ml-1 sm:ml-2">Grupos ({groups.length})</span>
                      </TabsTrigger>
                      <TabsTrigger
                          value="participants"
                          className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                      >
                        <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline ml-1 sm:ml-2">
                      Estudiantes ({participants && participants.students ? participants.students.length : 0})
                    </span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="announcements">
                      <CreateAnnouncement managementId={management.id} onAnnouncementCreated={handleAnnouncementCreated} />
                      <AnnouncementList announcements={announcements} />
                    </TabsContent>

                    <TabsContent value="groups">
                      {errorMessage ? (
                          <p className="mt-4 text-red-500">{errorMessage}</p>
                      ) : (
                          <GroupListComponent
                              groups={groups}
                              handleEvaluateClick={handleEvaluateClick}
                              handleViewDetails={handleViewDetails}
                              getInitials={(name, lastName) => `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()}
                          />
                      )}
                    </TabsContent>

                    <TabsContent value="participants">
                      <ParticipantList participants={participants} getInitials={(name, lastName) => `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {selectedGroupDetails && (
                  <GroupDetails group={selectedGroupDetails} onClose={() => setSelectedGroupDetails(null)} />
              )}
            </>
        )}
      </motion.div>
  );
}
