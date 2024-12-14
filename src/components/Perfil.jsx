import React, {Fragment, useEffect, useRef, useState} from "react";
import {getData, putData} from "../api/apiService";
import {Avatar, AvatarFallback, AvatarImage} from "../components/ui/avatar";
import {AlertCircle, CheckCircle, HelpCircle, X} from 'lucide-react';
import {useUser} from "../context/UserContext";
import {Dialog, Transition} from "@headlessui/react";

export default function Perfil({isOpen, onClose}) {
    const {user, updateUser} = useUser();
    const [userData, setUserData] = useState({
        nombre: "", apellido: "", email: "", profilePicture: "", role: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [touched, setTouched] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const tooltipRef = useRef(null);

    const getAvatarUrl = (name, lastName) => {
        return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + " " + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setIsLoading(true);
                try {
                    const response = await getData("/me");
                    const {name, last_name, email, profilePicture, role} = response.data.item;
                    const newUserData = {
                        nombre: name, apellido: last_name, email: email, profilePicture: profilePicture, role: role,
                    };
                    setUserData(newUserData);
                    updateUser(newUserData);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setError({general: "Error al cargar los datos del usuario."});
                } finally {
                    setIsLoading(false);
                }
            } else {
                setUserData({
                    nombre: user.name,
                    apellido: user.last_name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    role: user.role,
                });
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, updateUser]);

    useEffect(() => {
        if (message || Object.keys(error).length > 0) {
            const timer = setTimeout(() => {
                setMessage("");
                setError({});
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setTooltipVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tooltipRef]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === "nombre" || name === "apellido") {
            const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
            setUserData((prev) => ({...prev, [name]: filteredValue}));
        } else {
            setUserData((prev) => ({...prev, [name]: value}));
        }

        setTouched((prev) => ({...prev, [name]: true}));
    };

    const validateForm = () => {
        let formErrors = {};
        if (userData.nombre.trim().length < 3) {
            formErrors.nombre = "El nombre debe tener al menos 3 caracteres";
        }

        if (userData.apellido.trim().length < 3) {
            formErrors.apellido = "El apellido debe tener al menos 3 caracteres";
        }

        if (!userData.email.trim()) {
            formErrors.email = "El email es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            formErrors.email = "Email inválido";
        }

        return formErrors;
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({...prev, [field]: true}));
        const formErrors = validateForm();
        setError(formErrors);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setError(formErrors);
            setTouched({
                nombre: true, apellido: true, email: true,
            });
            return;
        }

        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);
        try {
            const updatedData = {
                name: userData.nombre, last_name: userData.apellido, email: userData.email,
            };
            const response = await putData("/profile", updatedData);
            setMessage(response.message);
            setError({});
            updateUser({...user, ...updatedData});
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError(error.response.data.data);
            } else {
                setError({general: "Ocurrió un error inesperado."});
            }
            setMessage("");
        }
    };

    const getInputClassName = (field) => {
        let baseClass = "w-full p-2 border rounded focus:outline-none focus:ring-2 transition-colors duration-200";
        if (touched[field] && error[field]) {
            return `${baseClass} border-red-500 focus:ring-red-400`;
        }
        return `${baseClass} focus:ring-purple-400`;
    };

    return (<Transition appear show={isOpen} as={Fragment}>
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
                <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-md"/>
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
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                Editar Perfil
                            </Dialog.Title>
                            <button
                                onClick={onClose}
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
                                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                                </div>
                            </div>) : (<>
                                <div className="mb-6">
                                    <div
                                        className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg">
                                        <Avatar className="w-full h-full border-2 border-white rounded-full">
                                            <AvatarImage
                                                src={userData.profilePicture || getAvatarUrl(userData.nombre, userData.apellido)}
                                                alt={`${userData.nombre} ${userData.apellido}`}
                                            />
                                            <AvatarFallback
                                                className="bg-purple-200 text-purple-800 text-xl font-bold">
                                                {userData.nombre.charAt(0)}
                                                {userData.apellido.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3 className="text-center text-xl font-semibold">
                                        {userData.nombre} {userData.apellido}
                                    </h3>
                                    <p className="text-center text-gray-600">
                                        {userData.role === "student" ? "Estudiante" : userData.role === "teacher" ? "Docente" : userData.role}
                                    </p>
                                    <p className="text-center text-gray-600">{userData.email}</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="nombre"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombres
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
                                                maxLength={25}
                                                placeholder="Minimo 3 letras"
                                            />
                                            <span
                                                className="absolute right-2 top-2 text-sm text-gray-600">{userData.nombre.length}/25</span>
                                        </div>
                                        {touched.nombre && error.nombre &&
                                            <p className="text-red-500 text-sm mt-1">{error.nombre}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="apellido"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellidos
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
                                                maxLength={25}
                                                placeholder="Minimo 3 letras"
                                            />
                                            <span
                                                className="absolute right-2 top-2 text-sm text-gray-600">{userData.apellido.length}/25</span>
                                        </div>
                                        {touched.apellido && error.apellido &&
                                            <p className="text-red-500 text-sm mt-1">{error.apellido}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo Electrónico
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur("email")}
                                                className={getInputClassName("email")}
                                                disabled
                                            />
                                            <div
                                                className="absolute right-2 top-2 cursor-pointer"
                                                onMouseEnter={() => setTooltipVisible(true)}
                                                onMouseLeave={() => setTooltipVisible(false)}
                                                onClick={() => setTooltipVisible(!tooltipVisible)}
                                                ref={tooltipRef}
                                            >
                                                <HelpCircle className="text-gray-500"/>
                                            </div>
                                            {tooltipVisible && (<div
                                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                                                El correo no puede editarse
                                            </div>)}
                                        </div>
                                        {touched.email && error.email &&
                                            <p className="text-red-500 text-sm mt-1">{error.email}</p>}
                                    </div>
                                    <button type="submit"
                                            className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition duration-300 ease-in-out">
                                        Guardar Cambios
                                    </button>
                                </form>

                                {(message || Object.keys(error).length > 0) && (<div className="mt-4">
                                    {message && (<div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                                        <CheckCircle className="inline-block mr-2" size={20}/>
                                        <span>{message}</span>
                                    </div>)}
                                    {(error.general || error.email) && (
                                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
                                            <AlertCircle className="inline-block mr-2" size={20}/>
                                            <span>{error.general || error.email}</span>
                                        </div>)}
                                </div>)}

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
                                                            <Dialog.Title
                                                                as="h3"
                                                                className="text-lg font-medium leading-6 text-gray-900"
                                                            >
                                                                Confirmación
                                                            </Dialog.Title>
                                                            <button
                                                                onClick={() => setShowConfirmation(false)}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                <X className="w-6 h-6"/>
                                                            </button>
                                                        </div>
                                                        <div className="mt-4">
                                                            <p>¿Estás seguro de que deseas guardar los
                                                                cambios?</p>
                                                        </div>
                                                        <div className="mt-6 flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setShowConfirmation(false)}
                                                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                onClick={confirmSubmit}
                                                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
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