import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft, ArrowRight, CheckCircle, Mail} from 'lucide-react';
import {postData} from "../api/apiService";
import Particles from "react-particles";
import {particlesInit, particlesOptions} from "../components/ParticlesConfig";
import {AnimatePresence, motion} from "framer-motion";

const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
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
    const [showPassword, setShowPassword] = useState(false);
    const emailInputRef = useRef(null);

    useEffect(() => {
        if (emailInputRef.current && step === 2) {
            emailInputRef.current.focus();
        }
    }, [step]);

    const validateStep = (currentStep) => {
        let stepErrors = {};
        switch (currentStep) {
            case 1:
                if (countNonSpaceCharacters(formData.name) < 3) {
                    stepErrors.name = "El nombre debe tener al menos 3 caracteres (sin contar espacios)";
                } else if (countNonSpaceCharacters(formData.name) > 25) {
                    stepErrors.name = "El nombre no debe exceder 25 caracteres (sin contar espacios)";
                } else if (!validateName(formData.name)) {
                    stepErrors.name = "El nombre contiene caracteres no válidos";
                }

                if (countNonSpaceCharacters(formData.last_name) < 3) {
                    stepErrors.last_name = "Los apellidos deben tener al menos 3 caracteres (sin contar espacios)";
                } else if (countNonSpaceCharacters(formData.last_name) > 25) {
                    stepErrors.last_name = "Los apellidos no deben exceder 25 caracteres (sin contar espacios)";
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
        if (name === 'name' || name === 'last_name') {
            let processedValue = value;
            const nonSpaceCount = countNonSpaceCharacters(processedValue);

            // Permitir espacios después de los primeros 3 caracteres
            if (nonSpaceCount >= 3) {
                processedValue = processedValue.replace(/\s+/g, ' ');
            } else {
                processedValue = processedValue.replace(/\s/g, '');
            }

            // Limitar a 25 caracteres sin contar espacios
            if (nonSpaceCount <= 25) {
                setFormData(prev => ({...prev, [name]: processedValue}));
                setErrors(prev => ({...prev, [name]: ""}));
            }
        } else {
            setFormData(prev => ({...prev, [name]: value}));
            setErrors(prev => ({...prev, [name]: ""}));
        }
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
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="relative">
                            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm sm:text-base rounded-lg border bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-white placeholder-white placeholder-opacity-70 ${errors.name ? 'border-red-500' : 'border-white border-opacity-30'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Tu nombre (mínimo 3 letras)"
                                minLength={3}
                                maxLength={25}
                            />
                            <span className="absolute right-2 bottom-2 text-xs text-white opacity-70">
                                    {countNonSpaceCharacters(formData.name)}/25
                                </span>
                        </div>
                        {errors.name && <p className="text-red-300 text-xs sm:text-sm ml-1">{errors.name}</p>}

                        <div className="relative">
                            <label htmlFor="last_name" className="block text-sm font-medium text-white mb-1">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm sm:text-base rounded-lg border bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-white placeholder-white placeholder-opacity-70 ${errors.last_name ? 'border-red-500' : 'border-white border-opacity-30'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                placeholder="Tus apellidos (mínimo 3 letras)"
                                minLength={3}
                                maxLength={25}
                            />
                            <span className="absolute right-2 bottom-2 text-xs text-white opacity-70">
                                    {countNonSpaceCharacters(formData.last_name)}/25
                                </span>
                        </div>
                        {errors.last_name && <p className="text-red-300 text-xs sm:text-sm ml-1">{errors.last_name}</p>}
                    </div>
                </motion.div>);
            case 2:
                return (<motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 20}}
                    transition={{duration: 0.3}}
                >
                    <div
                        className="mb-4 p-3 bg-purple-800 bg-opacity-30 backdrop-filter backdrop-blur-md rounded-lg">
                        <p className="text-sm text-white font-medium">
                            Usa tu correo institucional:
                            <br/>- Estudiantes: <span className="font-bold">codsis@est.umss.edu</span>
                            <br/>- Docentes: <span className="font-bold">@fcyt.umss.edu.bo</span>
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                                Correo Electrónico *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-3 pr-10 py-2 text-sm sm:text-base rounded-lg border bg-white bg-opacity-10 backdrop-filter backdrop-blur-md text-white placeholder-white placeholder-opacity-70 ${errors.email ? 'border-red-500' : 'border-white border-opacity-30'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                    placeholder="Tu correo institucional"
                                    ref={emailInputRef}
                                />
                                <Mail
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
                                    size={20}/>
                            </div>
                        </div>
                        {errors.email && <p className="text-red-300 text-xs sm:text-sm ml-1">{errors.email}</p>}
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
                className="fixed top-4 inset-x-0 mx-auto w-fit bg-green-500 text-white px-6 py-2 rounded-lg shadow-lg z-50 flex items-center text-sm sm:text-base"
            >
                <CheckCircle className="mr-2" size={20}/>
                <span>Registro exitoso. Redirigiendo...</span>
            </motion.div>)}
        </AnimatePresence>
        <div
            className="w-full max-w-[320px] xs:max-w-xs sm:max-w-sm md:max-w-md bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white border-opacity-10">
            <div className="w-full p-6 sm:p-8 md:p-10 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow">TrackMaster</h1>
                <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4 drop-shadow">
                    Crea tu cuenta
                </h2>
                <p className="text-center text-sm sm:text-base md:text-lg text-white mb-4 sm:mb-5 drop-shadow">
                    Completa el formulario para comenzar tu viaje con TrackMaster
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex space-x-2">
                            {[1, 2].map((stepNumber) => (<div
                                key={stepNumber}
                                className={`w-3 h-3 rounded-full ${step >= stepNumber ? 'bg-purple-600' : 'bg-white bg-opacity-30'}`}
                            />))}
                        </div>
                        <span className="text-white text-sm">Paso {step} de {totalSteps}</span>
                    </div>
                    {renderStepContent()}

                    <div className="flex flex-col gap-3 mt-6">
                        {step < totalSteps ? (<button
                            type="button"
                            onClick={handleNextStep}
                            className={`w-full flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 text-white rounded-lg transition duration-300 ease-in-out text-sm sm:text-base ${Object.keys(validateStep(step)).length > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                            disabled={Object.keys(validateStep(step)).length > 0}
                        >
                            Siguiente
                            <ArrowRight className="ml-2" size={16}/>
                        </button>) : (<button
                            type="submit"
                            className={`w-full py-3 rounded-lg transition duration-300 ease-in-out flex items-center justify-center text-sm sm:text-base font-semibold backdrop-filter backdrop-blur-sm ${isEmailValid() && !isLoading ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-400 text-white cursor-not-allowed'}`}
                            disabled={!isEmailValid() || isLoading}
                        >
                            {isLoading ? (<span
                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                Registrarse
                                <ArrowRight className="ml-2" size={16}/>
                            </>)}
                        </button>)}
                        {step > 1 && (<button
                            type="button"
                            onClick={handlePrevStep}
                            className="w-full flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 border border-white text-white rounded-lg transition duration-300 ease-in-out text-sm sm:text-base hover:bg-white hover:bg-opacity-10"
                        >
                            <ArrowLeft className="mr-2" size={16}/>
                            Anterior
                        </button>)}
                    </div>
                </form>

                {errors.api && (<p className="text-red-300 text-center mt-4 text-xs sm:text-sm">{errors.api}</p>)}

                {step === 1 && (<div className="mt-6 text-center">
                    <p className="text-sm sm:text-base text-white mb-2 drop-shadow">¿Ya tienes una cuenta?</p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-transparent border border-white border-opacity-30 text-white px-4 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-10 text-sm sm:text-base flex items-center justify-center backdrop-filter backdrop-blur-sm"
                    >
                        <ArrowLeft className="mr-2" size={18}/>
                        Iniciar sesión
                    </button>
                </div>)}
            </div>
        </div>
    </div>);
};

export default LoginRegister;

