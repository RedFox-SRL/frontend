import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getData } from '../api/apiService'
import { useUser } from '../context/UserContext'
import { Paperclip, Youtube, Link as LinkIcon } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import YouTubeDialog from './YouTubeDialog'
import LinkDialog from './LinkDialog'
import AttachmentList from './AttachmentList'
import { getFileType, getFilePreview, getAvatarUrl } from '../utils/fileUtils'

export default function CreateAnnouncement({ onAnnouncementCreated }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [announcement, setAnnouncement] = useState('')
    const [attachments, setAttachments] = useState([])
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)
    const { user, setUser } = useUser()

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

    const handleLinkAttachment = (linkData) => {
        setAttachments([...attachments, { type: 'link', ...linkData }])
        setIsLinkDialogOpen(false)
    }

    const handleYoutubeAttachment = (videoData) => {
        setAttachments([...attachments, { type: 'youtube', ...videoData }])
        setIsYoutubeDialogOpen(false)
    }

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    const handleSubmit = () => {
        onAnnouncementCreated({ content: announcement, attachments })
        setAnnouncement('')
        setAttachments([])
        setIsExpanded(false)
    }

    const modules = {
        toolbar: [['bold', 'italic', 'underline'], [{'list': 'bullet'}], ['clean']]
    }

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
                        <AttachmentList attachments={attachments} onRemoveAttachment={removeAttachment} />
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
                                            <Button variant="outline" size="icon" onClick={() => setIsYoutubeDialogOpen(true)}>
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
                                            <Button variant="outline" size="icon" onClick={() => setIsLinkDialogOpen(true)}>
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
        </Card>
    )
}