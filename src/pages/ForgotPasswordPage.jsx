import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/apiService';
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        try {
            await postData('/password/email', { email });
            setSuccess('Correo de recuperación enviado exitosamente');
            setError(null);
        } catch (error) {
            setError('Error al enviar el correo de recuperación. Verifica el email ingresado.');
            setSuccess(null);
        }
    };

    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    const particlesOptions = {
        particles: {
            number: {
                value: 200,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                },
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 4,
                    size_min: 0.3,
                    sync: false
                }
            },
            line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 600
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "bubble"
                },
                onclick: {
                    enable: true,
                    mode: "repulse"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 400,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 250,
                    size: 0,
                    duration: 2,
                    opacity: 0,
                    speed: 3
                },
                repulse: {
                    distance: 400,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-950 to-purple-950 animate-gradient-x">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesOptions}
                className="absolute inset-0"
            />
            <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg p-8 relative z-10">
                <h2 className="text-center text-3xl font-semibold text-purple-900 mb-4">Recuperar Contraseña</h2>
                <p className="text-center text-purple-700 mb-6">Ingresa tu email para recuperar tu contraseña</p>

                <form className="space-y-4" onSubmit={handlePasswordReset}>
                    <div className="flex flex-col space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 bg-white text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-500 text-sm">{success}</p>}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out"
                        >
                            Enviar enlace de recuperación
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <button
                        className="text-purple-600 hover:underline"
                        onClick={() => navigate('/login')}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;