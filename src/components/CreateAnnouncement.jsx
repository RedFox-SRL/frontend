import React, {useState, useRef, useEffect, useCallback} from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {getData, postData} from '../api/apiService'
import {Paperclip, Youtube, Link as LinkIcon, X} from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import YouTubeDialog from './YouTubeDialog'
import LinkDialog from './LinkDialog'
import AttachmentList from './AttachmentList'
import {getFileType, getFilePreview, getAvatarUrl, formatFileSize, getFileIcon} from '../utils/fileUtils'
import {useToast} from "@/hooks/use-toast"

const MAX_CHAR_LIMIT = 2000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

export default function CreateAnnouncement({managementId, onAnnouncementCreated}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [announcement, setAnnouncement] = useState('')
    const [attachments, setAttachments] = useState([])
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const fileInputRef = useRef(null)
    const quillRef = useRef(null)
    const {toast} = useToast()

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getData('/me')
            if (response && response.data && response.data.item) {
                setUser(response.data.item)
            } else {
                throw new Error('Respuesta de usuario inválida')
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error)
            toast({
                title: "Error", description: "No se pudo cargar la información del usuario.", variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    const handleExpand = () => setIsExpanded(true)

    const handleAnnouncementChange = useCallback((content) => {
        if (content.length <= MAX_CHAR_LIMIT) {
            setAnnouncement(content)
        } else {
            toast({
                title: "Límite de caracteres alcanzado",
                description: `Los anuncios no pueden exceder ${MAX_CHAR_LIMIT} caracteres.`,
                variant: "warning",
            })
        }
    }, [toast])

    const handleFileAttachment = useCallback(async (event) => {
        const files = Array.from(event.target.files)
        if (attachments.filter(a => a.type === 'file').length + files.length > MAX_FILES) {
            toast({
                title: "Límite de archivos alcanzado",
                description: `No puedes adjuntar más de ${MAX_FILES} archivos.`,
                variant: "warning",
            })
            return
        }
        const newAttachments = await Promise.all(files.map(async (file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "Archivo demasiado grande",
                    description: `El archivo ${file.name} excede el tamaño máximo de ${formatFileSize(MAX_FILE_SIZE)}.`,
                    variant: "warning",
                })
                return null
            }
            try {
                const preview = await getFilePreview(file)
                return {
                    type: 'file',
                    name: file.name,
                    fileType: getFileType(file),
                    size: file.size,
                    file: file,
                    preview: preview
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error)
                toast({
                    title: "Error de archivo",
                    description: `No se pudo procesar el archivo ${file.name}.`,
                    variant: "destructive",
                })
                return null
            }
        }))
        setAttachments(prev => [...prev, ...newAttachments.filter(a => a !== null)])
    }, [attachments, toast])

    const handleLinkAttachment = useCallback((linkData) => {
        setAttachments(prev => [...prev, {type: 'link', ...linkData}])
        setIsLinkDialogOpen(false)
    }, [])

    const handleYoutubeAttachment = useCallback((videoData) => {
        setAttachments(prev => [...prev, {type: 'youtube', ...videoData}])
        setIsYoutubeDialogOpen(false)
    }, [])

    const removeAttachment = useCallback((index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!announcement.trim() && attachments.length === 0) {
            toast({
                title: "Anuncio vacío",
                description: "Por favor, escribe un anuncio o adjunta un archivo.",
                variant: "warning",
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('management_id', managementId);
        formData.append('announcement', announcement);

        const links = [];
        const youtubeVideos = [];

        attachments.forEach((attachment, index) => {
            if (attachment.type === 'file') {
                formData.append(`files[${index}]`, attachment.file);
            } else if (attachment.type === 'link') {
                links.push({url: attachment.url, title: attachment.name});
            } else if (attachment.type === 'youtube') {
                youtubeVideos.push({video_id: attachment.videoId, title: attachment.name});
            }
        });

        if (links.length > 0) {
            formData.append('links', JSON.stringify(links));
        }

        if (youtubeVideos.length > 0) {
            formData.append('youtube_videos', JSON.stringify(youtubeVideos));
        }

        try {
            const response = await postData('/announcements', formData);
            if (response && response.message === "Anuncio creado con éxito" && response.announcement) {
                onAnnouncementCreated(response.announcement);
                setAnnouncement('');
                setAttachments([]);
                setIsExpanded(false);
                toast({
                    title: "Anuncio publicado",
                    description: "Tu anuncio ha sido publicado con éxito.",
                    variant: "success",
                });
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error al crear el anuncio:', error);
            let errorMessage = "Hubo un problema al crear el anuncio. Por favor, inténtalo de nuevo.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast({
                title: "Error", description: errorMessage, variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [announcement, attachments, managementId, onAnnouncementCreated, toast]);


    const modules = {
        toolbar: [['bold', 'italic', 'underline'], [{'list': 'bullet'}], ['clean']]
    }

    return (<Card className="w-full mb-4 shadow-sm">
        <CardContent className="p-4">
            {!isExpanded ? (<div className="flex items-center space-x-4 cursor-pointer" onClick={handleExpand}>
                <Avatar className="w-10 h-10 border-2 border-purple-200">
                    <AvatarImage src={user?.profilePicture || getAvatarUrl(user?.name, user?.last_name)}
                                 alt={user ? `${user.name} ${user.last_name}` : 'Usuario'}/>
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-bold">
                        {user ? `${user.name.charAt(0)}${user.last_name.charAt(0)}` : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-gray-500">
                    Anuncia algo a tu clase...
                </div>
            </div>) : (<div className="space-y-4">
                <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10 border-2 border-purple-200">
                        <AvatarImage src={user?.profilePicture || getAvatarUrl(user?.name, user?.last_name)}
                                     alt={user ? `${user.name} ${user.last_name}` : 'Usuario'}/>
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-bold">
                            {user ? `${user.name.charAt(0)}${user.last_name.charAt(0)}` : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <ReactQuill
                            ref={quillRef}
                            value={announcement}
                            onChange={handleAnnouncementChange}
                            modules={modules}
                            placeholder="Anuncia algo a tu clase"
                            className="bg-white"
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {announcement.length}/{MAX_CHAR_LIMIT}
                        </div>
                    </div>
                </div>
                {attachments.length > 0 && (
                    <AttachmentList attachments={attachments} onRemoveAttachment={removeAttachment}/>)}
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={attachments.filter(a => a.type === 'file').length >= MAX_FILES}>
                                        <Paperclip className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Adjuntar archivo (máx. {MAX_FILES})</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon"
                                            onClick={() => setIsYoutubeDialogOpen(true)}>
                                        <Youtube className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Añadir video de YouTube</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon"
                                            onClick={() => setIsLinkDialogOpen(true)}>
                                        <LinkIcon className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Añadir enlace</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={isLoading || (!announcement.trim() && attachments.length === 0)}
                    >
                        {isLoading ? 'Publicando...' : 'Publicar'}
                    </Button>
                </div>
            </div>)}
        </CardContent>
        <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileAttachment}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />
        <LinkDialog
            isOpen={isLinkDialogOpen}
            onClose={() => setIsLinkDialogOpen(false)}
            onSubmit={handleLinkAttachment}
        />
        <YouTubeDialog
            isOpen={isYoutubeDialogOpen}
            onClose={() => setIsYoutubeDialogOpen(false)}
            onSelect={handleYoutubeAttachment}
        />
    </Card>)
}