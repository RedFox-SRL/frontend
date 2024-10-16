import React, { useState } from 'react'
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Copy, Check, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"

const CopyButton = ({ value, icon: Icon }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-gray-700"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copiado!' : 'Copiar'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-2 text-sm">
    <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
    <span className="text-gray-700 font-medium">{label}:</span>
    <span className="text-gray-900 truncate">{value}</span>
    <CopyButton value={value} icon={Copy} />
  </div>
)

const MemberCard = ({ member, getInitials }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-purple-200">
          <AvatarImage src={member.avatar || `/placeholder.svg?height=64&width=64`} alt={`${member.name} ${member.last_name}`} />
          <AvatarFallback className="text-lg bg-purple-100 text-purple-600">
            {getInitials(member.name, member.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">
            {member.name} {member.last_name}
          </h4>
          {member.role === 'representative' && (
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-1">
              Representante
            </span>
          )}
          {member.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function GroupDetails({ group, onClose, getInitials }) {
  if (!group) return null

  const members = Object.values(group.members)
  const representative = members.find(m => m.role === 'representative')
  const regularMembers = members.filter(m => m.role !== 'representative')

  return (
    <Dialog open={!!group} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[700px] p-0 overflow-hidden rounded-xl bg-gray-100 [&>button]:hidden">
        <div className="flex flex-col h-[90vh] max-h-[80vh]">
          <div className="bg-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2"> {/* Update: Changed mb-4 to mb-2 */}
              <h2 className="text-2xl font-bold">{group.short_name}</h2>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-purple-100 p-0 text-purple-600 hover:bg-purple-200 hover:text-purple-700"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              </DialogClose>
            </div>
            <p className="text-purple-200">{group.long_name}</p>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de contacto</h3>
                  <InfoItem icon={Mail} label="Email" value={group.contact_email} />
                  <InfoItem icon={Phone} label="Teléfono" value={group.contact_phone} />
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Miembros del grupo</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {representative && (
                    <MemberCard member={representative} getInitials={getInitials} />
                  )}
                  {regularMembers.map((member) => (
                    <MemberCard key={member.id} member={member} getInitials={getInitials} />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}