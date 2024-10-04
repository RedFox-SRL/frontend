import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getGroupMembers } from '../api/groupService'

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
  const { toast } = useToast()

  useEffect(() => {
    fetchGroupMembers()
  }, [groupId])

  const fetchGroupMembers = async () => {
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
    }
  }

  if (members.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay miembros en este grupo.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <CardHeader className="bg-purple-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">Miembros del Equipo</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg transition-all duration-200 hover:bg-purple-100">
              <Avatar className="h-12 w-12 border-2 border-purple-300">
                <AvatarFallback className="bg-purple-200 text-purple-700">{`${member.name.charAt(0)}${member.last_name.charAt(0)}`}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-purple-900">{`${member.name} ${member.last_name} ${member.email}`}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
                  {member.role ? (roles[member.role] || member.role) : 'Sin rol asignado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}