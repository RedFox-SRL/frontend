import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getData, postData } from "../api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Loader2, Megaphone, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CourseInfo from "./CourseInfo";
import GroupList from "./GroupList";
import ParticipantList from "./ParticipantList";
import GroupDetails from "./GroupDetail";
import AnnouncementList from "./AnnouncementList";
import InvitationModal from "./InvitationModal";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInGroup, setIsInGroup] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [managementDetails, setManagementDetails] = useState(null);
  const [groups, setGroups] = useState([]);
  const [participants, setParticipants] = useState({
    teacher: null,
    students: [],
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
  });
  const [activeTab, setActiveTab] = useState("announcements");

  const { toast } = useToast();

  useEffect(() => {
    checkManagement();
  }, []);

  const handleAnnouncementCreated = async () => {
    if (managementDetails) {
      await fetchAnnouncements(managementDetails.id, 1);
    }
  };

  const checkManagement = async () => {
    setIsLoading(true);
    try {
      const response = await getData("/student/management");
      if (
          response &&
          response.success &&
          response.data &&
          response.data.management
      ) {
        setManagementDetails(response.data.management);
        setIsInGroup(true);
        await Promise.all([
          fetchGroups(response.data.management.id),
          fetchParticipants(response.data.management.id),
          fetchAnnouncements(response.data.management.id, 1),
        ]);
      } else {
        setIsInGroup(false);
      }
    } catch (error) {
      console.error("Error al verificar la gestión:", error);
      setIsInGroup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (managementId) => {
    try {
      const groupsResponse = await getData(
          `/managements/${managementId}/groups`
      );
      if (
          groupsResponse &&
          groupsResponse.success &&
          groupsResponse.data &&
          groupsResponse.data.groups
      ) {
        setGroups(groupsResponse.data.groups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error al obtener los grupos:", error);
      setGroups([]);
    }
  };

  const fetchParticipants = async (managementId) => {
    try {
      const participantsResponse = await getData(`/managements/${managementId}/students`);
      if (participantsResponse && participantsResponse.success && participantsResponse.data) {
        const { teacher, students } = participantsResponse.data;

        setParticipants({
          teacher,
          students,
        });
      } else {
        setParticipants({ teacher: null, students: [] });
      }
    } catch (error) {
      console.error("Error al obtener los participantes:", error);
      setParticipants({ teacher: null, students: [] });
    }
  };


  const fetchAnnouncements = async (managementId, page = 1) => {
    try {
      const url = `/management/${managementId}/announcements?page=${page}`;
      const announcementsResponse = await getData(url);

      if (announcementsResponse && announcementsResponse.data) {
        const rawData = announcementsResponse.data;

        const announcementsArray =
            Array.isArray(rawData) ? rawData : Object.values(rawData);

        setAnnouncements(announcementsArray);
        setPagination({
          currentPage: announcementsResponse.current_page || 1,
          lastPage: announcementsResponse.last_page || 1,
        });
      } else {
        setAnnouncements([]);
        setPagination({ currentPage: 1, lastPage: 1 });
      }
    } catch (error) {
      console.error("Error al obtener los anuncios:", error);
      setAnnouncements([]);
      setPagination({ currentPage: 1, lastPage: 1 });
    }
  };


  const renderPagination = () => {
    if (pagination.lastPage <= 1) {
      return null;
    }

    const getPageRange = () => {
      const totalVisible = window.innerWidth <= 768 ? 3 : 7;
      const half = Math.floor(totalVisible / 2);
      let start = Math.max(1, pagination.currentPage - half);
      let end = Math.min(pagination.lastPage, pagination.currentPage + half);

      if (pagination.currentPage <= half) {
        end = Math.min(totalVisible, pagination.lastPage);
      } else if (pagination.currentPage > pagination.lastPage - half) {
        start = Math.max(1, pagination.lastPage - totalVisible + 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const pages = getPageRange();

    return (
        <div className="flex justify-center mt-6 gap-2">
          <Button
              onClick={() => fetchAnnouncements(managementDetails.id, pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="bg-purple-100 hover:bg-purple-300 text-purple-700"
          >
            {"<"}
          </Button>
          {pages.map((page) => (
              <Button
                  key={page}
                  onClick={() => fetchAnnouncements(managementDetails.id, page)}
                  className={`${
                      pagination.currentPage === page
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 hover:bg-purple-300 text-purple-700"
                  }`}
              >
                {page}
              </Button>
          ))}
          <Button
              onClick={() => fetchAnnouncements(managementDetails.id, pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="bg-purple-100 hover:bg-purple-300 text-purple-700"
          >
            {">"}
          </Button>
        </div>
    );
  };

  const handleJoinGroup = async () => {
    try {
      const response = await postData("/managements/join", {
        management_code: groupCode,
      });

      if (response.success) {
        toast({
          title: "Éxito",
          description:
              response.message || "Te has unido al grupo exitosamente.",
          duration: 3000,
        });
        await checkManagement();
      } else {
        let errorMessage = response.message || "Error al unirse al grupo.";

        if (response.code === 252) {
          errorMessage =
              response.data?.management_code?.[0] ||
              "Código de gestión inválido.";
        } else if (response.code === 264) {
          errorMessage =
              "El código de gestión aún no está activo. No puedes unirte en este momento.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al unirse al grupo:", error);
      let errorMessage =
          "Ocurrió un error al intentar unirse al grupo. Por favor, inténtalo de nuevo.";

      if (error.response) {
        const { data, status } = error.response;
        if (status === 422 && data.code === 252) {
          errorMessage =
              data.data?.management_code?.[0] || "Código de gestión inválido.";
        } else if (data.code === 252) {
          errorMessage =
              data.data?.management_code?.[0] || "Código de gestión inválido.";
        } else if (data.code === 264) {
          errorMessage =
              "El código de gestión aún no está activo. No puedes unirte en este momento.";
        } else {
          errorMessage = data.message || errorMessage;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setGroupCode("");
    }
  };

  const getInitials = (name, lastName) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const memoizedCourseInfo = useMemo(() => {
    return managementDetails ? (
        <CourseInfo managementDetails={managementDetails} />
    ) : null;
  }, [managementDetails]);

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

  if (isInGroup && managementDetails) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sm:p-4 space-y-2 sm:space-y-4"
        >
          <InvitationModal />
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sm:p-4 space-y-2 sm:space-y-4"
          >
          </motion.div>
          {memoizedCourseInfo}
          <Card className="w-full shadow-sm">
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-lg sm:text-xl text-purple-700">
                Dashboard del Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1 sm:p-4">
              <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-2 sm:mb-4 bg-purple-100 p-0.5 sm:p-1 rounded-md">
                  <TabsTrigger
                      value="announcements"
                      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                  >
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline ml-1 sm:ml-2">
                    Anuncios
                  </span>
                  </TabsTrigger>
                  <TabsTrigger
                      value="groups"
                      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline ml-1 sm:ml-2">
                    Grupos ({groups.length})
                  </span>
                  </TabsTrigger>
                  <TabsTrigger
                      value="participants"
                      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-sm sm:rounded-md transition-all duration-200 ease-in-out text-xs sm:text-sm"
                  >
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline ml-1 sm:ml-2">
                    Estudiantes ({participants.students.length})
                  </span>
                  </TabsTrigger>
                </TabsList>
                <div className="mt-2 sm:mt-4">
                  <TabsContent value="announcements">
                    <div className="mb-4">{renderPagination()}</div>
                    <div className="mb-4">
                      <AnnouncementList announcements={announcements} />
                    </div>
                    {renderPagination()}
                  </TabsContent>
                  <TabsContent value="groups">
                    <GroupList
                        groups={groups}
                        onSelectGroup={handleSelectGroup}
                        getInitials={getInitials}
                    />
                  </TabsContent>
                  <TabsContent value="participants">
                    <ParticipantList
                        participants={participants}
                        getInitials={getInitials}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
          <GroupDetails
              group={selectedGroup}
              onClose={() => setSelectedGroup(null)}
              getInitials={getInitials}
          />
        </motion.div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-screen p-2"
      >
        <Card className="w-full max-w-xs sm:max-w-sm shadow-sm">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-center text-base sm:text-lg text-purple-700">
              No estás inscrito en un curso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <Input
                type="text"
                placeholder="Ingrese el código de la clase"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                className="mb-3 sm:mb-4 text-sm"
            />
            <Button
                onClick={handleJoinGroup}
                className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
            >
              Unirse a Clase
            </Button>
          </CardContent>
        </Card>
      </motion.div>
  );
}