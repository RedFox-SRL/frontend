import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Mail, UserPlus} from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [rememberBrowser, setRememberBrowser] = useState(true);
    const emailInputRef = useRef(null);
    const codeInputRefs = useRef([]);

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
            setSuccessMessage(null);
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
            login(token, role, rememberBrowser);
            setSuccessMessage("Código verificado correctamente. Redirigiendo...");
        } catch (error) {
            setError(error.response?.data?.message || "Código de verificación inválido. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (index, value) => {
        if (value.length > 1) {
            // Código pegado
            const pastedCode = value.replace(/\D/g, '').slice(0, 6).split('');
            const newCode = [...verificationCode];
            pastedCode.forEach((digit, i) => {
                if (i < 6) {
                    newCode[i] = digit;
                }
            });
            setVerificationCode(newCode);
            if (pastedCode.length >= 6) {
                codeInputRefs.current[5].focus();
            } else {
                codeInputRefs.current[pastedCode.length].focus();
            }
        } else {
            // Entrada de un solo dígito
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
        navigate("/registro");
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

    const buttonClass = `w-full py-3 rounded-lg transition duration-300 ease-in-out flex items-center justify-center text-sm sm:text-base font-semibold backdrop-filter backdrop-blur-sm`;
    const activeButtonClass = `${buttonClass} bg-purple-600 text-white hover:bg-purple-700`;
    const disabledButtonClass = `${buttonClass} bg-purple-400 text-white cursor-not-allowed`;

    return (<div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-950 to-stone-950 animate-gradient-x p-4 sm:p-6 md:p-8 overflow-auto relative">
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute inset-0"
        />
        <div
            className="w-full max-w-[320px] xs:max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-purple-300">
            <div className="w-full p-6 sm:p-8 md:p-10 bg-white">
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 mb-2 sm:mb-3">TrackMaster</h1>
                <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold text-purple-900 mb-3 sm:mb-4">
                    Inicia sesión
                </h2>
                {!isCodeSent && (<p className="text-center text-sm sm:text-base md:text-lg text-black mb-4 sm:mb-5">
                    ¡Bienvenido de nuevo! Inicia sesión para continuar tu progreso.
                </p>)}
                <AnimatePresence mode="wait">
                    {!isCodeSent ? (<motion.div
                        key="email-form"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                    >
                        <form className="space-y-4" onSubmit={handleSendCode}>
                            <div className="relative">
                                <label htmlFor="email"
                                       className="block text-sm sm:text-base font-medium text-black mb-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`w-full pl-3 pr-10 py-3 text-sm sm:text-base rounded-lg border bg-purple-100 text-black placeholder-purple-400 ${error ? 'border-red-500' : 'border-purple-300'} focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent`}
                                        placeholder="Tu correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        ref={emailInputRef}
                                        required
                                    />
                                    <Mail
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600"
                                        size={20}/>
                                </div>
                                {error && (<p className="text-red-600 text-sm mt-1 flex items-center">
                                    <AlertCircle className="mr-1" size={16}/>{error}
                                </p>)}
                            </div>
                            <button
                                type="submit"
                                className={isLoading || !isValidEmail(email) ? disabledButtonClass : activeButtonClass}
                                disabled={isLoading || !isValidEmail(email)}
                            >
                                {isLoading ? (<span
                                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                    Enviar código
                                    <ArrowRight className="ml-2" size={18}/>
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
                        <p className="text-sm sm:text-base text-black mb-2">
                            Ingresa el código de verificación enviado a {email}
                        </p>
                        <p className="text-sm text-black mb-4">
                            El código expirará en {formatTime(timeLeft)}.
                        </p>
                        <form className="space-y-4" onSubmit={handleVerifyCode}>
                            <div className="flex justify-between mb-4 space-x-2">
                                {verificationCode.map((digit, index) => (<input
                                    key={index}
                                    ref={(el) => (codeInputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    className="w-10 h-12 text-center text-lg sm:text-xl bg-purple-100 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength={6}
                                    required
                                />))}
                            </div>
                            {error && (<motion.p
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                className="text-red-600 text-sm sm:text-base flex items-center"
                            >
                                <AlertCircle className="mr-2" size={18}/>{error}
                            </motion.p>)}
                            {successMessage && (<motion.p
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                className="text-green-600 text-sm sm:text-base flex items-center"
                            >
                                <CheckCircle className="mr-2" size={18}/>{successMessage}
                            </motion.p>)}
                            <div className="flex flex-col space-y-3">
                                <button
                                    type="submit"
                                    className={isLoading || verificationCode.some(digit => digit === "") ? disabledButtonClass : activeButtonClass}
                                    disabled={isLoading || verificationCode.some(digit => digit === "")}
                                >
                                    {isLoading ? (<span
                                        className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>) : (<>
                                        Verificar código
                                        <ArrowRight className="ml-2" size={18}/>
                                    </>)}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCodeSent(false);
                                        setVerificationCode(["", "", "", "", "", ""]);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                    className={`${buttonClass} border border-purple-300 text-black hover:bg-purple-100`}
                                >
                                    <ArrowLeft className="mr-2" size={18}/>
                                    Volver
                                </button>
                            </div>
                        </form>
                        <p className="mt-4 text-center text-sm sm:text-base text-black">
                            ¿No recibiste el código? <button onClick={handleSendCode}
                                                             className="text-purple-600 underline">Reenviar</button>
                        </p>
                    </motion.div>)}
                </AnimatePresence>
                {!isCodeSent && (<div className="mt-6 text-center">
                    <p className="text-sm sm:text-base text-black mb-2">¿No tienes una cuenta?</p>
                    <button
                        onClick={handleRegisterClick}
                        className="bg-purple-100 border border-purple-300 text-black px-4 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-purple-200 text-sm sm:text-base flex items-center justify-center mx-auto"
                    >
                        <UserPlus className="mr-2" size={18}/>
                        Regístrate
                    </button>
                </div>)}
                <div className="mt-6 text-center"></div>
            </div>
        </div>
    </div>);
};

export default LoginPage;