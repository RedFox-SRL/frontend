import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getGroupMembers } from '../api/groupService'
import { Loader2 } from "lucide-react"

const roles = {
  developer: 'Desarrollador',
  qa: 'Control de Calidad',
  designer: 'Diseñador',
  product_owner: 'Product Owner',
  scrum_master: 'Scrum Master',
}

const roleColors = {
  developer: 'bg-blue-100 text-blue-800',
  qa: 'bg-green-100 text-green-800',
  designer: 'bg-purple-100 text-purple-800',
  product_owner: 'bg-yellow-100 text-yellow-800',
  scrum_master: 'bg-red-100 text-red-800',
}

export default function GroupMemberListMember({ groupId }) {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchGroupMembers()
  }, [groupId])

  const fetchGroupMembers = async () => {
    setIsLoading(true)
    try {
      const response = await getGroupMembers(groupId)
      if (response.success && response.data && Array.isArray(response.data.members)) {
        setMembers(response.data.members)
      } else {
        console.error('Unexpected response structure:', response)
        toast({
          title: "Error",
          description: "La estructura de la respuesta es inesperada.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching group members:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los miembros del grupo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-purple-600 py-4 px-6">
          <CardTitle className="text-xl font-bold text-white">Miembros del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (members.length === 0) {
    return (
      <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-purple-600 py-4 px-6">
          <CardTitle className="text-xl font-bold text-white">Miembros del Equipo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay miembros en este grupo.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-purple-600 py-4 px-6">
        <CardTitle className="text-xl font-bold text-white">Miembros del Equipo</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="bg-purple-50 hover:bg-purple-100 transition-all duration-200">
              <CardContent className="p-4 flex items-start space-x-4">
                <Avatar className="h-12 w-12 border-2 border-purple-300 flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${member.name} ${member.last_name}`} />
                  <AvatarFallback className="bg-purple-200 text-purple-700">
                    {member.name.charAt(0).toUpperCase() + member.last_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-purple-900 truncate">
                    {`${member.name} ${member.last_name}`}
                  </div>
                  <p className="text-sm text-purple-600 truncate">{member.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
                    {member.role ? (roles[member.role] || member.role) : 'Sin rol asignado'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}