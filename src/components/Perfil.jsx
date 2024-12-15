import React, {Fragment, useEffect, useState} from "react";
import {getData, putData} from "../api/apiService";
import {AlertCircle, Briefcase, CheckCircle, Mail, X} from 'lucide-react';
import {Dialog, Transition} from "@headlessui/react";

const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return nameRegex.test(name);
};

const trimExcessiveSpaces = (str) => {
    let trimmed = str.trim();
    if (trimmed.replace(/\s/g, '').length < 3) {
        return trimmed.replace(/\s/g, '');
    }
    return trimmed.replace(/\s+/g, ' ');
};

const countNonSpaceCharacters = (str) => {
    return str.replace(/\s/g, '').length;
};

const normalizeText = (text) => {
    return text.toLowerCase().replace(/\s+/g, '');
};

export default function Perfil({isOpen, onClose}) {
    const [userData, setUserData] = useState({
        nombre: "", apellido: "", email: "", profilePicture: "", role: "",
    });
    const [originalUserData, setOriginalUserData] = useState({
        nombre: "", apellido: "",
    });
    const [originalData, setOriginalData] = useState({nombre: "", apellido: ""});
    const [message, setMessage] = useState("");
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [touched, setTouched] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const response = await getData("/me");
            const {name, last_name, email, profilePicture, role} = response.data.item;
            const newUserData = {
                nombre: name, apellido: last_name, email: email, profilePicture: profilePicture, role: role,
            };
            setUserData(newUserData);
            setOriginalUserData({
                nombre: name, apellido: last_name,
            });
            setOriginalData({
                nombre: name, apellido: last_name,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError({general: "Error al cargar los datos del usuario."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (message || Object.keys(error).length > 0) {
            const timer = setTimeout(() => {
                setMessage("");
                setError({});
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'nombre' || name === 'apellido') {
            const sanitizedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
            let processedValue = sanitizedValue;
            const nonSpaceCount = countNonSpaceCharacters(processedValue);

            if (nonSpaceCount <= 25) {
                if (nonSpaceCount >= 3) {
                    processedValue = processedValue.replace(/\s+/g, ' ');
                } else {
                    processedValue = processedValue.replace(/\s/g, '');
                }
                if (nonSpaceCount === 25 && processedValue.endsWith(' ')) {
                    processedValue = processedValue.trim();
                }
            } else {
                let newValue = '';
                let currentNonSpaceCount = 0;
                for (let char of sanitizedValue) {
                    if (char !== ' ') {
                        if (currentNonSpaceCount < 25) {
                            newValue += char;
                            currentNonSpaceCount++;
                        }
                    } else if (currentNonSpaceCount < 25) {
                        newValue += char;
                    }
                }
                processedValue = newValue;
            }

            setUserData(prev => {
                const newUserData = {...prev, [name]: processedValue};
                const isChanged = normalizeText(newUserData.nombre) !== normalizeText(originalUserData.nombre) || normalizeText(newUserData.apellido) !== normalizeText(originalUserData.apellido);
                const isValid = countNonSpaceCharacters(newUserData.nombre) >= 3 && countNonSpaceCharacters(newUserData.apellido) >= 3;
                setIsFormChanged(isChanged && isValid);
                return newUserData;
            });
        } else {
            setUserData(prev => {
                const newUserData = {...prev, [name]: value};
                setIsFormChanged(true);
                return newUserData;
            });
        }
        setTouched(prev => ({...prev, [name]: true}));
        setError(prev => ({...prev, [name]: ""}));
    };

    const validateForm = () => {
        let formErrors = {};
        if (countNonSpaceCharacters(userData.nombre) < 3) {
            formErrors.nombre = "El nombre debe tener al menos 3 caracteres (sin contar espacios)";
        } else if (countNonSpaceCharacters(userData.nombre) > 25) {
            formErrors.nombre = "El nombre no debe exceder 25 caracteres (sin contar espacios)";
        } else if (!validateName(userData.nombre)) {
            formErrors.nombre = "El nombre contiene caracteres no válidos";
        }

        if (countNonSpaceCharacters(userData.apellido) < 3) {
            formErrors.apellido = "Los apellidos deben tener al menos 3 caracteres (sin contar espacios)";
        } else if (countNonSpaceCharacters(userData.apellido) > 25) {
            formErrors.apellido = "Los apellidos no deben exceder 25 caracteres (sin contar espacios)";
        } else if (!validateName(userData.apellido)) {
            formErrors.apellido = "Los apellidos contienen caracteres no válidos";
        }

        return formErrors;
    };

    const handleBlur = (field) => {
        setTouched(prev => ({...prev, [field]: true}));
        const formErrors = validateForm();
        setError(formErrors);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setError(formErrors);
            setTouched({
                nombre: true, apellido: true,
            });
            return;
        }

        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);
        setIsSubmitting(true);
        try {
            const updatedData = {
                name: userData.nombre, last_name: userData.apellido,
            };
            const response = await putData("/profile", updatedData);
            setMessage(response.message);
            setError({});
            // The user data will be fetched again when needed
            setIsFormChanged(false);
            setOriginalUserData({
                nombre: userData.nombre, apellido: userData.apellido,
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setIsSubmitting(false);
            }, 2000);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError(error.response.data.data);
            } else {
                setError({general: "Ocurrió un error inesperado."});
            }
            setMessage("");
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setUserData(prev => ({
            ...prev, nombre: originalData.nombre, apellido: originalData.apellido
        }));
        setIsFormChanged(false);
        setError({});
        setTouched({});
        onClose();
    };

    const getInputClassName = (field) => {
        let baseClass = "w-full px-3 py-2 text-xs sm:text-sm md:text-base rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent";
        if (touched[field] && error[field]) {
            return `${baseClass} border-red-500`;
        }
        return `${baseClass} border-gray-300`;
    };

    return (<Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={handleClose}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"/>
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel
                            className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3"
                                          className="text-base sm:text-lg md:text-xl font-semibold leading-6 text-gray-900 mb-4">
                                Editar Perfil
                            </Dialog.Title>
                            <button
                                onClick={handleClose}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6"/>
                            </button>

                            {isLoading ? (<div className="space-y-4">
                                <div
                                    className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
                                <div className="space-y-4">
                                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                                </div>
                            </div>) : (<>
                                <div className="mb-6 text-center">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                                        {userData.nombre} {userData.apellido}
                                    </h3>
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <div
                                            className="flex items-center text-xs sm:text-sm md:text-base text-gray-500">
                                            <Briefcase className="w-4 h-4 mr-1"/>
                                            <span>{userData.role === "student" ? "Estudiante" : userData.role === "teacher" ? "Docente" : userData.role}</span>
                                        </div>
                                        <div
                                            className="flex items-center text-xs sm:text-sm md:text-base text-gray-500">
                                            <Mail className="w-4 h-4 mr-1"/>
                                            <span>{userData.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="nombre"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombres *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="nombre"
                                                type="text"
                                                name="nombre"
                                                value={userData.nombre}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("nombre")}
                                                className={getInputClassName("nombre")}
                                                placeholder="Tus nombres (mínimo 3 letras)"
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm md:text-base text-gray-400">
                                                        {countNonSpaceCharacters(userData.nombre)}/25
                                                    </span>
                                        </div>
                                        {touched.nombre && error.nombre && (
                                            <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{error.nombre}</p>)}
                                    </div>
                                    <div>
                                        <label htmlFor="apellido"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellidos *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="apellido"
                                                type="text"
                                                name="apellido"
                                                value={userData.apellido}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("apellido")}
                                                className={getInputClassName("apellido")}
                                                placeholder="Tus apellidos (mínimo 3 letras)"
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm md:text-base text-gray-400">
                                                        {countNonSpaceCharacters(userData.apellido)}/25
                                                    </span>
                                        </div>
                                        {touched.apellido && error.apellido && (
                                            <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{error.apellido}</p>)}
                                    </div>
                                    <button
                                        type="submit"
                                        className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ${isFormChanged && !isSubmitting ? '' : 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400'}`}
                                        disabled={!isFormChanged || isSubmitting}
                                    >
                                        {isSubmitting ? (<span
                                            className="animate-spin rounded-full h-5 w-5 border-2 border-b-white border-white"></span>) : isSuccess ? (
                                            <CheckCircle
                                                className="h-5 w-5 text-white"/>) : ('Guardar Cambios')}
                                    </button>
                                    {message && (<div
                                        className="mt-4 p-2 bg-green-100 border border-green-300 text-green-700 text-sm rounded-md">
                                        {message}
                                    </div>)}
                                    {error.general && (<div
                                        className="mt-4 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded-md">
                                        <AlertCircle className="inline-block mr-2" size={16}/>
                                        <span>{error.general}</span>
                                    </div>)}
                                </form>

                                <Transition appear show={showConfirmation} as={Fragment}>
                                    <Dialog as="div" className="relative z-20"
                                            onClose={() => setShowConfirmation(false)}>
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div
                                                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"/>
                                        </Transition.Child>

                                        <div className="fixed inset-0 overflow-y-auto">
                                            <div
                                                className="flex items-center justify-center min-h-full p-4 text-center">
                                                <Transition.Child
                                                    as={Fragment}
                                                    enter="ease-out duration-300"
                                                    enterFrom="opacity-0 scale-95"
                                                    enterTo="opacity-100 scale-100"
                                                    leave="ease-in duration-200"
                                                    leaveFrom="opacity-100 scale-100"
                                                    leaveTo="opacity-0 scale-95"
                                                >
                                                    <Dialog.Panel
                                                        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <Dialog.Title as="h3"
                                                                          className="text-base sm:text-lg md:text-xl font-medium leading-6 text-gray-900">
                                                                Confirmación
                                                            </Dialog.Title>
                                                            <button
                                                                onClick={() => setShowConfirmation(false)}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                <X className="w-6 h-6"/>
                                                            </button>
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="text-xs sm:text-sm md:text-base text-gray-500">
                                                                ¿Estás seguro de que deseas guardar los cambios?
                                                            </p>
                                                        </div>
                                                        <div className="mt-4 flex justify-end space-x-2">
                                                            <button
                                                                type="button"
                                                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                                onClick={() => setShowConfirmation(false)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                                                                onClick={confirmSubmit}
                                                            >
                                                                Confirmar
                                                            </button>
                                                        </div>
                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                            </>)}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition>);
}