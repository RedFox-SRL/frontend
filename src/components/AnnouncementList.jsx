import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, LinkIcon, Paperclip } from "lucide-react";

const MAX_CONTENT_LENGTH = 200;

export default function AnnouncementList({ announcements }) {
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
  const [sortedAnnouncements, setSortedAnnouncements] = useState([]);

  useEffect(() => {
    const sorted = [...announcements].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    setSortedAnnouncements(sorted);
  }, [announcements]);

  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((annId) => annId !== id) : [...prev, id],
    );
  };

  const sanitizeContent = (content) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "li", "ol", "a"],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  };

  const truncateContent = (content, isExpanded) => {
    return content.length > MAX_CONTENT_LENGTH && !isExpanded
      ? `${content.slice(0, MAX_CONTENT_LENGTH)}...`
      : content;
  };

  const renderFilePreview = (file) => {
    if (file.mime_type && file.mime_type.startsWith("image/")) {
      return (
        <div className="flex items-center gap-2">
          <img
            src={file.url}
            alt={file.name}
            className="w-10 h-10 rounded object-cover"
          />
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-sm text-purple-700"
          >
            {file.name}
          </a>
        </div>
      );
    }
    return null;
  };

  const renderLinkPreview = (link) => {
    return link.image ? (
      <div className="flex items-center gap-2">
        <img
          src={link.image}
          alt="Preview"
          className="w-10 h-10 rounded object-cover"
        />
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-sm text-purple-700"
        >
          {link.title || "Enlace"}
        </a>
      </div>
    ) : null;
  };

  const renderNonPreviewFile = (file) => (
    <div className="flex items-center gap-2">
      <Paperclip className="h-4 w-4 text-purple-500" />
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-sm text-purple-700"
      >
        {file.name || "Archivo"}
      </a>
    </div>
  );

  const renderNonPreviewLink = (link) => (
    <div className="flex items-center gap-2">
      <LinkIcon className="h-4 w-4 text-purple-500" />
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-sm text-purple-700"
      >
        {link.title || "Enlace"}
      </a>
    </div>
  );

  return (
    <div className="container mx-auto p-0">
      {sortedAnnouncements.length > 0 ? (
        sortedAnnouncements.map((announcement) => {
          const isExpanded = expandedAnnouncements.includes(announcement.id);
          const content = truncateContent(announcement.content, isExpanded);

          const previewFiles =
            announcement.files?.filter(
              (file) => file.mime_type && file.mime_type.startsWith("image/"),
            ) || [];
          const nonPreviewFiles =
            announcement.files?.filter(
              (file) => !file.mime_type || !file.mime_type.startsWith("image/"),
            ) || [];

          const previewLinks =
            announcement.links?.filter((link) => link.image) || [];
          const nonPreviewLinks =
            announcement.links?.filter((link) => !link.image) || [];

          return (
            <Card
              key={`${announcement.id}-${announcement.created_at}`}
              className="mb-4 shadow-md border border-gray-200 rounded-lg"
            >
              <CardHeader className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="bg-purple-100">
                      <AvatarImage
                        src={announcement.user?.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-purple-600 bg-purple-200">
                        {announcement.user?.name?.charAt(0).toUpperCase() ||
                          "U"}
                        {announcement.user?.last_name
                          ?.charAt(0)
                          .toUpperCase() || "D"}
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
                  <Badge
                    variant="secondary"
                    className="bg-purple-200 text-purple-700"
                  >
                    {announcement.is_global ? "Global" : "Grupo"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-3 py-2">
                <div
                  className={`text-sm text-gray-600 mb-2 prose prose-purple max-w-full ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}
                  style={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }}
                />

                {(previewFiles.length > 0 || previewLinks.length > 0) && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {previewFiles.map((file, index) => (
                      <div
                        key={`file-preview-${index}`}
                        className="flex flex-col items-center"
                      >
                        {renderFilePreview(file)}
                      </div>
                    ))}
                    {previewLinks.map((link, index) => (
                      <div
                        key={`link-preview-${index}`}
                        className="flex flex-col items-center"
                      >
                        {renderLinkPreview(link)}
                      </div>
                    ))}
                  </div>
                )}

                {(nonPreviewFiles.length > 0 || nonPreviewLinks.length > 0) && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {nonPreviewFiles.map((file, index) => (
                      <div
                        key={`file-${index}`}
                        className="flex flex-col items-center"
                      >
                        {renderNonPreviewFile(file)}
                      </div>
                    ))}
                    {nonPreviewLinks.map((link, index) => (
                      <div
                        key={`link-${index}`}
                        className="flex flex-col items-center"
                      >
                        {renderNonPreviewLink(link)}
                      </div>
                    ))}
                  </div>
                )}

                {announcement.content.length > MAX_CONTENT_LENGTH && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(announcement.id)}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                  >
                    {isExpanded ? (
                      <>
                        Menos <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Más <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-center text-gray-500">
          No hay anuncios disponibles.
        </p>
      )}
    </div>
  );
}
