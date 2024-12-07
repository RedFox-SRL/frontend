import React, {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import {Card, CardContent, CardDescription, CardFooter, CardHeader,} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {AlertCircle, ChevronDown, ChevronUp, LinkIcon, Paperclip} from 'lucide-react';

const MAX_CONTENT_LENGTH = 200;

export default function AnnouncementList({announcements}) {
    const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
    const [sortedAnnouncements, setSortedAnnouncements] = useState([]);

    useEffect(() => {
        const sorted = [...announcements].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSortedAnnouncements(sorted);
    }, [announcements]);

    const toggleExpanded = (id) => {
        setExpandedAnnouncements((prev) =>
            prev.includes(id) ? prev.filter((annId) => annId !== id) : [...prev, id]
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
                <div className="relative group overflow-hidden rounded-lg">
                    <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-40 object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-sm font-medium hover:underline"
                        >
                            Ver imagen
                        </a>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderLinkPreview = (link) => {
        return link.image ? (
            <div className="relative group overflow-hidden rounded-lg">
                <img
                    src={link.image}
                    alt={link.title || "Preview"}
                    className="w-full h-40 object-cover"
                />
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm font-medium hover:underline"
                    >
                        {link.title || "Ver enlace"}
                    </a>
                </div>
            </div>
        ) : null;
    };

    const renderYouTubeVideos = (videos) => {
        return videos.map((video, index) => (
            <div
                key={`youtube-video-${index}`}
                className="relative group overflow-hidden rounded-lg"
            >
                <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                />
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm font-medium hover:underline"
                    >
                        Ver video
                    </a>
                </div>
            </div>
        ));
    };

    const renderNonPreviewFile = (file) => (
        <div
            className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <Paperclip className="h-5 w-5 text-purple-500 flex-shrink-0"/>
            <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-sm text-purple-700 truncate flex-grow"
            >
                {file.name || "Archivo"}
            </a>
        </div>
    );

    const renderNonPreviewLink = (link) => (
        <div
            className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <LinkIcon className="h-5 w-5 text-purple-500 flex-shrink-0"/>
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-sm text-purple-700 truncate flex-grow"
            >
                {link.title || "Enlace"}
            </a>
        </div>
    );

    const renderAnnouncementContent = (announcement, isExpanded) => {
        const content = truncateContent(announcement.content, isExpanded);
        const previewFiles = announcement.files?.filter(file => file.mime_type && file.mime_type.startsWith("image/")) || [];
        const nonPreviewFiles = announcement.files?.filter(file => !file.mime_type || !file.mime_type.startsWith("image/")) || [];
        const previewLinks = announcement.links?.filter(link => link.image) || [];
        const nonPreviewLinks = announcement.links?.filter(link => !link.image) || [];
        const youtubeVideos = announcement.youtube_videos || [];

        return (
            <>
                <div
                    className={`text-gray-700 mb-4 prose prose-purple max-w-full ${
                        isExpanded ? "" : "line-clamp-3"
                    }`}
                    style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{__html: sanitizeContent(content)}}
                />

                {(previewFiles.length > 0 || previewLinks.length > 0 || youtubeVideos.length > 0) && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Contenido multimedia</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {previewFiles.map((file, index) => (
                                <div key={`file-preview-${index}`}>{renderFilePreview(file)}</div>
                            ))}
                            {previewLinks.map((link, index) => (
                                <div key={`link-preview-${index}`}>{renderLinkPreview(link)}</div>
                            ))}
                            {renderYouTubeVideos(youtubeVideos)}
                        </div>
                    </div>
                )}

                {(nonPreviewFiles.length > 0 || nonPreviewLinks.length > 0) && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Archivos y Enlaces Adicionales</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {nonPreviewFiles.map((file, index) => (
                                <div key={`file-${index}`}>{renderNonPreviewFile(file)}</div>
                            ))}
                            {nonPreviewLinks.map((link, index) => (
                                <div key={`link-${index}`}>{renderNonPreviewLink(link)}</div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            {sortedAnnouncements.length > 0 ? (
                sortedAnnouncements.map((announcement) => {
                    const isExpanded = expandedAnnouncements.includes(announcement.id);

                    return (
                        <Card
                            key={`${announcement.id}-${announcement.created_at}`}
                            className="shadow-lg border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                        >
                            <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-12 w-12 border-2 border-purple-200">
                                            <AvatarImage
                                                src={announcement.user?.avatar || "/placeholder.svg"}
                                            />
                                            <AvatarFallback className="text-purple-600 bg-purple-200 text-lg">
                                                {announcement.user?.name?.charAt(0).toUpperCase() || "U"}
                                                {announcement.user?.last_name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "D"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-800">
                                                {announcement.user?.name
                                                    ? `${announcement.user.name} ${announcement.user.last_name}`
                                                    : "Usuario Desconocido"}
                                            </div>
                                            <CardDescription className="text-sm text-gray-600">
                                                {new Date(announcement.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {announcement.is_global ? "Global" : "Grupo"}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 py-4">
                                {renderAnnouncementContent(announcement, isExpanded)}
                            </CardContent>

                            {announcement.content.length > MAX_CONTENT_LENGTH && (
                                <CardFooter className="px-6 py-2 bg-gray-50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(announcement.id)}
                                        className="text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                                    >
                                        {isExpanded ? (
                                            <>
                                                Menos <ChevronUp className="ml-1 h-4 w-4"/>
                                            </>
                                        ) : (
                                            <>
                                                Más <ChevronDown className="ml-1 h-4 w-4"/>
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    );
                })
            ) : (
                <Card className="shadow-lg border-gray-200 rounded-xl overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-16 h-16 text-purple-300 mb-4"/>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay anuncios disponibles</h3>
                        <p className="text-gray-500 max-w-md">
                            Actualmente no hay anuncios para mostrar. Los nuevos anuncios aparecerán aquí cuando estén
                            disponibles.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}