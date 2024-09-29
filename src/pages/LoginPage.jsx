import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { postData } from '../api/apiService';
import useAuth from '../hooks/useAuth';
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await postData('/login', { email, password });
      const { token, role } = response.data;
      login(token, role, rememberMe);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Error en la autenticación. Verifica tus credenciales.');
      } else {
        setError('Ocurrió un error. Inténtalo de nuevo más tarde.');
      }
      console.error('Error:', error);
    }
  };

  const handleRegisterClick = () => {
    navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-950 to-purple-950 animate-gradient-x p-4 relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0"
      />
      <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">TrackMaster</h1>
          <p className="text-lg mb-6">¡Bienvenido!<br/>Ingrese ahora mismo a su cuenta</p>
          <button
            type="button"
            onClick={handleRegisterClick}
            className="bg-transparent border border-white text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-white hover:text-black"
          >
            REGISTRATE
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-6 text-center underline hover:text-purple-200 transition duration-300 ease-in-out"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 rounded-r-lg">
          <h2 className="text-center text-3xl font-semibold text-purple-900 mb-4">Inicia sesión !!</h2>
          <p className="text-center text-purple-700 mb-6">Ingresa tus datos</p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-black">Recuérdame</label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out"
              >
                INICIAR SESIÓN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;