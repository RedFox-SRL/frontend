import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Users, Link } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GroupDetails({ group, onClose, getInitials }) {
  if (!group) return null

  return (
    <Dialog open={!!group} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Detalles del Grupo
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
              <AvatarImage src={group.logo || '/placeholder.svg?height=128&width=128'} alt={group.short_name} />
              <AvatarFallback className="text-3xl bg-purple-200 text-purple-700">{getInitials(group.short_name, group.long_name)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-2xl font-semibold text-purple-800">{group.short_name}</h3>
              <p className="text-lg text-purple-600">{group.long_name}</p>
              <p className="text-sm text-purple-500">ID: {group.id}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
              <Mail className="h-5 w-5 text-purple-600" />
              <p className="text-sm overflow-hidden overflow-ellipsis">{group.contact_email}</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm">
              <Phone className="h-5 w-5 text-purple-600" />
              <p className="text-sm">{group.contact_phone}</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm sm:col-span-2">
              <Link className="h-5 w-5 text-purple-600" />
              <p className="text-sm overflow-hidden overflow-ellipsis">
                {`https://example.com/group/${group.id}`}
              </p>
              <Button variant="outline" size="sm" className="ml-auto">
                Copiar
              </Button>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-700">
              <Users className="h-5 w-5" />
              Participantes ({Object.keys(group.members).length})
            </h4>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="grid gap-4">
                {Object.values(group.members).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-purple-200 text-purple-700">
                        {getInitials(member.name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-purple-900">{`${member.name} ${member.last_name}`}</p>
                      <Badge variant={member.role === 'representative' ? "default" : "secondary"} className="mt-1">
                        {member.role === 'representative' ? 'Representante' : 'Miembro'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}