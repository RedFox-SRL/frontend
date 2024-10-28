import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LinkDialog({ isOpen, onClose, onSubmit }) {
  const [linkUrl, setLinkUrl] = useState("");

  const handleLinkSubmit = async () => {
    if (linkUrl) {
      const linkPreview = await getLinkPreview(linkUrl);
      onSubmit({ url: linkUrl, ...linkPreview });
      setLinkUrl("");
    }
  };

  const getLinkPreview = async (url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    try {
      const domain = new URL(url).hostname;
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      return { icon, name: domain };
    } catch (error) {
      console.error("Error al procesar la URL:", error);
      return { icon: "https://www.google.com/favicon.ico", name: "Enlace" };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button
            onClick={handleLinkSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Añadir enlace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
