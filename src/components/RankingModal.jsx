import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const mockMembers = [
  {
    id: 1,
    name: "Juan Pérez",
    role: "Desarrollador",
    email: "juan.perez@example.com",
  },
  {
    id: 2,
    name: "María García",
    role: "Scrum Master",
    email: "maria.garcia@example.com",
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    role: "QA",
    email: "carlos.mendoza@example.com",
  },
  {
    id: 4,
    name: "Ana López",
    role: "Product Owner",
    email: "ana.lopez@example.com",
  },
  {
    id: 5,
    name: "Luis Fernández",
    role: "Diseñador",
    email: "luis.fernandez@example.com",
  },
];

export default function RankingModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] p-4 rounded-lg text-purple-800">
        <DialogHeader>
          <DialogTitle>Ranking del Grupo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold text-purple-800">
            Miembros del grupo
          </h3>

          <div className="space-y-3">
            {mockMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-purple-300">
                    <AvatarImage
                      src={`/placeholder.svg?height=48&width=48`}
                      alt={member.name}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>

                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="w-5 h-5 text-yellow-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
