import React, { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { getData } from '../api/apiService';

export default function Layout({ children, setCurrentView }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getData('/me');
        setUser(response.data.item);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex h-screen bg-purple-100">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>

      <aside className={`w-64 bg-purple-800 text-white p-6 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <h1 className="text-2xl font-bold mb-10">TRACKMASTER</h1>
        {user && (
          <div className="mb-8">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-2"></div>
            <p className="text-center">{user.name} {user.last_name}</p>
            <p className="text-center text-sm text-purple-300">{user.role}</p>
          </div>
        )}
        <nav className="space-y-2">
          <button onClick={() => setCurrentView('inicio')} className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left">
            <span className="mr-2">🏠</span> Inicio
          </button>
          <button onClick={() => setCurrentView('grupos')} className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left">
            <span className="mr-2">👥</span> Grupos
          </button>
          <button onClick={() => setCurrentView('ajustes')} className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left">
            <span className="mr-2">⚙️</span> Ajustes
          </button>
          <button onClick={() => {}} className="flex items-center py-2 px-4 hover:bg-purple-700 rounded w-full text-left">
            <span className="mr-2">🚪</span> Cerrar Sesión
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
      </div>
    </div>
  );
}