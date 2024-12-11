import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {postData} from "../api/apiService";
import {ArrowLeft, ArrowRight, CheckCircle} from 'lucide-react';
import Particles from "react-particles";
import {particlesInit, particlesOptions} from "../components/ParticlesConfig";
import {AnimatePresence, motion} from "framer-motion";

const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    return nameRegex.test(name);
};

const LoginRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 2;
    const [formData, setFormData] = useState({
        name: "", last_name: "", email: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const validateStep = (currentStep) => {
        let stepErrors = {};
        switch (currentStep) {
            case 1:
                if (formData.name.trim() === "") {
                    stepErrors.name = "El nombre es obligatorio";
                } else if (formData.name.trim().length < 2) {
                    stepErrors.name = "El nombre debe tener al menos 2 caracteres";
                } else if (formData.name.trim().length > 50) {
                    stepErrors.name = "El nombre no debe exceder 50 caracteres";
                } else if (!validateName(formData.name)) {
                    stepErrors.name = "El nombre contiene caracteres no válidos";
                }

                if (formData.last_name.trim() === "") {
                    stepErrors.last_name = "Los apellidos son obligatorios";
                } else if (formData.last_name.trim().length < 2) {
                    stepErrors.last_name = "Los apellidos deben tener al menos 2 caracteres";
                } else if (formData.last_name.trim().length > 50) {
                    stepErrors.last_name = "Los apellidos no deben exceder 50 caracteres";
                } else if (!validateName(formData.last_name)) {
                    stepErrors.last_name = "Los apellidos contienen caracteres no válidos";
                }
                break;
            case 2:
                if (formData.email.trim() !== "") {
                    if (!/\S+@\S+\.\S+/.test(formData.email)) {
                        stepErrors.email = "El formato del email no es válido";
                    } else if (!formData.email.endsWith('@est.umss.edu') && !formData.email.endsWith('@fcyt.umss.edu.bo')) {
                        stepErrors.email = "Debes usar un email institucional (@est.umss.edu o @fcyt.umss.edu.bo)";
                    } else if (formData.email.endsWith('@est.umss.edu') && !/^20\d{7}@est\.umss\.edu$/.test(formData.email)) {
                        stepErrors.email = "El email de estudiante debe tener el formato 20XXXXXXX@est.umss.edu";
                    }
                }
                break;
        }
        return stepErrors;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        setErrors(prev => ({...prev, [name]: ""}));
    };

    const handleNextStep = () => {
        const stepErrors = validateStep(step);
        if (Object.keys(stepErrors).length === 0) {
            setStep(prev => prev + 1);
        } else {
            setErrors(stepErrors);
        }
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const stepErrors = validateStep(step);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await postData("/register", formData);
            if (response.success) {
                setShowNotification(true);
                setTimeout(() => {
                    setShowNotification(false);
                    navigate("/");
                }, 3000);
            } else {
                setErrors(response.data);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.data);
            } else {
                setErrors({api: "Hubo un error en el registro. Por favor, inténtalo de nuevo."});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isEmailValid = () => {
        const emailErrors = validateStep(2);
        return Object.keys(emailErrors).length === 0 && formData.email.trim() !== "";
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (<motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 20}}
                    transition={{duration: 0.3}}
                >
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Paso {step} de {totalSteps}</h3>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-5 md:mb-6">Información
                        Personal</h4>
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="relative">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm sm:text-base rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Tu nombre (mínimo 2 caracteres)"
                                minLength={2}
                                maxLength={50}
                            />
                            <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                  {formData.name.length}/50
                </span>
                        </div>
                        {errors.name && <p className="text-red-500 text-xs sm:text-sm ml-1">{errors.name}</p>}

                        <div className="relative">
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm sm:text-base rounded-lg border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Tus apellidos (mínimo 2 caracteres)"
                                minLength={2}
                                maxLength={50}
                            />
                            <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                  {formData.last_name.length}/50
                </span>
                        </div>
                        {errors.last_name && <p className="text-red-500 text-xs sm:text-sm ml-1">{errors.last_name}</p>}
                    </div>
                </motion.div>);
            case 2:
                return (<motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 20}}
                    transition={{duration: 0.3}}
                >
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Paso {step} de {totalSteps}</h3>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-5 md:mb-6">Correo
                        Electrónico Institucional</h4>
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600">
                            Usa tu correo institucional:
                            <br/>- Estudiantes: codsis@est.umss.edu
                            <br/>- Docentes: @fcyt.umss.edu.bo
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm sm:text-base rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Tu correo institucional"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs sm:text-sm ml-1">{errors.email}</p>}
                    </div>
                </motion.div>);
            default:
                return null;
        }
    };

    return (<div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-950 to-stone-950 animate-gradient-x p-4 sm:p-6 md:p-8 overflow-auto relative">
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute inset-0"
        />
        <AnimatePresence>
            {showNotification && (<motion.div
                initial={{opacity: 0, y: -50}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -50}}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center text-sm sm:text-base"
            >
                <CheckCircle className="mr-2" size={20}/>
                <span>Registro exitoso. Redirigiendo...</span>
            </motion.div>)}
        </AnimatePresence>
        <div
            className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 bg-black text-white p-6 md:p-8 flex flex-col justify-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">TrackMaster</h1>
                    <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6">
                        ¡Bienvenido a TrackMaster!
                        <br/>
                        Únete a nuestra comunidad de aprendizaje en {totalSteps} sencillos pasos.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="bg-transparent border border-white text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out text-sm sm:text-base"
                    >
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>

                <div
                    className="w-full md:w-1/2 bg-white p-6 sm:p-8 md:p-10 overflow-y-auto max-h-[70vh] md:max-h-none">
                    <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold text-purple-900 mb-2 md:mb-4">
                        Crea tu cuenta
                    </h2>
                    <p className="text-center text-sm md:text-base text-purple-700 mb-4 md:mb-6">
                        Completa el formulario para comenzar tu viaje con TrackMaster
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        {renderStepContent()}

                        <div className="flex justify-between mt-6 sm:mt-8 md:mt-10">
                            {step > 1 && (<button
                                type="button"
                                onClick={handlePrevStep}
                                className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 border border-purple-600 text-purple-600 rounded-lg transition duration-300 ease-in-out text-sm sm:text-base"
                            >
                                <ArrowLeft className="mr-2" size={16}/>
                                Anterior
                            </button>)}
                            {step < totalSteps ? (<button
                                type="button"
                                onClick={handleNextStep}
                                className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 text-white rounded-lg transition duration-300 ease-in-out ml-auto text-sm sm:text-base"
                            >
                                Siguiente
                                <ArrowRight className="ml-2" size={16}/>
                            </button>) : (<button
                                type="submit"
                                className={`flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 text-white rounded-lg transition duration-300 ease-in-out ml-auto text-sm sm:text-base ${!isEmailValid() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isEmailValid() || isLoading}
                            >
                                {isLoading ? (<span
                                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                    Registrarse
                                    <ArrowRight className="ml-2" size={16}/>
                                </>)}
                            </button>)}
                        </div>
                    </form>

                    {errors.api && (<p className="text-red-500 text-center mt-4 text-xs sm:text-sm">{errors.api}</p>)}
                </div>
            </div>
        </div>
    </div>);
};

export default LoginRegister;

