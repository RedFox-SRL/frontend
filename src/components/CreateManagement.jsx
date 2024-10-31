import React, { useEffect, useState } from "react";
import { postData } from "../api/apiService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function CreateManagement({ onManagementCreated, onCancel }) {
    const [newManagement, setNewManagement] = useState({
        semester: "",
        start_date: "",
        end_date: "",
        group_limit: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const startMonth = new Date(newManagement.start_date).getMonth() + 1;
        if (startMonth >= 1 && startMonth <= 6) {
            setNewManagement((prevState) => ({ ...prevState, semester: "first" }));
        } else if (startMonth >= 7 && startMonth <= 12) {
            setNewManagement((prevState) => ({ ...prevState, semester: "second" }));
        }
    }, [newManagement.start_date]);

    const validateForm = () => {
        const errors = {};
        const startDate = new Date(newManagement.start_date);
        const endDate = new Date(newManagement.end_date);

        if (!newManagement.start_date) {
            errors.start_date = "La fecha de inicio es obligatoria.";
        }
        if (!newManagement.end_date) {
            errors.end_date = "La fecha de fin es obligatoria.";
        } else if (startDate >= endDate) {
            errors.end_date = "La fecha de fin debe ser posterior a la de inicio.";
        } else if ((endDate - startDate) / (1000 * 60 * 60 * 24 * 30) > 7) {
            errors.end_date = "La duración no puede ser mayor a 7 meses.";
        }

        if (!newManagement.group_limit) {
            errors.group_limit = "El límite de grupos es obligatorio.";
        } else if (
            isNaN(newManagement.group_limit) ||
            newManagement.group_limit < 1 ||
            newManagement.group_limit > 100
        ) {
            errors.group_limit = "El límite de grupos debe estar entre 1 y 100.";
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateManagement = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        const managementData = {
            ...newManagement,
            group_limit: parseInt(newManagement.group_limit, 10),
        };

        try {
            const response = await postData("/managements", managementData);
            if (response && response.success) {
                onManagementCreated(response.data);
            } else {
                setErrors({ general: "Error al crear la gestión." });
            }
        } catch (error) {
            setErrors({ general: "Error al crear la gestión." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "group_limit") {
            const sanitizedValue = value.replace(/[^0-9]/g, "");

            let numericValue = parseInt(sanitizedValue, 10);
            if (isNaN(numericValue)) {
                numericValue = "";
            } else if (numericValue > 100) {
                numericValue = "100";
            } else if (numericValue < 1) {
                numericValue = "";
            }

            setNewManagement({
                ...newManagement,
                [name]: numericValue.toString(),
            });
        } else {
            setNewManagement({
                ...newManagement,
                [name]: value,
            });
        }
    };


    return (
        <div className="p-6 max-w-lg mx-auto relative">
            <div className="flex justify-start mb-4">
                <Button
                    onClick={onCancel}
                    className="bg-purple-600 hover:bg-purple-700 text-white sm:relative sm:top-0 sm:left-0 md:fixed md:top-4 md:left-4"
                >
                    Volver al Listado
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-purple-700">
                Crear una nueva gestión
            </h1>

            <label className="block text-sm font-medium text-purple-700 mb-2">
                Fecha de inicio
            </label>
            <div className="relative">
                <Input
                    name="start_date"
                    type="date"
                    value={newManagement.start_date}
                    onChange={handleInputChange}
                    className={`mb-1 ${errors.start_date ? "border-red-500" : ""}`}
                />
                {errors.start_date && (
                    <p className="text-red-500 text-xs mb-4 flex items-center">
                        <AlertCircle className="mr-1" /> {errors.start_date}
                    </p>
                )}
            </div>

            <label className="block text-sm font-medium text-purple-700 mb-2">
                Fecha de fin
            </label>
            <div className="relative">
                <Input
                    name="end_date"
                    type="date"
                    value={newManagement.end_date}
                    onChange={handleInputChange}
                    className={`mb-1 ${errors.end_date ? "border-red-500" : ""}`}
                />
                {errors.end_date && (
                    <p className="text-red-500 text-xs mb-4 flex items-center">
                        <AlertCircle className="mr-1" /> {errors.end_date}
                    </p>
                )}
            </div>

            <label className="block text-sm font-medium text-purple-700 mb-2">
                Límite de grupos
            </label>
            <div className="relative">
                <Input
                    name="group_limit"
                    type="number"
                    placeholder="Límite de grupos (1-100)"
                    value={newManagement.group_limit}
                    onChange={handleInputChange}
                    className={`mb-1 ${errors.group_limit ? "border-red-500" : ""}`}
                />
                {errors.group_limit && (
                    <p className="text-red-500 text-xs mb-4 flex items-center">
                        <AlertCircle className="mr-1" /> {errors.group_limit}
                    </p>
                )}
            </div>

            <label className="block text-sm font-medium text-purple-700 mb-2">
                Semestre
            </label>
            <Input
                name="semester"
                placeholder="Semestre"
                value={
                    newManagement.semester === "first"
                        ? "Primer semestre"
                        : "Segundo semestre"
                }
                disabled
                className="mb-4 bg-gray-100"
            />

            <Button
                onClick={handleCreateManagement}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
            >
                {isLoading ? "Creando..." : "Crear Gestión"}
            </Button>

            {errors.general && (
                <p className="text-red-500 text-center mt-4">{errors.general}</p>
            )}
        </div>
    );
}
