import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NotificationItem = React.memo(({ notification, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.2 }}
    className="mb-2 last:mb-0 p-3 bg-white rounded-lg shadow-sm relative group"
  >
    <p className="text-sm text-gray-800 font-medium pr-6">
      {notification.message}
    </p>
    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
    <button
      onClick={() => onDelete(notification.id)}
      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
    >
      <X size={16} />
    </button>
  </motion.div>
));

const NotificationList = React.memo(({ notifications, onDelete }) => (
  <div className="p-4 max-h-[60vh] overflow-y-auto">
    <AnimatePresence initial={false}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDelete={onDelete}
        />
      ))}
    </AnimatePresence>
    {notifications.length === 0 && (
      <p className="text-gray-600 text-center py-4">
        No tienes notificaciones nuevas.
      </p>
    )}
  </div>
));

export default function NotificationButton() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nueva tarea asignada", time: "5 min ago" },
    { id: 2, message: "Reunión programada para mañana", time: "1 hora ago" },
    { id: 3, message: "Proyecto actualizado", time: "2 horas ago" },
    { id: 4, message: "Comentario nuevo en tu tarea", time: "3 horas ago" },
    { id: 5, message: "Recordatorio: Entrega pendiente", time: "4 horas ago" },
    { id: 6, message: "Nueva actualización del sistema", time: "5 horas ago" },
  ]);

  const notificationDrawerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDrawerRef.current &&
        !notificationDrawerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen((prevState) => !prevState);
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id),
    );
  }, []);

  return (
    <div className="relative z-50">
      <motion.button
        ref={buttonRef}
        className="text-purple-800 hover:text-purple-600 transition-colors relative"
        onClick={toggleNotifications}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && !isNotificationsOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            ref={notificationDrawerRef}
            initial={
              isMobile ? { opacity: 0, y: -20 } : { opacity: 0, scale: 0.95 }
            }
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
            exit={
              isMobile ? { opacity: 0, y: -20 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.2 }}
            className={`
              ${isMobile ? "fixed inset-x-0 top-16 px-4" : "absolute right-0 w-80 max-w-sm"}
              z-50
            `}
            style={!isMobile ? { top: "calc(100% + 0.5rem)" } : {}}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">
                  Notificaciones
                </h3>
              </div>
              <div className="bg-gray-50">
                <NotificationList
                  notifications={notifications}
                  onDelete={deleteNotification}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
