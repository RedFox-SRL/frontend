import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Mail} from 'lucide-react';
import {postData} from "../api/apiService";
import useAuth from "../hooks/useAuth";
import Particles from "react-particles";
import {particlesInit, particlesOptions} from "../components/ParticlesConfig";
import {AnimatePresence, motion} from "framer-motion";

const LoginPage = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [rememberMe, setRememberMe] = useState(false);
    const codeInputRefs = useRef([]);
    const emailInputRef = useRef(null);

    useEffect(() => {
        let timer;
        if (isCodeSent && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setError("El código ha expirado. Por favor, solicita uno nuevo.");
            setIsCodeSent(false);
        }
        return () => clearInterval(timer);
    }, [isCodeSent, timeLeft]);

    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await postData("/login", {email});
            setIsCodeSent(true);
            setTimeLeft(900); // Reset timer to 15 minutes
            setSuccessMessage("Código enviado correctamente. Revisa tu correo.");
        } catch (error) {
            setError(error.response?.data?.message || "Ocurrió un error al enviar el código. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const response = await postData("/verify-code", {
                email, verification_code: verificationCode.join(""),
            });
            const {token, role} = response.data;
            login(token, role, rememberMe);
            setSuccessMessage("Código verificado correctamente. Redirigiendo...");
        } catch (error) {
            setError(error.response?.data?.message || "Código de verificación inválido. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (index, value) => {
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split('');
            const newCode = [...verificationCode];
            pastedCode.forEach((digit, i) => {
                if (i + index < 6) {
                    newCode[i + index] = digit;
                }
            });
            setVerificationCode(newCode);
            if (pastedCode.length + index >= 6) {
                codeInputRefs.current[5].focus();
            } else {
                codeInputRefs.current[index + pastedCode.length].focus();
            }
        } else {
            if (!/^\d*$/.test(value)) return;

            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            if (value && index < 5) {
                codeInputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            codeInputRefs.current[index - 1].focus();
        }
    };

    const handleRegisterClick = () => {
        navigate("/register");
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (<div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-950 to-stone-950 animate-gradient-x p-4 sm:p-6 md:p-8 overflow-auto relative">
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute inset-0"
        />
        <div
            className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 bg-black text-white p-6 md:p-8 flex flex-col justify-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">TrackMaster</h1>
                    <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6">
                        ¡Bienvenido de nuevo!
                        <br/>
                        Inicia sesión para continuar tu progreso.
                    </p>
                    <button
                        type="button"
                        onClick={handleRegisterClick}
                        className="bg-transparent border border-white text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-white hover:text-black text-sm sm:text-base"
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>

                <div
                    className="w-full md:w-1/2 bg-white p-6 sm:p-8 md:p-10 overflow-y-auto max-h-[70vh] md:max-h-none">
                    <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold text-purple-900 mb-2 md:mb-4">
                        Inicia sesión
                    </h2>
                    <AnimatePresence mode="wait">
                        {!isCodeSent ? (<motion.div
                            key="email-form"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                        >
                            <form className="space-y-4 md:space-y-6" onSubmit={handleSendCode}>
                                <div className="relative">
                                    <label htmlFor="email"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className={`w-full pl-3 pr-10 py-2 text-sm sm:text-base rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                            placeholder="Tu correo electrónico"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            ref={emailInputRef}
                                            required
                                        />
                                        <Mail
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={20}/>
                                    </div>
                                    {error && (<p className="text-red-500 text-xs mt-1 flex items-center">
                                        <AlertCircle className="mr-1" size={16}/>{error}
                                    </p>)}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    disabled={isLoading || !isValidEmail(email)}
                                >
                                    {isLoading ? (<span
                                        className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                        Enviar código
                                        <ArrowRight className="ml-2" size={20}/>
                                    </>)}
                                </button>
                            </form>
                        </motion.div>) : (<motion.div
                            key="verification-form"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                        >
                            <p className="text-sm md:text-base text-purple-700 mb-2">
                                Ingresa el código de verificación enviado a {email}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">
                                El código expirará en {formatTime(timeLeft)}.
                            </p>
                            <form className="space-y-4 md:space-y-6" onSubmit={handleVerifyCode}>
                                <div className="flex justify-between mb-4">
                                    {verificationCode.map((digit, index) => (<input
                                        key={index}
                                        ref={(el) => (codeInputRefs.current[index] = el)}
                                        type={showCode ? "text" : "password"}
                                        className="w-10 h-12 text-center text-lg sm:text-xl bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        maxLength={6}
                                        required
                                    />))}
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="rounded text-purple-600 focus:ring-purple-500"
                                        />
                                        <label htmlFor="rememberMe" className="ml-2 text-sm text-purple-700">
                                            Mantener sesión activa
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCode(!showCode)}
                                        className="text-purple-700 flex items-center text-sm"
                                    >
                                        {showCode ? <EyeOff size={16} className="mr-1"/> :
                                            <Eye size={16} className="mr-1"/>}
                                        {showCode ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                                {error && (<motion.p
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="text-red-500 text-sm flex items-center"
                                >
                                    <AlertCircle className="mr-2" size={16}/>{error}
                                </motion.p>)}
                                {successMessage && (<motion.p
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="text-green-500 text-sm flex items-center"
                                >
                                    <CheckCircle className="mr-2" size={16}/>{successMessage}
                                </motion.p>)}
                                <div
                                    className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 md:mt-10 space-y-4 sm:space-y-0 sm:space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCodeSent(false);
                                            setVerificationCode(["", "", "", "", "", ""]);
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 border border-purple-600 text-purple-600 rounded-lg transition duration-300 ease-in-out text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        <ArrowLeft className="mr-2" size={16}/>
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 text-white rounded-lg transition duration-300 ease-in-out text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                        disabled={isLoading || verificationCode.some(digit => digit === "")}
                                    >
                                        {isLoading ? (<span
                                            className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                            Verificar código
                                            <ArrowRight className="ml-2" size={16}/>
                                        </>)}
                                    </button>
                                </div>
                            </form>
                            <p className="mt-4 text-center text-sm text-purple-700">
                                ¿No recibiste el código? <button onClick={handleSendCode}
                                                                 className="text-purple-900 underline">Reenviar</button>
                            </p>
                        </motion.div>)}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </div>);
};

export default LoginPage;