import React, {useState, useRef, useCallback, useEffect} from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {ScrollArea} from "@/components/ui/scroll-area"
import {getData} from '../api/apiService'
import {useUser} from '../context/UserContext'

import {
    Bold,
    Italic,
    Underline,
    List,
    X,
    Paperclip,
    Youtube,
    Link as LinkIcon,
    Image,
    FileText,
    Search,
    File,
    Music,
    Video,
    ExternalLink,
    Clock
} from 'lucide-react'

import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const YOUTUBE_API_KEY = 'api'

export default function CreateAnnouncement({onAnnouncementCreated}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [announcement, setAnnouncement] = useState('')
    const [attachments, setAttachments] = useState([])
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false)
    const [youtubeSearch, setYoutubeSearch] = useState('')
    const [youtubeResults, setYoutubeResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)
    const {user, setUser} = useUser()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true)
                const response = await getData('/me')
                setUser(response.data.item)
            } catch (error) {
                console.error('Error fetching user data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (!user) {
            fetchUserData()
        }
    }, [setUser, user])

    const handleExpand = () => setIsExpanded(true)

    const handleAnnouncementChange = (content) => setAnnouncement(content)

    const handleFileAttachment = async (event) => {
        const files = Array.from(event.target.files)
        const newAttachments = await Promise.all(files.map(async (file) => ({
            type: 'file',
            name: file.name,
            fileType: getFileType(file),
            size: file.size,
            file: file,
            preview: await getFilePreview(file)
        })))
        setAttachments([...attachments, ...newAttachments])
    }

    const getFileType = (file) => {
        if (file.type.startsWith('image/')) return 'image'
        if (file.type.startsWith('video/')) return 'video'
        if (file.type.startsWith('audio/')) return 'audio'
        if (file.type === 'application/pdf') return 'pdf'
        if (file.type.includes('word')) return 'word'
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'excel'
        if (file.type.includes('powerpoint') || file.type.includes('presentation')) return 'powerpoint'
        return 'other'
    }

    const getFilePreview = async (file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        } else if (file.type.startsWith('video/')) {
            return new Promise((resolve) => {
                const video = document.createElement('video')
                video.preload = 'metadata'
                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
                    URL.revokeObjectURL(video.src)
                    resolve(canvas.toDataURL())
                }
                video.src = URL.createObjectURL(file)
            })
        } else {
            return null
        }
    }

    const handleLinkAttachment = () => setIsLinkDialogOpen(true)

    const handleLinkSubmit = async () => {
        if (linkUrl) {
            const linkPreview = await getLinkPreview(linkUrl)
            setAttachments([...attachments, {type: 'link', url: linkUrl, ...linkPreview}])
            setLinkUrl('')
            setIsLinkDialogOpen(false)
        }
    }

    const getLinkPreview = async (url) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }
        try {
            const domain = new URL(url).hostname
            const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
            return {icon, name: domain}
        } catch (error) {
            console.error('Error al procesar la URL:', error)
            return {icon: 'https://www.google.com/favicon.ico', name: 'Enlace'}
        }
    }

    const handleYoutubeAttachment = () => {
        setIsYoutubeDialogOpen(true)
        setYoutubeSearch('')
        setYoutubeResults([])
    }

    const handleYoutubeSearch = useCallback(async () => {
        if (youtubeSearch) {
            setIsLoading(true)
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(youtubeSearch)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=25`)
                const data = await response.json()
                setYoutubeResults(data.items)
            } catch (error) {
                console.error('Error al buscar videos de YouTube:', error)
                setYoutubeResults([])
            } finally {
                setIsLoading(false)
            }
        }
    }, [youtubeSearch])

    const handleYoutubeSelect = (video) => {
        const videoId = video.id.videoId
        const thumbnailUrl = video.snippet.thumbnails.medium.url
        setAttachments([...attachments, {
            type: 'youtube',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
            thumbnail: thumbnailUrl,
            name: video.snippet.title
        }])
        setYoutubeSearch('')
        setYoutubeResults([])
        setIsYoutubeDialogOpen(false)
    }

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    const handleSubmit = () => {
        onAnnouncementCreated({content: announcement, attachments})
        setAnnouncement('')
        setAttachments([])
        setIsExpanded(false)
    }

    const modules = {
        toolbar: [['bold', 'italic', 'underline'], [{'list': 'bullet'}], ['clean']]
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return <Image className="w-12 h-12 text-blue-500"/>
            case 'video':
                return <Video className="w-12 h-12 text-red-500"/>
            case 'audio':
                return <Music className="w-12 h-12 text-green-500"/>
            case 'pdf':
                return <FileText className="w-12 h-12 text-red-700"/>
            case 'word':
                return <FileText className="w-12 h-12 text-blue-700"/>
            case 'excel':
                return <FileText className="w-12 h-12 text-green-700"/>
            case 'powerpoint':
                return <FileText className="w-12 h-12 text-orange-700"/>
            default:
                return <File className="w-12 h-12 text-gray-500"/>
        }
    }

    const handlePreview = (attachment) => {
        if (attachment.type === 'link' || attachment.type === 'youtube') {
            let url = attachment.url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        }
    }

    const getAvatarUrl = (name, lastName) => {
        return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
    };

    return (
        <Card className="w-full mb-4 shadow-sm">
            <CardContent className="p-4">
                {!isExpanded ? (
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={handleExpand}>
                        <Avatar className="w-10 h-10 border-2 border-purple-200">
                            <AvatarImage src={user.profilePicture || getAvatarUrl(user.name, user.last_name)}
                                         alt={`${user.name} ${user.last_name}`}/>
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-bold">
                                {user.name.charAt(0)}{user.last_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Input
                            placeholder="Anuncia algo a tu clase"
                            className="flex-grow"
                            readOnly
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10 border-2 border-purple-200">
                                <AvatarImage src={user.profilePicture || getAvatarUrl(user.name, user.last_name)}
                                             alt={`${user.name} ${user.last_name}`}/>
                                <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-bold">
                                    {user.name.charAt(0)}{user.last_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <ReactQuill
                                    value={announcement}
                                    onChange={handleAnnouncementChange}
                                    modules={modules}
                                    placeholder="Anuncia algo a tu clase"
                                    className="bg-white"
                                />
                            </div>
                        </div>
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {attachments.map((attachment, index) => (
                                    <div key={index}
                                         className="relative bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            {attachment.type === 'file' ? (
                                                <div
                                                    className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                                                    {attachment.fileType === 'image' && attachment.preview ? (
                                                        <img src={attachment.preview} alt={attachment.name}
                                                             className="w-full h-full object-cover"/>
                                                    ) : (
                                                        getFileIcon(attachment.fileType)
                                                    )}
                                                </div>
                                            ) : attachment.type === 'link' ? (
                                                <img src={attachment.icon} alt={attachment.name}
                                                     className="w-12 h-12"/>
                                            ) : attachment.type === 'youtube' && (
                                                <img src={attachment.thumbnail} alt="YouTube Thumbnail"
                                                     className="w-12 h-12 object-cover rounded"/>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                            {attachment.type === 'file' && (
                                                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                                            )}
                                            {(attachment.type === 'link' || attachment.type === 'youtube') && (
                                                <button
                                                    className="text-xs text-purple-600 hover:text-purple-800 mt-1 flex items-center"
                                                    onClick={() => handlePreview(attachment)}
                                                >
                                                    Abrir enlace
                                                    <ExternalLink className="w-3 h-3 ml-1"/>
                                                </button>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1"
                                            onClick={() => removeAttachment(index)}
                                        >
                                            <X className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex flex-wrap gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon"
                                                    onClick={() => fileInputRef.current.click()}>
                                                <Paperclip className="w-4 h-4"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Adjuntar archivo</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={handleYoutubeAttachment}>
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
                                            <Button variant="outline" size="icon" onClick={handleLinkAttachment}>
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
                                disabled={!announcement.trim() && attachments.length === 0}
                            >
                                Publicar
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileAttachment}
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir enlace</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link-url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="link-url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleLinkSubmit} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Añadir enlace
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
                <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Buscar video de YouTube</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mb-4">
                        <Input
                            value={youtubeSearch}
                            onChange={(e) => setYoutubeSearch(e.target.value)}
                            placeholder="Buscar en YouTube"
                            className="flex-grow"
                            onKeyPress={(e) => e.key === 'Enter' && handleYoutubeSearch()}
                        />
                        <Button onClick={handleYoutubeSearch} className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Search className="w-4 h-4 mr-2"/>
                            Buscar
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-4">Cargando...</div>
                    ) : (
                        <ScrollArea className="flex-grow">
                            <div className="grid grid-cols-1 gap-4">
                                {youtubeResults.map((video) => (
                                    <div
                                        key={video.id.videoId}
                                        className="flex items-start p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleYoutubeSelect(video)}
                                    >
                                        <img
                                            src={video.snippet.thumbnails.medium.url}
                                            alt={video.snippet.title}
                                            className="w-40 h-24 object-cover rounded-md mr-4"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-medium text-sm line-clamp-2">{video.snippet.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{video.snippet.channelTitle}</p>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <Clock className="w-3 h-3 mr-1"/>
                                                {new Date(video.snippet.publishedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}