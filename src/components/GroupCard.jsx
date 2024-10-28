import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const GroupCard = ({
  group,
  colorScheme,
  handleEvaluateClick,
  handleViewDetails,
  getInitials,
}) => (
  <Card
    key={group.short_name}
    className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
  >
    <CardContent className="p-0">
      <div className={`${colorScheme.bg} p-4 flex items-center space-x-4`}>
        <Avatar className="w-16 h-16 border-2 border-white shadow-md">
          <AvatarImage
            src={group.logo || "/placeholder.svg?height=64&width=64"}
            alt={group.short_name}
          />
          <AvatarFallback className="text-xl bg-white text-gray-800 font-semibold">
            {getInitials(group.short_name, group.long_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className={`text-xl font-bold ${colorScheme.text}`}>
            {group.short_name}
          </h3>
          <p className={`text-sm ${colorScheme.text} opacity-90`}>
            {group.long_name}
          </p>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="space-y-2 mb-4">
          <p className="flex items-center text-sm text-gray-600">
            <Mail className="mr-2 h-4 w-4 text-gray-400" />
            {group.contact_email || "No disponible"}
          </p>
          <p className="flex items-center text-sm text-gray-600">
            <Phone className="mr-2 h-4 w-4 text-gray-400" />
            {group.contact_phone || "No disponible"}
          </p>
          <p className="flex items-center text-sm text-gray-600">
            <Users className="mr-2 h-4 w-4 text-gray-400" />
            {group.members.length} integrantes
          </p>
        </div>
        <Button
          className={`w-full ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} transition-colors duration-300`}
          onClick={() => handleEvaluateClick(group.id)}
        >
          Evaluar
        </Button>
        <Button
          className={`w-full mt-2 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} transition-all duration-300`}
          onClick={() => handleViewDetails(group)}
        >
          Ver detalles
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default GroupCard;
