import React from 'react';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"

export default function GroupDetail({ selectedGroup, onClose, getInitials }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{selectedGroup.short_name}</h3>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-6 w-6"/>
          </Button>
        </div>
        <div className="relative h-40 mb-4">
          <img
            src={selectedGroup.logo || '/placeholder.svg?height=160&width=320'}
            alt=""
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Avatar className="w-20 h-20 border-4 border-white">
              <AvatarFallback className="text-3xl">
                {getInitials(selectedGroup.short_name, selectedGroup.long_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <p className="mb-2"><strong>Email:</strong> {selectedGroup.contact_email}</p>
        <p className="mb-2"><strong>Teléfono:</strong> {selectedGroup.contact_phone}</p>
        <p className="mb-4"><strong>Integrantes:</strong></p>
        <div className="space-y-2">
          {Object.values(selectedGroup.members).map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{getInitials(member.name, member.last_name)}</AvatarFallback>
              </Avatar>
              <p>{`${member.name} ${member.last_name}`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}