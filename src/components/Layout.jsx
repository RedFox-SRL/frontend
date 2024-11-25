import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Building2,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  User,
  Users,
} from "lucide-react";
import { getData, postData } from "../api/apiService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import AuthContext from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import NotificationButton from "./NotificationButton";
import StarWarsIntro from "./starwars";
import EvaluationModal from "./EvaluationModal"; // Importa el modal
import EvaluationForm from "./EvaluationForm"; // Importa el formulario

const useTypingAnimation = (text, speed = 100) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    } else {
      setIsTypingComplete(true);
    }
  }, [displayedText, text, speed]);

  return { displayedText, isTypingComplete };
};

const MatrixRain = ({ onComplete }) => {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "9999";
    canvas.style.pointerEvents = "none";

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const colors = ["#8A2BE2", "#9370DB"];

    let frameCount = 0;
    const maxFrames = 300;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frameCount++;
      if (frameCount < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        document.body.removeChild(canvas);
        onComplete();
      }
    };

    requestAnimationFrame(draw);

    return () => {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [onComplete]);

  return null;
};

export default function Layout({ children, setCurrentView }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState("inicio");
  const { logout } = useContext(AuthContext);
  const { user, setUser } = useUser();
  const [clickCount, setClickCount] = useState(0);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const [showStarWarsIntro, setShowStarWarsIntro] = useState(false);
  const konamiCode = useRef([]);
  const konamiSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  const [view, setView] = useState("evaluations");
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  const { displayedText, isTypingComplete } = useTypingAnimation(
      "Taller De Ingeniería en Software",
      100
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await getData("/me");
        setUser(response.data.item);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [setUser, user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      konamiCode.current = [...konamiCode.current, event.key];
      konamiCode.current = konamiCode.current.slice(-10);

      if (
          JSON.stringify(konamiCode.current) === JSON.stringify(konamiSequence)
      ) {
        setShowStarWarsIntro(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await postData("/logout");
    } catch (error) {
      console.error("Error en la solicitud de logout:", error);
    } finally {
      logout();
    }
  };

  const handleMenuItemClick = useCallback(
      (view) => {
        setCurrentView(view);
        setActiveView(view);
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      },
      [setCurrentView, isMobile]
  );

  const handleTitleClick = () => {
    setClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 5) {
        setShowMatrixRain(true);
        return 0; // Reset click count
      }
      return newCount;
    });

    const titleElement = document.querySelector(".title-text");
    if (titleElement) {
      titleElement.classList.add("animate-title");
      setTimeout(() => titleElement.classList.remove("animate-title"), 500);
    }
  };

  const handleMatrixRainComplete = () => {
    setShowMatrixRain(false);
  };

  const UserSkeleton = () => (
      <div className="mb-8">
        <Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
  );

  const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
        name + " " + lastName
    )}&backgroundColor=F3E8FF&textColor=6B21A8`;
  };

  const menuItems = [
    { icon: Home, label: "Inicio", view: "inicio" },
    { icon: User, label: "Perfil", view: "perfil" },
    { icon: Users, label: "Grupo", view: "grupo" },
    { icon: Building2, label: "FundEmpresa", view: "empresas" },
  ];

  const handleEvaluationSelect = (evaluation) => {
    setCurrentEvaluation(evaluation);
    setView("form");
  };

  return (
      <div className="flex h-screen bg-purple-50">
        {showMatrixRain && <MatrixRain onComplete={handleMatrixRainComplete} />}
        {showStarWarsIntro && (
            <StarWarsIntro onClose={() => setShowStarWarsIntro(false)} />
        )}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={toggleSidebar}
              />
          )}
        </AnimatePresence>

        <motion.aside
            initial={isMobile ? { x: "-100%" } : { x: 0 }}
            animate={isSidebarOpen || !isMobile ? { x: 0 } : { x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[280px] lg:w-64 bg-gradient-to-br from-fuchsia-950 via-purple-900 to-fuchsia-950 text-white p-6 fixed inset-y-0 left-0 z-50 lg:relative overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-purple-300">
              TRACKMASTER
            </h1>
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    className="text-purple-200 hover:text-white transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
            )}
          </div>
          {isLoading ? (
              <UserSkeleton />
          ) : (
              user && (
                  <div className="mb-8">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg">
                      <Avatar className="w-full h-full border-4 border-white rounded-full">
                        <AvatarImage
                            src={
                                user.profilePicture ||
                                getAvatarUrl(user.name, user.last_name)
                            }
                            alt={`${user.name} ${user.last_name}`}
                        />
                        <AvatarFallback className="bg-purple-200 text-purple-800 text-2xl font-bold">
                          {user.name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-center font-semibold text-xl text-purple-100">
                      {user.name} {user.last_name}
                    </p>
                    <p className="text-center text-sm text-purple-300 mt-1">
                      {user.role}
                    </p>
                  </div>
              )
          )}
          <nav className="space-y-2">
            {menuItems.map(({ icon: Icon, label, view }) => (
                <button
                    key={view}
                    onClick={() => handleMenuItemClick(view)}
                    className={`flex items-center py-3 px-4 rounded-lg w-full text-left transition-colors duration-200 ${
                        activeView === view
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-purple-200 hover:bg-purple-700/50"
                    }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </button>
            ))}
            <button
                onClick={() => {
                  handleLogout();
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="flex items-center py-3 px-4 rounded-lg w-full text-left transition-colors duration-200 text-purple-200 hover:bg-purple-700/50 mt-8"
            >
              <LogOut className="mr-3 h-5 w-5" /> Cerrar Sesión
            </button>
          </nav>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-md p-4 flex justify-between items-center relative z-30">
            <button
                className="lg:hidden text-purple-800 hover:text-purple-600 transition-colors"
                onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2
                className="text-lg sm:text-xl md:text-2xl font-bold text-center flex-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 cursor-pointer select-none title-text"
                onClick={handleTitleClick}
            >
              {displayedText}
              {!isTypingComplete && <span className="animate-blink">|</span>}
            </h2>
            <div
                className={`${
                    isMobile && isSidebarOpen ? "pointer-events-none opacity-50" : ""
                } transition-opacity duration-300`}
            >
              <NotificationButton isMobile={isMobile} />
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            {view === "evaluations" && (
                <EvaluationModal onEvaluationSelect={handleEvaluationSelect} />
            )}
            {view === "form" && currentEvaluation ? (
                <EvaluationForm
                    evaluationData={currentEvaluation}
                    onBack={() => setView("evaluations")}
                />
            ) : (
                view !== "form" && children
            )}
          </main>
        </div>
        <style jsx global>{`
          @keyframes titlePop {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }

          .animate-title {
            animation: titlePop 0.5s ease-in-out;
          }
        `}</style>
      </div>
  );
}
