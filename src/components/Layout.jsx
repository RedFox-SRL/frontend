import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Bell, Menu, Home, User, Users, Building2, LogOut } from 'lucide-react';
import { getData, postData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import AuthContext from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children, setCurrentView }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useContext(AuthContext);
  const { user, setUser } = useUser();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  const handleMenuItemClick = (view) => {
    setCurrentView(view);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const UserSkeleton = () => (
    <div className="mb-8">
      <Skeleton className="w-20 h-20 rounded-full mx-auto mb-2" />
      <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  );

  const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
  };

  return (
    <div className="flex h-screen bg-purple-100">
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside
        className={`w-64 bg-purple-800 text-white p-6 fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}
      >
        <h1 className="text-2xl font-bold mb-10">TRACKMASTER</h1>
        {isLoading ? (
          <UserSkeleton />
        ) : user && (
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg">
              <Avatar className="w-full h-full border-2 border-white rounded-full">
                <AvatarImage src={user.profilePicture || getAvatarUrl(user.name, user.last_name)} alt={`${user.name} ${user.last_name}`} />
                <AvatarFallback className="bg-purple-200 text-purple-800 text-xl font-bold">
                  {user.name.charAt(0)}{user.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-center font-semibold text-lg">{user.name} {user.last_name}</p>
            <p className="text-center text-sm text-purple-300">{user.role}</p>
          </div>
        )}
        <nav className="space-y-2">
          <button
            onClick={() => handleMenuItemClick('inicio')}
            className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left transition duration-150 ease-in-out"
          >
            <Home className="mr-2 h-5 w-5" /> Inicio
          </button>
          <button
            onClick={() => handleMenuItemClick('perfil')}
            className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left transition duration-150 ease-in-out"
          >
            <User className="mr-2 h-5 w-5" /> Perfil
          </button>
          <button
            onClick={() => handleMenuItemClick('grupo')}
            className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left transition duration-150 ease-in-out"
          >
            <Users className="mr-2 h-5 w-5" /> Grupo
          </button>
          <button
            onClick={() => handleMenuItemClick('empresas')}
            className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left transition duration-150 ease-in-out"
          >
            <Building2 className="mr-2 h-5 w-5" /> FundEmpresa
          </button>
          <button
            onClick={() => {
              handleLogout();
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left transition duration-150 ease-in-out"
          >
            <LogOut className="mr-2 h-5 w-5" /> Cerrar Sesión
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu className="text-purple-800" />
          </button>
          <h2 className="text-xl font-bold text-purple-800">Taller De Ingeniería en Software</h2>
          <Bell className="text-purple-800" />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}