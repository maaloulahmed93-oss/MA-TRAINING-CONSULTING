import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { getNotifications, markAllRead, AdminNotification } from '../../data/adminNotifications';

/**
 * Header Component
 * Top navigation bar with user menu and notifications
 */
interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(getNotifications());
  const [unreadCount, setUnreadCount] = useState<number>(notifications.filter(n => !n.isRead).length);

  // Poll notifications store periodically to keep header in sync
  useEffect(() => {
    const interval = setInterval(() => {
      const list = getNotifications();
      setNotifications([...list]);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Page title will be added here by individual pages */}
          <div className="lg:ml-0 ml-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Panneau d'Administration
            </h1>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                const newOpen = !notifMenuOpen;
                setNotifMenuOpen(newOpen);
                if (newOpen && unreadCount > 0) {
                  markAllRead();
                  const list = getNotifications();
                  setNotifications([...list]);
                  setUnreadCount(0);
                }
              }}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
            >
              <BellIcon className="h-6 w-6" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Notifications</p>
                    <button
                      onClick={() => {
                        markAllRead();
                        const list = getNotifications();
                        setNotifications([...list]);
                        setUnreadCount(0);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">Aucune notification</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <a
                        key={n.id}
                        href={n.actionUrl || '#'}
                        className={`block px-4 py-3 hover:bg-gray-50 ${n.isRead ? 'opacity-80' : ''}`}
                        onClick={() => setNotifMenuOpen(false)}
                      >
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.date).toLocaleString()}</p>
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {(userMenuOpen || notifMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setUserMenuOpen(false); setNotifMenuOpen(false); }}
        />
      )}
    </header>
  );
};

export default Header;
