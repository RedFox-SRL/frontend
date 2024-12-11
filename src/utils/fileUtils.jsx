import {File, FileText, Image, Music, Video} from "lucide-react";

export const getFileType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word")) return "word";
    if (file.type.includes("excel") || file.type.includes("spreadsheet")) return "excel";
    if (file.type.includes("powerpoint") || file.type.includes("presentation")) return "powerpoint";
    return "other";
};

export const getFilePreview = async (file) => {
    if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas
                    .getContext("2d")
                    .drawImage(video, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(video.src);
                resolve(canvas.toDataURL());
            };
            video.src = URL.createObjectURL(file);
        });
    } else {
        return null;
    }
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileIcon = (fileType) => {
    switch (fileType) {
        case "image":
            return <Image className="w-12 h-12 text-blue-500"/>;
        case "video":
            return <Video className="w-12 h-12 text-red-500"/>;
        case "audio":
            return <Music className="w-12 h-12 text-green-500"/>;
        case "pdf":
            return <FileText className="w-12 h-12 text-red-700"/>;
        case "word":
            return <FileText className="w-12 h-12 text-blue-700"/>;
        case "excel":
            return <FileText className="w-12 h-12 text-green-700"/>;
        case "powerpoint":
            return <FileText className="w-12 h-12 text-orange-700"/>;
        default:
            return <File className="w-12 h-12 text-gray-500"/>;
    }
};

export const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + " " + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
};
