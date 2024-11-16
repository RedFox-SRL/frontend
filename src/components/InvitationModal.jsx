import React, { useEffect, useState } from "react";
import { getData } from "../api/apiService";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function InvitationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const response = await getData("/student/invitations");
                if (response?.success && response.data.invitations.length > 0) {
                    setInvitations(response.data.invitations);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Error fetching invitations:", error);
            }
        };

        fetchInvitations();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invitación Recibida</DialogTitle>
                </DialogHeader>
                <div>
                    <p>
                        Has sido invitado al grupo{" "}
                        <strong>{invitations[0]?.group.short_name}</strong>. Revisa tu correo
                        electrónico para más detalles.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleClose} className="bg-purple-600 text-white">
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
