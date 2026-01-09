import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, notificationsAPI } from '../services/api';

interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'warning';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: 'user' | 'admin' }>;
  logout: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
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
        setUser(userData as User);
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
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; role: 'user' | 'admin' }> => {
    try {
      await authAPI.login(email, password);
      const userData = await authAPI.getCurrentUser();
      setUser(userData as User);
      return { success: true, role: userData.role as 'user' | 'admin' };
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

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
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
      addNotification,
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
