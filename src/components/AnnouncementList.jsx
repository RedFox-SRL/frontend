import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";

export default function AnnouncementList({ announcements }) {
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);

  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
        prev.includes(id) ? prev.filter((annId) => annId !== id) : [...prev, id]
    );
  };

  return (
      <div className=" mx-auto p-0">
        {announcements.length > 0 ? (
            announcements.map((announcement) => {
              const isExpandable = announcement.content.length > 100;

              return (
                  <Card key={announcement.id} className="mb-4 shadow-md border border-gray-200 rounded-lg">
                    <CardHeader className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="bg-purple-100">
                            <AvatarImage src={announcement.user?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-purple-600 bg-purple-200">
                              {announcement.user?.name?.charAt(0).toUpperCase() || "U"}
                              {announcement.user?.last_name?.charAt(0).toUpperCase() || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {announcement.user?.name
                                  ? `${announcement.user.name} ${announcement.user.last_name}`
                                  : "Usuario Desconocido"}
                            </div>
                            <CardDescription className="text-xs text-gray-500">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-purple-200 text-purple-700">
                          {announcement.category || "General"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="px-3 py-2">
                      <div
                          className={`text-sm text-gray-600 mb-2 ${
                              isExpandable && !expandedAnnouncements.includes(announcement.id) ? "line-clamp-3" : ""
                          }`}
                          style={{
                            overflow: "hidden",
                            wordWrap: "break-word",
                            whiteSpace: expandedAnnouncements.includes(announcement.id) ? "normal" : "nowrap",
                            display: "-webkit-box",
                            WebkitLineClamp: expandedAnnouncements.includes(announcement.id) ? "unset" : "3",
                            WebkitBoxOrient: "vertical",
                          }}
                      >
                        <div
                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                            className="prose prose-sm text-gray-800 list-disc list-inside max-w-none"
                        />
                      </div>

                      {(announcement.files?.length > 0 || announcement.links?.length > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {announcement.files?.map((file, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline text-sm"
                                  >
                                    {file.name || `Archivo ${index + 1}`}
                                  </a>
                                </Badge>
                            ))}
                            {announcement.links?.map((link) => (
                                <Badge
                                    key={link.url}
                                    variant="outline"
                                    className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  <LinkIcon className="h-3 w-3" />
                                  <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline text-sm"
                                  >
                                    {link.url}
                                  </a>
                                </Badge>
                            ))}
                          </div>
                      )}

                      {isExpandable && (
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(announcement.id)}
                              className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                          >
                            {expandedAnnouncements.includes(announcement.id) ? (
                                <>Menos <ChevronUp className="ml-1 h-4 w-4" /></>
                            ) : (
                                <>Más <ChevronDown className="ml-1 h-4 w-4" /></>
                            )}
                          </Button>
                      )}
                    </CardContent>
                  </Card>
              );
            })
        ) : (
            <p className="text-center text-gray-500">No hay anuncios disponibles.</p>
        )}
      </div>
  );
}
