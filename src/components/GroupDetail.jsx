import React, { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Users } from "lucide-react"

export default function GroupDetails({ group, onClose, getInitials }) {
  if (!group) return null

  return (
    <Dialog open={!!group} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[600px] p-0 overflow-hidden rounded-lg">
        <Tabs defaultValue="info" className="w-full h-full flex flex-col">
          <div className="bg-gray-100 p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Detalles del Grupo</h2>
            <TabsList className="grid w-[160px] grid-cols-2 bg-gray-200">
              <TabsTrigger value="info" className="text-sm">Info</TabsTrigger>
              <TabsTrigger value="members" className="text-sm">Miembros</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-grow">
            <TabsContent value="info" className="p-4 focus:outline-none">
              <GroupInfo group={group} getInitials={getInitials} />
            </TabsContent>
            <TabsContent value="members" className="p-4 focus:outline-none">
              <GroupMembers members={group.members} getInitials={getInitials} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function GroupInfo({ group, getInitials }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-gray-200">
          <AvatarImage src={group.logo || '/placeholder.svg?height=64&width=64'} alt={group.short_name} />
          <AvatarFallback className="text-lg bg-gray-200 text-gray-700">
            {getInitials(group.short_name, group.long_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{group.short_name}</h3>
          <p className="text-sm text-gray-600">{group.long_name}</p>
        </div>
      </div>
      <InfoItem icon={Mail} label="Email" value={group.contact_email} />
      <InfoItem icon={Phone} label="Teléfono" value={group.contact_phone} />
    </div>
  )
}

function GroupMembers({ members, getInitials }) {
  const representative = Object.values(members).find(m => m.role === 'representative')
  const regularMembers = Object.values(members).filter(m => m.role !== 'representative')

  return (
    <div className="space-y-4">
      {representative && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-gray-600">Representante</h4>
          <MemberItem member={representative} getInitials={getInitials} />
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-600">Miembros ({regularMembers.length})</h4>
        <div className="space-y-2">
          {regularMembers.map((member) => (
            <MemberItem key={member.id} member={member} getInitials={getInitials} />
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
      <Icon className="h-5 w-5 text-gray-500" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  )
}

function MemberItem({ member, getInitials }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
          {getInitials(member.name, member.last_name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium text-gray-800">{`${member.name} ${member.last_name}`}</p>
        <p className="text-xs text-gray-600">{member.role === 'representative' ? 'Representante' : 'Miembro'}</p>
      </div>
    </div>
  )
}