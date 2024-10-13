import React, { useState, useEffect } from 'react';
import { getData, postData } from '../api/apiService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Bell, Users, Layers, Calendar, Megaphone, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CourseInfo from './CourseInfo';
import GroupList from './GroupList';
import ParticipantList from './ParticipantList';
import GroupDetails from './GroupDetail';
import AnnouncementList from './AnnouncementList';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInGroup, setIsInGroup] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [managementDetails, setManagementDetails] = useState(null);
  const [groups, setGroups] = useState([]);
  const [participants, setParticipants] = useState({teacher: null, students: []});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("announcements");
  const { toast } = useToast();

  useEffect(() => {
    checkManagement();
  }, []);

  const checkManagement = async () => {
    setIsLoading(true);
    try {
      const response = await getData('/student/management');
      if (response && response.success && response.data && response.data.management) {
        setManagementDetails(response.data.management);
        setIsInGroup(true);
        await Promise.all([
          fetchGroups(response.data.management.id),
          fetchParticipants(response.data.management.id),
          fetchAnnouncements(response.data.management.id)
        ]);
      } else {
        setIsInGroup(false);
      }
    } catch (error) {
      console.error('Error al verificar la gestión:', error);
      setIsInGroup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (managementId) => {
    try {
      const groupsResponse = await getData(`/managements/${managementId}/groups`);
      if (groupsResponse && groupsResponse.success && groupsResponse.data && groupsResponse.data.groups) {
        setGroups(groupsResponse.data.groups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
      setGroups([]);
    }
  };

  const fetchParticipants = async (managementId) => {
    try {
      const participantsResponse = await getData(`/managements/${managementId}/students`);
      if (participantsResponse && participantsResponse.teacher && participantsResponse.students) {
        setParticipants({
          teacher: participantsResponse.teacher,
          students: participantsResponse.students
        });
      } else {
        setParticipants({teacher: null, students: []});
      }
    } catch (error) {
      console.error('Error al obtener los participantes:', error);
      setParticipants({teacher: null, students: []});
    }
  };

  const fetchAnnouncements = async (managementId) => {
    try {
      const announcementsResponse = await getData(`/managements/${managementId}/announcements`);
      if (announcementsResponse && announcementsResponse.success && announcementsResponse.data) {
        setAnnouncements(announcementsResponse.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error al obtener los anuncios:', error);
      setAnnouncements([]);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await postData('/managements/join', {management_code: groupCode});

      if (response.success) {
        toast({
          title: "Éxito",
          description: response.message || "Te has unido al grupo exitosamente.",
          duration: 3000,
        });
        await checkManagement();
      } else {
        let errorMessage = response.message || "Error al unirse al grupo.";

        if (response.code === 252) {
          errorMessage = response.data?.management_code?.[0] || "Código de gestión inválido.";
        } else if (response.code === 264) {
          errorMessage = "El código de gestión aún no está activo. No puedes unirte en este momento.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al unirse al grupo:', error);
      let errorMessage = "Ocurrió un error al intentar unirse al grupo. Por favor, inténtalo de nuevo.";

      if (error.response) {
        const {data, status} = error.response;
        if (status === 422 && data.code === 252) {
          errorMessage = data.data?.management_code?.[0] || "Código de gestión inválido.";
        } else if (data.code === 252) {
          errorMessage = data.data?.management_code?.[0] || "Código de gestión inválido.";
        } else if (data.code === 264) {
          errorMessage = "El código de gestión aún no está activo. No puedes unirte en este momento.";
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
      setGroupCode('');
    }
  };

  const getInitials = (name, lastName) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600"/>
        <span className="ml-2 text-lg font-medium text-purple-600">Cargando...</span>
      </div>
    );
  }

  if (isInGroup && managementDetails) {
    return (
      <div className="p-4 space-y-6">
        <CourseInfo managementDetails={managementDetails} />
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-3 mb-4 bg-purple-100 p-1 rounded-lg">
    <TabsTrigger
      value="announcements"
      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-200 ease-in-out"
    >
      <Megaphone className="w-4 h-4 mr-2 sm:mr-0" />
      <span className="hidden sm:block">Anuncios</span>
    </TabsTrigger>
    <TabsTrigger
      value="groups"
      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-200 ease-in-out"
    >
      <Users className="w-4 h-4 mr-2 sm:mr-0" />
      <span className="hidden sm:block">Grupos ({groups.length})</span>
    </TabsTrigger>
    <TabsTrigger
      value="participants"
      className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-md transition-all duration-200 ease-in-out"
    >
      <GraduationCap className="w-4 h-4 mr-2 sm:mr-0" />
      <span className="hidden sm:block">Estudiantes ({participants.students.length})</span>
    </TabsTrigger>
  </TabsList>
  <div className="mt-4">
    <TabsContent value="announcements">
      <AnnouncementList announcements={announcements} />
    </TabsContent>
    <TabsContent value="groups">
      <GroupList
        groups={groups}
        onSelectGroup={handleSelectGroup}
        getInitials={getInitials}
      />
    </TabsContent>
    <TabsContent value="participants">
      <ParticipantList participants={participants} getInitials={getInitials} />
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
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl text-purple-700">No estás inscrito en un curso</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Ingrese el código de la clase"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleJoinGroup} className="w-full bg-purple-600 hover:bg-purple-700">
            Unirse a Clase
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}