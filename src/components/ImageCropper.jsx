import React, {useState, useCallback} from 'react'
import {Button} from "@/components/ui/button"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog"
import {Slider} from "@/components/ui/slider"
import Cropper from 'react-easy-crop'
import {X, Upload, Info} from 'lucide-react'
import {useDropzone} from 'react-dropzone'
import {useToast} from "@/hooks/use-toast"
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageCropper({onImageCropped}) {
    const [previewImage, setPreviewImage] = useState(null)
    const [croppedPreview, setCroppedPreview] = useState(null)
    const [isCropping, setIsCropping] = useState(false)
    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const {toast} = useToast()

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "Error", description: "El archivo no debe superar los 10MB", variant: "destructive",
                })
                return
            }

            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                toast({
                    title: "Error",
                    description: "Formato de archivo no aceptado. Por favor, use JPEG, PNG o WebP.",
                    variant: "destructive",
                })
                return
            }

            handleRemoveImage() // Clear existing image data

            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewImage(e.target.result)
                setIsCropping(true)
            }
            reader.readAsDataURL(file)
        }
    }, [toast])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop, accept: {
            'image/jpeg': [], 'image/png': [], 'image/webp': []
        }, multiple: false
    })

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url) => new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return null
        }

        const maxSize = Math.max(pixelCrop.width, pixelCrop.height)
        canvas.width = maxSize
        canvas.height = maxSize

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const offsetX = (maxSize - pixelCrop.width) / 2
        const offsetY = (maxSize - pixelCrop.height) / 2

        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, offsetX, offsetY, pixelCrop.width, pixelCrop.height)

        // Create circular clipping path
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.arc(maxSize / 2, maxSize / 2, maxSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob)
                }
            }, 'image/png')
        })
    }

    const handleCropSave = async () => {
        if (croppedAreaPixels && previewImage) {
            const croppedImageBlob = await getCroppedImg(previewImage, croppedAreaPixels)
            if (croppedImageBlob) {
                const croppedImageUrl = URL.createObjectURL(croppedImageBlob)
                setCroppedPreview(croppedImageUrl)
                onImageCropped(croppedImageBlob)
                setIsCropping(false)
            }
        }
    }

    const handleCropCancel = () => {
        setIsCropping(false)
        setPreviewImage(null)
        setCroppedPreview(null)
    }

    const handleRemoveImage = () => {
        setPreviewImage(null)
        setCroppedPreview(null)
    }

    return (<>
        <div className="flex flex-col items-center justify-center w-full">
            <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-visible group"
            >
                <input {...getInputProps()} />
                {croppedPreview ? (<>
                    <img src={croppedPreview} alt="Preview"
                         className="absolute inset-0 w-full h-full object-cover rounded-full"/>
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <p className="text-white text-xs sm:text-sm">Cambiar</p>
                    </div>
                    <Button
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-500 hover:bg-red-600 text-white p-1 sm:p-2 rounded-full opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage()
                        }}
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5"/>
                    </Button>
                </>) : (<div className="flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-500"/>
                    <p className="text-xs sm:text-sm text-gray-500">Subir foto</p>
                </div>)}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="mt-2">
                            <Info className="h-4 w-4 mr-2"/>
                            <span className="text-xs sm:text-sm">Información</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs sm:text-sm">Formatos: JPEG, PNG, WebP</p>
                        <p className="text-xs sm:text-sm">Tamaño máximo: 10MB</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <Dialog open={isCropping} onOpenChange={setIsCropping}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Recortar imagen</DialogTitle>
                </DialogHeader>
                <div className="w-full h-48 sm:h-64 relative">
                    {previewImage && (<Cropper
                        image={previewImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape="round"
                        showGrid={false}
                    />)}
                </div>
                <div className="mt-4">
                    <label htmlFor="zoom" className="block text-sm font-medium text-gray-700">
                        Zoom
                    </label>
                    <Slider
                        id="zoom"
                        min={1}
                        max={3}
                        step={0.1}
                        value={[zoom]}
                        onValueChange={(value) => setZoom(value[0])}
                    />
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button onClick={handleCropCancel} variant="outline" className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button onClick={handleCropSave}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 mt-2 sm:mt-0">
                        Guardar recorte
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>)
}