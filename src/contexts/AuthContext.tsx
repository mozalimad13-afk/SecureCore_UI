/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, notificationsAPI } from '../services/api';
import { User, Notification } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: 'user' | 'admin' }>;
  logout: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user as User);
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    loadUser();
  }, []);

  // Load notifications when user is authenticated
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const data = await notificationsAPI.getNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; role: 'user' | 'admin' }> => {
    try {
      const userData = await authAPI.login(email, password);
      setUser(userData.user as User);
      return { success: true, role: userData.user.role as 'user' | 'admin' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, role: 'user' };
    }
  };

  const logout = () => {
    authAPI.logout().catch(console.error);
    setUser(null);
    setNotifications([]);
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationsAPI.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  const updateProfile = async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.user) {
        setUser(response.user as User);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };


  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearAll,
      addNotification,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
