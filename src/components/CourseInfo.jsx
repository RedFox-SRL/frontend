import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarDays, Clock, Users } from "lucide-react";
import { differenceInDays, format, isPast } from "date-fns";
import { es } from "date-fns/locale";

const InfoItem = ({ icon: Icon, title, value }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <Icon className="w-5 h-5 text-purple-500 mr-2" />
        <span className="text-sm font-medium text-purple-700">{title}</span>
      </div>
      <span className="text-sm font-semibold text-purple-900">{value}</span>
    </div>
);

const DesktopInfoCard = ({ icon: Icon, title, value }) => (
    <Card className="flex-1">
      <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
        <Icon className="w-8 h-8 text-purple-500 mb-2" />
        <h3 className="text-sm font-semibold text-purple-700 mb-1">{title}</h3>
        <p className="text-lg font-bold text-purple-900">{value}</p>
      </CardContent>
    </Card>
);

export default function CourseInfo({ managementDetails }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const deliveryDate = managementDetails.project_delivery_date
      ? new Date(managementDetails.project_delivery_date)
      : null;
  const partADate = managementDetails.proposal_part_a_deadline
      ? new Date(managementDetails.proposal_part_a_deadline)
      : null;
  const partBDate = managementDetails.proposal_part_b_deadline
      ? new Date(managementDetails.proposal_part_b_deadline)
      : null;
  const startDate = new Date(managementDetails.start_date);
  const today = new Date();

  const formatDate = useCallback(
      (date) => (date ? format(date, "d MMM yyyy", { locale: es }) : "Aún no establecido"),
      []
  );

  const getRemainingTime = useCallback(() => {
    if (!deliveryDate || isPast(deliveryDate)) {
      return "Curso finalizado";
    }
    const daysRemaining = differenceInDays(deliveryDate, today);
    return `${daysRemaining} días restantes`;
  }, [deliveryDate, today]);

  const MobileView = () => (
      <Card className="mb-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="course-info">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center justify-between w-full">
            <span className="text-lg font-semibold text-purple-800">
              Información del Curso
            </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="px-4 py-2">
                <InfoItem
                    icon={CalendarDays}
                    title="Fecha de Entrega"
                    value={formatDate(deliveryDate)}
                />
                <InfoItem
                    icon={CalendarDays}
                    title="Entrega Parte A"
                    value={formatDate(partADate)}
                />
                <InfoItem
                    icon={CalendarDays}
                    title="Entrega Parte B"
                    value={formatDate(partBDate)}
                />
                <InfoItem
                    icon={Users}
                    title="Max. integrantes por grupo"
                    value={managementDetails.group_limit}
                />
                <InfoItem icon={Clock} title="Estado" value={getRemainingTime()} />
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
  );

  const DesktopView = () => (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-purple-800">
            Información del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <DesktopInfoCard
                icon={CalendarDays}
                title="Fecha de Entrega"
                value={formatDate(deliveryDate)}
            />
            <DesktopInfoCard
                icon={CalendarDays}
                title="Entrega Parte A"
                value={formatDate(partADate)}
            />
            <DesktopInfoCard
                icon={CalendarDays}
                title="Entrega Parte B"
                value={formatDate(partBDate)}
            />
            <DesktopInfoCard
                icon={Users}
                title="Max. integrantes por grupo"
                value={managementDetails.group_limit}
            />
            <DesktopInfoCard icon={Clock} title="Estado" value={getRemainingTime()} />
          </div>
        </CardContent>
      </Card>
  );

  return isDesktop ? <DesktopView /> : <MobileView />;
}