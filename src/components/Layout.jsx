import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Menu, Home, User, Users, Building2, LogOut, ChevronRight} from 'lucide-react';
import {getData, postData} from '../api/apiService';
import {Avatar, AvatarImage, AvatarFallback} from '../components/ui/avatar';
import {Skeleton} from '../components/ui/skeleton';
import AuthContext from '../context/AuthContext';
import {useUser} from '../context/UserContext';
import {motion, AnimatePresence} from "framer-motion";
import NotificationButton from './NotificationButton';

export default function Layout({children, setCurrentView}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [activeView, setActiveView] = useState('inicio');
    const {logout} = useContext(AuthContext);
    const {user, setUser} = useUser();

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const handleResize = useCallback(() => {
        setIsMobile(window.innerWidth < 1024);
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const response = await getData('/me');
                setUser(response.data.item);
            } catch (error) {
                console.error('Error fetching user data:', error);
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

    const handleLogout = async () => {
        try {
            await postData('/logout');
        } catch (error) {
            console.error('Error en la solicitud de logout:', error);
        } finally {
            logout();
        }
    };

    const handleMenuItemClick = useCallback((view) => {
        setCurrentView(view);
        setActiveView(view);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [setCurrentView, isMobile]);

    const UserSkeleton = () => (
        <div className="mb-8">
            <Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-full mx-auto mb-4"/>
            <Skeleton className="h-6 w-3/4 mx-auto mb-2"/>
            <Skeleton className="h-4 w-1/2 mx-auto"/>
        </div>
    );

    const getAvatarUrl = (name, lastName) => {
        return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
    };

    const menuItems = [
        {icon: Home, label: 'Inicio', view: 'inicio'},
        {icon: User, label: 'Perfil', view: 'perfil'},
        {icon: Users, label: 'Grupo', view: 'grupo'},
        {icon: Building2, label: 'FundEmpresa', view: 'empresas'},
    ];

    return (
        <div className="flex h-screen bg-purple-50">
            <AnimatePresence>
                {(isSidebarOpen || !isMobile) && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.2}}
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={isMobile ? {x: "-100%"} : {x: 0}}
                animate={isSidebarOpen || !isMobile ? {x: 0} : {x: "-100%"}}
                transition={{duration: 0.3, ease: [0.25, 0.1, 0.25, 1]}}
                className={`w-full max-w-[280px] lg:w-64 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white p-6 fixed inset-y-0 left-0 z-30 lg:relative overflow-y-auto`}
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-300">
                        TRACKMASTER
                    </h1>
                    {isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="text-purple-200 hover:text-white transition-colors"
                        >
                            <ChevronRight size={24}/>
                        </button>
                    )}
                </div>
                {isLoading ? (
                    <UserSkeleton/>
                ) : user && (
                    <div className="mb-8">
                        <div
                            className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg">
                            <Avatar className="w-full h-full border-4 border-white rounded-full">
                                <AvatarImage src={user.profilePicture || getAvatarUrl(user.name, user.last_name)}
                                             alt={`${user.name} ${user.last_name}`}/>
                                <AvatarFallback className="bg-purple-200 text-purple-800 text-2xl font-bold">
                                    {user.name.charAt(0)}{user.last_name.charAt(0)}
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
                )}
                <nav className="space-y-2">
                    {menuItems.map(({icon: Icon, label, view}) => (
                        <button
                            key={view}
                            onClick={() => handleMenuItemClick(view)}
                            className={`flex items-center py-3 px-4 rounded-lg w-full text-left transition-colors duration-200 ${
                                activeView === view
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-purple-200 hover:bg-purple-700/50'
                            }`}
                        >
                            <Icon className="mr-3 h-5 w-5"/>
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
                        <LogOut className="mr-3 h-5 w-5"/> Cerrar Sesión
                    </button>
                </nav>
            </motion.aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <button
                        className="lg:hidden text-purple-800 hover:text-purple-600 transition-colors"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-6 w-6"/>
                    </button>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center flex-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                        Taller De Ingeniería en Software
                    </h2>
                    <NotificationButton isMobile={isMobile}/>
                </header>
                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    {children}
                </main>
            </div>
        </div>
    );
}