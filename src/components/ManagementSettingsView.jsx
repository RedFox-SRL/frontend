import React, { useState, useEffect, Fragment, useRef } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { putData } from "../api/apiService";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";
import PropTypes from "prop-types";

export default function ManagementSettingsView({ management, isOpen, onClose, onUpdate }) {
    const [newGroupLimit, setNewGroupLimit] = useState(management.group_limit);
    const [isCodeActive, setIsCodeActive] = useState(management.is_code_active);
    const [newDeliveryDate, setNewDeliveryDate] = useState(management.project_delivery_date || "");
    const [tooltipVisible, setTooltipVisible] = useState({ code: false, limit: false, date: false });
    const [groupLimitLoading, setGroupLimitLoading] = useState(false);
    const [codeStatusLoading, setCodeStatusLoading] = useState(false);
    const [deliveryDateLoading, setDeliveryDateLoading] = useState(false);
    const [groupLimitMessage, setGroupLimitMessage] = useState("");
    const [codeStatusMessage, setCodeStatusMessage] = useState("");
    const [deliveryDateMessage, setDeliveryDateMessage] = useState("");
    const tooltipRef = useRef(null);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const getAvailableMonths = () => {
        if (currentMonth <= 6) {
            return Array.from({ length: 6 }, (_, i) => i + 1);
        } else {
            return Array.from({ length: 6 }, (_, i) => i + 7);
        }
    };

    const availableMonths = getAvailableMonths();

    useEffect(() => {
        if (management) {
            setNewGroupLimit(management.group_limit);
            setNewDeliveryDate(management.project_delivery_date || "");
        }
    }, [management]);

    useEffect(() => {
        if (isOpen) {
            setNewGroupLimit(management.group_limit);
            setNewDeliveryDate(management.project_delivery_date || "");
        }
    }, [isOpen, management]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setTooltipVisible({ code: false, limit: false, date: false });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tooltipRef]);

    const handleGroupLimitChange = (e) => {
        const value = e.target.value;
        if (/^[4-9]$|^1[0-5]$/.test(value)) {
            setNewGroupLimit(value);
        }
    };

    const saveGroupLimit = async () => {
        setGroupLimitLoading(true);
        try {
            await putData(`/managements/${management.id}/update-group-limit`, {
                group_limit: parseInt(newGroupLimit, 10),
            });
            setGroupLimitMessage("Límite de grupos actualizado correctamente.");
            onUpdate({ group_limit: parseInt(newGroupLimit, 10) });
        } catch (error) {
            setGroupLimitMessage("Error al actualizar el límite de grupos.");
        } finally {
            setGroupLimitLoading(false);
            setTimeout(() => setGroupLimitMessage(""), 5000);
        }
    };

    const toggleCodeStatus = async () => {
        setCodeStatusLoading(true);
        try {
            const response = await putData(`/managements/${management.id}/toggle-code`);
            setIsCodeActive(response.data.management.is_code_active);
            setCodeStatusMessage("Estado del código actualizado correctamente.");
        } catch (error) {
            setCodeStatusMessage("Error al actualizar el estado del código.");
        } finally {
            setCodeStatusLoading(false);
            setTimeout(() => setCodeStatusMessage(""), 5000);
        }
    };

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth() + 1;

        if (selectedYear === currentYear && availableMonths.includes(selectedMonth)) {
            setNewDeliveryDate(e.target.value);
        }
    };

    const formatDateTime = (datetime) => {
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const saveDeliveryDate = async () => {
        setDeliveryDateLoading(true);
        try {
            const formattedDate = formatDateTime(newDeliveryDate);
            await putData(`/managements/${management.id}/projectDate`, {
                project_delivery_date: formattedDate,
            });
            setDeliveryDateMessage("Fecha de entrega del proyecto actualizada correctamente.");
            if (onUpdate) {
                onUpdate({ project_delivery_date: formattedDate });
            }
        } catch (error) {
            setDeliveryDateMessage("Error al actualizar la fecha de entrega.");
        } finally {
            setDeliveryDateLoading(false);
            setTimeout(() => setDeliveryDateMessage(""), 5000);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Configuraciones de la Gestión
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="mt-4 space-y-6">
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            Código de gestión:
                                            <div
                                                className="relative inline-block"
                                                onMouseEnter={() => setTooltipVisible({ ...tooltipVisible, code: true })}
                                                onMouseLeave={() => setTooltipVisible({ ...tooltipVisible, code: false })}
                                                onClick={() => setTooltipVisible({ ...tooltipVisible, code: !tooltipVisible.code })}
                                                ref={tooltipRef}
                                            >
                                                <HelpCircle className="inline ml-2 text-gray-500" />
                                                {tooltipVisible.code && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                                                        Activa o desactiva el código de gestión.
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={isCodeActive}
                                                onChange={toggleCodeStatus}
                                                className={`${isCodeActive ? "bg-purple-600" : "bg-gray-400"}
                                                    relative inline-flex items-center h-6 rounded-full w-11`}
                                            >
                                                <span className="sr-only">Toggle code</span>
                                                <span
                                                    className={`${
                                                        isCodeActive
                                                            ? "translate-x-6"
                                                            : "translate-x-1"
                                                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                                />
                                            </Switch>
                                            <span className="text-sm font-medium">
                                                {isCodeActive ? "Activo" : "Desactivado"}
                                            </span>
                                        </div>
                                        {codeStatusLoading && <p className="text-sm text-gray-500">Actualizando...</p>}
                                        {codeStatusMessage && <p className="text-sm text-green-500">{codeStatusMessage}</p>}
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            Límite de miembros:
                                            <div
                                                className="relative inline-block"
                                                onMouseEnter={() => setTooltipVisible({ ...tooltipVisible, limit: true })}
                                                onMouseLeave={() => setTooltipVisible({ ...tooltipVisible, limit: false })}
                                                onClick={() => setTooltipVisible({ ...tooltipVisible, limit: !tooltipVisible.limit })}
                                                ref={tooltipRef}
                                            >
                                                <HelpCircle className="inline ml-2 text-gray-500" />
                                                {tooltipVisible.limit && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                                                        Establece el límite de miembros por grupo (4-15).
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={newGroupLimit}
                                                onChange={handleGroupLimitChange}
                                                min="4"
                                                max="15"
                                                className="border rounded p-2 w-24 text-sm"
                                            />
                                            <Button
                                                onClick={saveGroupLimit}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                                disabled={groupLimitLoading}
                                            >
                                                {groupLimitLoading ? "Guardando..." : "Guardar"}
                                            </Button>
                                        </div>
                                        {groupLimitMessage && <p className="text-sm text-green-500">{groupLimitMessage}</p>}
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-2">
                                            Fecha de entrega del proyecto:
                                            <div
                                                className="relative inline-block"
                                                onMouseEnter={() => setTooltipVisible({ ...tooltipVisible, date: true })}
                                                onMouseLeave={() => setTooltipVisible({ ...tooltipVisible, date: false })}
                                                onClick={() => setTooltipVisible({ ...tooltipVisible, date: !tooltipVisible.date })}
                                                ref={tooltipRef}
                                            >
                                                <HelpCircle className="inline ml-2 text-gray-500" />
                                                {tooltipVisible.date && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                                                        La fecha de entrega debe estar en el mismo año y semestre actual.
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="datetime-local"
                                                value={newDeliveryDate}
                                                onChange={handleDateChange}
                                                className="border rounded p-2 text-sm w-full"
                                                min={`${currentYear}-01-01T00:00`}
                                                max={`${currentYear}-12-31T23:59`}
                                            />
                                            <Button
                                                onClick={saveDeliveryDate}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                                disabled={deliveryDateLoading}
                                            >
                                                {deliveryDateLoading ? "Guardando..." : "Guardar"}
                                            </Button>
                                        </div>
                                        {deliveryDateMessage && <p className="text-sm text-green-500">{deliveryDateMessage}</p>}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

ManagementSettingsView.propTypes = {
    management: PropTypes.shape({
        group_limit: PropTypes.number.isRequired,
        is_code_active: PropTypes.bool.isRequired,
        project_delivery_date: PropTypes.string,
        id: PropTypes.number.isRequired,
    }).isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};