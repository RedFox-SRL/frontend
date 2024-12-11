import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../api/apiService";
import { AlertCircle, Check, CheckCircle, Eye, EyeOff } from "lucide-react";
import Particles from "react-particles";
import { particlesInit, particlesOptions } from "../components/ParticlesConfig";

const LoginRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  useEffect(() => {
    document.body.classList.remove("overflow-hidden");
    document.body.classList.add("overflow-auto", "overscroll-none");

    document.documentElement.style.minHeight = "100%";
    document.body.style.minHeight = "100%";

    return () => {
      document.body.classList.remove("overflow-auto", "overscroll-none");
      document.documentElement.style.minHeight = "";
      document.body.style.minHeight = "";
    };
  }, []);

  const passwordRequirements = [
    { regex: /.{8,10}/, text: "Entre 8 y 10 caracteres" },
    { regex: /[A-Z]/, text: "Al menos una letra mayúscula" },
    { regex: /[a-z]/, text: "Al menos una letra minúscula" },
    { regex: /[0-9]/, text: "Al menos un número" },
    { regex: /[!@#$%^&*]/, text: "Al menos un carácter especial (!@#$%^&*)" },
  ];

  const validateForm = () => {
    let formErrors = {};
    if (name.trim() === "") {
      formErrors.name = "Este campo es obligatorio";
    } else if (name.trim().length > 15) {
      formErrors.name = "El nombre no debe exceder 15 caracteres";
    }

    if (lastName.trim() === "") {
      formErrors.lastName = "Este campo es obligatorio";
    } else if (lastName.trim().length > 15) {
      formErrors.lastName = "Los apellidos no deben exceder 15 caracteres";
    }

    if (!email.trim()) {
      formErrors.email = "Este campo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email inválido";
    }

    if (!password) {
      formErrors.password = "Este campo es obligatorio";
    } else if (!passwordRequirements.every((req) => req.regex.test(password))) {
      formErrors.password = "La contraseña no cumple con todos los requisitos";
    }

    if (password !== confirmPassword) {
      formErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!role) {
      formErrors.role = "Por favor seleccione un rol";
    }

    return formErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm());
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({
        name: true,
        lastName: true,
        email: true,
        password: true,
        confirmPassword: true,
        role: true,
      });
      return;
    }

    try {
      const response = await postData("/register", {
        name,
        last_name: lastName,
        email,
        password,
        role,
      });

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
        setErrors({ api: "Hubo un error en el registro" });
      }
    }
  };

  const getInputClassName = (field) => {
    let baseClass =
      "w-full px-4 py-2 bg-purple-100 text-purple-900 rounded-lg focus:outline-none focus:ring-2 placeholder-purple-500 transition-colors duration-200";
    if (touched[field] && errors[field]) {
      return `${baseClass} border-2 border-red-500 focus:ring-red-400`;
    }
    return `${baseClass} focus:ring-purple-400`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-950 to-stone-950 animate-gradient-x p-4 overflow-auto relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0"
      />
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          <span>Registro exitoso. Redirigiendo...</span>
        </div>
      )}
      <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">TrackMaster</h1>
          <p className="text-lg mb-6">
            ¡Bienvenido!
            <br />
            Ingrese ahora mismo a su cuenta
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-transparent border border-white text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-white hover:text-black"
          >
            ENTRAR
          </button>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-6 text-center underline hover:text-purple-200 transition duration-300 ease-in-out"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 rounded-r-lg overflow-y-auto max-h-[80vh] md:max-h-none">
          <h2 className="text-center text-3xl font-semibold text-purple-900 mb-4">
            Crea tu cuenta
          </h2>
          <p className="text-center text-purple-700 mb-6">
            Rellena el formulario
          </p>

          <form className="space-y-4" onSubmit={handleRegisterClick} noValidate>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombres"
                  className={getInputClassName("name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  maxLength={15}
                  required
                />
                {touched.name && errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.name && errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Apellidos"
                  className={getInputClassName("lastName")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  maxLength={15}
                  required
                />
                {touched.lastName && errors.lastName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.lastName && errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className={getInputClassName("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                />
                {touched.email && errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className={getInputClassName("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => {
                    handleBlur("password");
                    setShowPasswordRequirements(false);
                  }}
                  maxLength={10}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {touched.password && errors.password && (
                  <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {showPasswordRequirements && (
                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.regex.test(password) ? (
                        <Check className="text-green-500" size={16} />
                      ) : (
                        <AlertCircle className="text-red-500" size={16} />
                      )}
                      <span
                        className={
                          req.regex.test(password)
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  className={getInputClassName("confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  maxLength={10}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}

              <select
                className={getInputClassName("role")}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => handleBlur("role")}
                required
              >
                <option value="">Seleccione su rol</option>
                <option value="student">Estudiante</option>
                <option value="teacher">Docente</option>
              </select>
              {touched.role && errors.role && (
                <p className="text-red-500 text-sm">{errors.role}</p>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out"
              >
                REGISTRAR
              </button>
            </div>
            {errors.api && (
              <p className="text-red-500 text-center mt-4">{errors.api}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
