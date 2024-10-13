import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Bell, Menu, Home, User, Users, Building2, LogOut, ChevronRight } from 'lucide-react';
import { getData, postData } from '../api/apiService';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import AuthContext from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, setCurrentView }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState('inicio');
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
    setActiveView(view);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const UserSkeleton = () => (
    <div className="mb-8">
      <Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-full mx-auto mb-4" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  );

  const getAvatarUrl = (name, lastName) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name + ' ' + lastName)}&backgroundColor=F3E8FF&textColor=6B21A8`;
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  const menuItems = [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: User, label: 'Perfil', view: 'perfil' },
    { icon: Users, label: 'Grupo', view: 'grupo' },
    { icon: Building2, label: 'FundEmpresa', view: 'empresas' },
  ];

  return (
    <div className="flex h-screen bg-purple-50">
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={isMobile ? "closed" : "open"}
        animate={isSidebarOpen || !isMobile ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`w-full max-w-[280px] lg:w-64 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white p-6 fixed inset-y-0 left-0 z-30 lg:relative overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            TRACKMASTER
          </motion.h1>
          {isMobile && (
            <motion.button
              onClick={toggleSidebar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-purple-200 hover:text-white transition-colors"
            >
              <ChevronRight size={24} />
            </motion.button>
          )}
        </div>
        {isLoading ? (
          <UserSkeleton />
        ) : user && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 p-1 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Avatar className="w-full h-full border-4 border-white rounded-full">
                <AvatarImage src={user.profilePicture || getAvatarUrl(user.name, user.last_name)} alt={`${user.name} ${user.last_name}`} />
                <AvatarFallback className="bg-purple-200 text-purple-800 text-2xl font-bold">
                  {user.name.charAt(0)}{user.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <motion.p
              className="text-center font-semibold text-xl text-purple-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {user.name} {user.last_name}
            </motion.p>
            <motion.p
              className="text-center text-sm text-purple-300 mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {user.role}
            </motion.p>
          </motion.div>
        )}
        <nav className="space-y-2">
          {menuItems.map(({ icon: Icon, label, view }, index) => (
            <motion.button
              key={view}
              onClick={() => handleMenuItemClick(view)}
              className={`flex items-center py-3 px-4 rounded-lg w-full text-left transition-colors duration-200 ${
                activeView === view
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-200 hover:bg-purple-700/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </motion.button>
          ))}
          <motion.button
            onClick={() => {
              handleLogout();
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="flex items-center py-3 px-4 rounded-lg w-full text-left transition-colors duration-200 text-purple-200 hover:bg-purple-700/50 mt-8"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          >
            <LogOut className="mr-3 h-5 w-5" /> Cerrar Sesión
          </motion.button>
        </nav>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <motion.button
            className="lg:hidden text-purple-800 hover:text-purple-600 transition-colors"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>
          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-bold text-center flex-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Taller De Ingeniería en Software
          </motion.h2>
          <motion.button
            className="text-purple-800 hover:text-purple-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="h-6 w-6" />
          </motion.button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}