import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { formatFileSize, getFileIcon } from "../utils/fileUtils";

export default function AttachmentList({ attachments, onRemoveAttachment }) {
  const handlePreview = (attachment) => {
    if (attachment.type === "link" || attachment.type === "youtube") {
      let url = attachment.url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.open(url, "_blank");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="relative bg-gray-100 p-4 rounded-lg flex items-center space-x-3"
        >
          <div className="flex-shrink-0">
            {attachment.type === "file" ? (
              <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                {attachment.fileType === "image" && attachment.preview ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(attachment.fileType)
                )}
              </div>
            ) : attachment.type === "link" ? (
              <img
                src={attachment.icon}
                alt={attachment.name}
                className="w-12 h-12"
              />
            ) : (
              attachment.type === "youtube" && (
                <img
                  src={attachment.thumbnail}
                  alt="YouTube Thumbnail"
                  className="w-12 h-12 object-cover rounded"
                />
              )
            )}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </p>
            {attachment.type === "file" && (
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size)}
              </p>
            )}
            {(attachment.type === "link" || attachment.type === "youtube") && (
              <button
                className="text-xs text-purple-600 hover:text-purple-800 mt-1 flex items-center"
                onClick={() => handlePreview(attachment)}
              >
                Abrir enlace
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1"
            onClick={() => onRemoveAttachment(index)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
