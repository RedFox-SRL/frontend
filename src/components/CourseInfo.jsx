import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {CalendarDays, Users, Clock, TrendingUp} from "lucide-react"
import {format, differenceInDays, isPast} from 'date-fns'
import {es} from 'date-fns/locale'

const InfoItem = ({icon: Icon, title, value}) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
            <Icon className="w-5 h-5 text-purple-500 mr-2"/>
            <span className="text-sm font-medium text-purple-700">{title}</span>
        </div>
        <span className="text-sm font-semibold text-purple-900">{value}</span>
    </div>
);

const DesktopInfoCard = ({icon: Icon, title, value}) => (
    <Card className="flex-1">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
            <Icon className="w-8 h-8 text-purple-500 mb-2"/>
            <h3 className="text-sm font-semibold text-purple-700 mb-1">{title}</h3>
            <p className="text-lg font-bold text-purple-900">{value}</p>
        </CardContent>
    </Card>
);

const AnimatedProgressBar = ({value}) => (
    <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
            <motion.div
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{width: 0}}
                animate={{width: `${value}%`}}
                transition={{duration: 1, ease: "easeOut"}}
            />
        </div>
    </div>
);

export default function CourseInfo({managementDetails}) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkIsDesktop();
        window.addEventListener('resize', checkIsDesktop);
        return () => window.removeEventListener('resize', checkIsDesktop);
    }, []);

    const startDate = new Date(managementDetails.start_date);
    const endDate = new Date(managementDetails.end_date);
    const today = new Date();

    const formatDate = (date) => format(date, 'd MMM yyyy', {locale: es});

    const getRemainingTime = () => {
        if (isPast(endDate)) {
            return "Curso finalizado";
        }
        const daysRemaining = differenceInDays(endDate, today);
        return `${daysRemaining} días restantes`;
    };

    const getProgressPercentage = () => {
        const totalDays = differenceInDays(endDate, startDate);
        const daysPassed = differenceInDays(today, startDate);
        const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
        return Math.round(progress);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(getProgressPercentage());
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const MobileView = () => (
        <Card className="mb-4">
            <Accordion type="single" collapsible>
                <AccordionItem value="course-info">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-lg font-semibold text-purple-800">Información del Curso</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CardContent className="px-4 py-2">
                            <InfoItem
                                icon={CalendarDays}
                                title="Fecha de Inicio"
                                value={formatDate(startDate)}
                            />
                            <InfoItem
                                icon={CalendarDays}
                                title="Fecha de Fin"
                                value={formatDate(endDate)}
                            />
                            <InfoItem
                                icon={Users}
                                title="Límite por Grupo"
                                value={managementDetails.group_limit}
                            />
                            <InfoItem
                                icon={Clock}
                                title="Estado"
                                value={getRemainingTime()}
                            />
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <TrendingUp className="w-5 h-5 text-purple-500 mr-2"/>
                                        <span className="text-sm font-medium text-purple-700">Progreso del curso</span>
                                    </div>
                                    <motion.span
                                        className="text-sm font-semibold text-purple-900"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{duration: 1}}
                                    >
                                        {progress}%
                                    </motion.span>
                                </div>
                                <AnimatedProgressBar value={progress}/>
                            </div>
                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );

    const DesktopView = () => (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-800">Información del Curso</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4 mb-4">
                    <DesktopInfoCard
                        icon={CalendarDays}
                        title="Fecha de Inicio"
                        value={formatDate(startDate)}
                    />
                    <DesktopInfoCard
                        icon={CalendarDays}
                        title="Fecha de Fin"
                        value={formatDate(endDate)}
                    />
                    <DesktopInfoCard
                        icon={Users}
                        title="Límite por Grupo"
                        value={managementDetails.group_limit}
                    />
                    <DesktopInfoCard
                        icon={Clock}
                        title="Estado"
                        value={getRemainingTime()}
                    />
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-purple-500 mr-2"/>
                            <span className="text-sm font-medium text-purple-700">Progreso del curso</span>
                        </div>
                        <motion.span
                            className="text-sm font-semibold text-purple-900"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 1}}
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <AnimatedProgressBar value={progress}/>
                </div>
            </CardContent>
        </Card>
    );

    return isDesktop ? <DesktopView/> : <MobileView/>;
}