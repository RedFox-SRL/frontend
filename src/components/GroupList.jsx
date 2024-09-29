import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Users } from "lucide-react"

export default function GroupList({ groups, onSelectGroup, getInitials }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {groups.map((group, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-40">
              <img
                src={group.logo || '/placeholder.svg?height=160&width=320'}
                alt=""
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Avatar className="w-20 h-20 border-4 border-white">
                  <AvatarFallback className="text-3xl">{getInitials(group.short_name, group.long_name)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{group.short_name}</h3>
              <p className="flex items-center mb-1">
                <Mail className="mr-2 h-4 w-4"/>
                {group.contact_email}
              </p>
              <p className="flex items-center mb-1">
                <Phone className="mr-2 h-4 w-4"/>
                {group.contact_phone}
              </p>
              <p className="flex items-center mb-4">
                <Users className="mr-2 h-4 w-4"/>
                {Object.keys(group.members).length} integrantes
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => onSelectGroup(group)}
              >
                Ver Detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}