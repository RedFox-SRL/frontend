import React from 'react'
import {Dialog, DialogContent, DialogClose} from "@/components/ui/dialog"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Mail, Phone, Copy, Check, X, Users} from "lucide-react"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Button} from "@/components/ui/button"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"

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

const CopyButton = ({value, icon: Icon}) => {
    const [copied, setCopied] = React.useState(false)

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
                        className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-gray-700"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4"/> :
                            <Icon className="h-3 w-3 sm:h-4 sm:h-4"/>}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs sm:text-sm">{copied ? 'Copiado!' : 'Copiar'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

const InfoItem = ({icon: Icon, label, value}) => (
    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0"/>
        <span className="text-gray-700 font-medium">{label}:</span>
        <span className="text-gray-900 truncate flex-grow">{value}</span>
        <CopyButton value={value} icon={Copy}/>
    </div>
)

const MemberCard = ({member, isRepresentative, getInitials}) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-purple-200">
                    <AvatarImage src={member.avatar || `/placeholder.svg?height=48&width=48`}
                                 alt={`${member.name} ${member.last_name}`}/>
                    <AvatarFallback className="text-xs sm:text-sm bg-purple-100 text-purple-600">
                        {getInitials(member.name, member.last_name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                        {member.name} {member.last_name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {isRepresentative && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                Representante
                            </Badge>
                        )}
                        {member.role && (
                            <Badge variant="secondary"
                                   className={`text-xs ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
                                {roles[member.role] || member.role}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 text-purple-500"/>
                        <span className="truncate">{member.email}</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function GroupDetails({group, onClose, getInitials}) {
    if (!group) return null

    const representative = group.representative
    const members = group.members

    return (
        <Dialog open={!!group} onOpenChange={onClose}>
            <DialogContent
                className="w-[95vw] max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-0 overflow-hidden rounded-lg sm:rounded-xl bg-white [&>button]:hidden">
                <div className="flex flex-col h-[90vh] max-h-[80vh]">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 sm:p-6 text-white">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white shadow-lg">
                                    <AvatarImage src={group.logo || `/placeholder.svg?height=64&width=64`}
                                                 alt={group.short_name}/>
                                    <AvatarFallback className="text-sm sm:text-base bg-purple-100 text-purple-600">
                                        {getInitials(group.short_name, '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg sm:text-2xl font-bold">{group.short_name}</h2>
                                    <p className="text-xs sm:text-sm text-purple-200">{group.long_name}</p>
                                </div>
                            </div>
                            <DialogClose asChild>
                                <Button
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-purple-500 p-0 text-white hover:bg-purple-600 hover:text-white"
                                    onClick={onClose}
                                >
                                    <X className="h-4 w-4"/>
                                    <span className="sr-only">Cerrar</span>
                                </Button>
                            </DialogClose>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4 sm:p-6">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg text-purple-800">Información de
                                        contacto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 sm:space-y-3">
                                    <InfoItem icon={Mail} label="Email" value={group.contact_email}/>
                                    <InfoItem icon={Phone} label="Teléfono" value={group.contact_phone}/>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-lg sm:text-xl font-semibold text-purple-800 flex items-center">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600"/>
                                    Miembros del grupo
                                </h3>

                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                                            {members.map((member) => (
                                                <MemberCard
                                                    key={member.id}
                                                    member={member}
                                                    isRepresentative={member.id === representative.id}
                                                    getInitials={getInitials}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}