import React, {useCallback, useMemo} from "react";
import {CalendarDays, Clock, Users} from 'lucide-react';
import {format} from "date-fns";
import {es} from "date-fns/locale";

const InfoItem = ({icon: Icon, title, value}) => (<div className="flex items-center space-x-2 py-1">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"/>
    <div className="flex-grow min-w-0">
        <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 truncate">{title}</p>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">{value}</p>
    </div>
</div>);

export default function CourseInfo({managementDetails}) {
    const formatDateWithTime = useCallback((date) => {
        if (!date) return "No establecido";
        const dateObj = new Date(date);
        return format(dateObj, "d MMM yyyy, HH:mm", {locale: es});
    }, []);

    const formatDateOnly = useCallback((date) => {
        if (!date) return "No establecido";
        const dateObj = new Date(date);
        return format(dateObj, "d MMM yyyy", {locale: es});
    }, []);

    const courseInfo = useMemo(() => [{
        icon: CalendarDays,
        title: "Entrega Parte A",
        value: formatDateWithTime(managementDetails.proposal_part_a_deadline),
    }, {
        icon: Clock, title: "Entrega Parte B", value: formatDateWithTime(managementDetails.proposal_part_b_deadline),
    }, {
        icon: CalendarDays, title: "Entrega Final", value: formatDateOnly(managementDetails.project_delivery_date),
    }, {
        icon: Users, title: "Max. Integrantes", value: managementDetails.group_limit,
    },], [managementDetails, formatDateWithTime, formatDateOnly]);

    return (<div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-3 bg-purple-100">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-purple-800">
                Semestre {managementDetails.semester === "first" ? "1" : "2"}/{new Date(managementDetails.start_date).getFullYear()}
            </h3>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {courseInfo.map((item, index) => (<InfoItem key={index} {...item} />))}
        </div>
    </div>);
}

