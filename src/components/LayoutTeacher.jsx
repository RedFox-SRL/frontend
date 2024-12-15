import React, {useCallback, useContext, useEffect, useState} from "react";
import {Building2, ChevronDown, History, Home, LogOut, Menu, User} from 'lucide-react';
import {getData, postData} from "../api/apiService";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import AuthContext from "../context/AuthContext";
import {useUser} from "../context/UserContext";
import Perfil from "./Perfil";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
        name + " " + lastName
    )}&backgroundColor=F0E7FF&textColor=5B21B6`;
};

const menuItems = [
    {icon: Home, label: "Inicio", view: "inicio"},
    {icon: History, label: "Semestres pasados", view: "gestiones"},
    {icon: Building2, label: "FundEmpresa", view: "empresas"},
];

export default function LayoutTeacher({children, setCurrentView}) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState("inicio");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {logout} = useContext(AuthContext);
    const {user, setUser} = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMenuOpen(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            setIsMenuOpen(false);
        },
        [setCurrentView]
    );

    const handleProfileClick = () => {
        setIsProfileOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-purple-900 text-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                <DropdownMenuTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-6 w-6"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Navegación</DropdownMenuLabel>
                                    {menuItems.map(({icon: Icon, label, view}) => (
                                        <DropdownMenuItem
                                            key={view}
                                            onClick={() => handleMenuItemClick(view)}
                                            className={activeView === view ? "bg-purple-100" : ""}
                                        >
                                            <Icon className="mr-2 h-4 w-4"/>
                                            <span>{label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <h1 className="text-xl font-bold">TrackMaster</h1>
                        </div>

                        <nav className="hidden md:flex space-x-1">
                            {menuItems.map(({icon: Icon, label, view}) => (
                                <Button
                                    key={view}
                                    variant="ghost"
                                    onClick={() => handleMenuItemClick(view)}
                                    className={`
                    flex items-center px-3 py-2 text-sm font-medium
                    ${activeView === view
                                        ? "bg-purple-800 text-white"
                                        : "text-purple-200 hover:bg-purple-800 hover:text-white"
                                    }
                  `}
                                >
                                    <Icon className="mr-2 h-5 w-5"/>
                                    {label}
                                </Button>
                            ))}
                        </nav>

                        {isLoading ? (
                            <div className="flex items-center">
                                <Skeleton className="w-8 h-8 rounded-full"/>
                                <Skeleton className="h-4 w-20 ml-2"/>
                            </div>
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center">
                                        <Avatar className="w-8 h-8 mr-2">
                                            <AvatarImage
                                                src={user.profilePicture || getAvatarUrl(user.name, user.last_name)}
                                                alt={`${user.name} ${user.last_name}`}
                                            />
                                            <AvatarFallback className="bg-purple-200 text-purple-900 text-sm font-bold">
                                                {user.name.charAt(0)}
                                                {user.last_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="mr-1 hidden sm:inline">{user.name}</span>
                                        <ChevronDown className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleProfileClick}>
                                        <User className="mr-2 h-4 w-4"/>
                                        <span>Editar perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        <span>Cerrar sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </main>

            <Perfil isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}/>
        </div>
    );
}