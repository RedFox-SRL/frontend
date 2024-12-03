import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartNoAxesCombined,
  Copy,
  Hash,
  Mail,
  Phone,
  Star,
  Link,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LinksViewerModal from "@/components/LinksViewerModal";
import { getData } from "../api/apiService";
import ProposalsViewer from "@/components/ProposalsViewer.jsx"; // Modal de propuestas

export default function GroupDetailMember({ selectedGroup }) {
  const { toast } = useToast();
  const topRef = useRef(null);
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false); // Estado para el modal de propuestas
  const [proposals, setProposals] = useState([]); // Propuestas
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
        () => {
          toast({
            title: "Copiado",
            description: "Código copiado al portapapeles",
            duration: 3000,
            className: "bg-green-500 text-white",
          });
        },
        (err) => {
          console.error("Error al copiar: ", err);
        }
    );
  };


  const handleOpenLinks = () => setIsLinksDialogOpen(true);
  const handleCloseLinks = () => setIsLinksDialogOpen(false);

  // Función para obtener las propuestas
  const fetchProposals = async () => {
    setLoading(true);
    setErrorMessage(""); // Limpia el mensaje de error antes de la consulta
    try {
      const response = await getData("/proposal-submission");
      if (response.success) {
        const { part_a, part_b } = response.data;
        setProposals([
          ...(part_a.status === "submitted" ? [{ title: "Parte A", url: part_a.file_url }] : []),
          ...(part_b.status === "submitted" ? [{ title: "Parte B", url: part_b.file_url }] : []),
        ]);
        if (part_a.status === "pending" && part_b.status === "pending") {
          setErrorMessage("Comunícate con el representante legal para subir las propuestas.");
        }
      } else {
        setErrorMessage("No se pudo cargar las propuestas.");
      }
    } catch (error) {
      setErrorMessage("Hubo un problema al cargar las propuestas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return (
      <>
        <div ref={topRef}></div>

        <Card className="bg-white shadow-lg border-t-4 border-t-purple-500">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Detalles del Grupo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Información de tu grupo de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-purple-300 ring-2 ring-purple-100">
                  <AvatarImage
                      src={selectedGroup.logo}
                      alt={selectedGroup.short_name}
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
                    {selectedGroup.short_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedGroup.short_name}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedGroup.long_name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-700">{selectedGroup.contact_email}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                  <Phone className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-700">{selectedGroup.contact_phone}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-700">{selectedGroup.code}</span>
                  </div>
                  <Button
                      onClick={() => copyToClipboard(selectedGroup.code)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-purple-100"
                  >
                    <Copy className="h-4 w-4 text-purple-600" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Información del Grupo</h3>
              <p className="text-sm text-gray-600">Este es tu grupo de trabajo actual.</p>

              <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300"
                  onClick={handleOpenLinks}
              >
                <Link className="w-4 h-4 mr-2" />
                Links
              </Button>
              <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-300"
                  onClick={() => setIsProposalModalOpen(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Propuestas
              </Button>
            </div>
          </CardContent>
        </Card>
        <LinksViewerModal
            isOpen={isLinksDialogOpen}
            onClose={handleCloseLinks}
        />

        <ProposalsViewer
            isOpen={isProposalModalOpen}
            onClose={() => setIsProposalModalOpen(false)}
        />
      </>
  );
}
