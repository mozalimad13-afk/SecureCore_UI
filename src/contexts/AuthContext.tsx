import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const initialNotifications: Notification[] = [
  { id: '1', title: 'Critical Alert', message: 'Potential intrusion detected from 192.168.1.105', time: '2 min ago', read: false, type: 'alert' },
  { id: '2', title: 'Weekly Report Ready', message: 'Your weekly security report is now available', time: '1 hour ago', read: false, type: 'info' },
  { id: '3', title: 'New Login Detected', message: 'Login from a new device in San Francisco', time: '3 hours ago', read: false, type: 'warning' },
  { id: '4', title: 'System Update', message: 'Scheduled maintenance tonight at 2 AM', time: '5 hours ago', read: true, type: 'info' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') as 'user' | 'admin' | null;
    const storedEmail = localStorage.getItem('userEmail') || '';
    const storedName = localStorage.getItem('userName') || 'User';
    
    if (isAuth && role) {
      setUser({ email: storedEmail, name: storedName, role });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role: 'user' | 'admin' }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'admin@securecore.com' && password === 'admin123') {
          const userData = { email, name: 'Administrator', role: 'admin' as const };
          setUser(userData);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userName', 'Administrator');
          resolve({ success: true, role: 'admin' });
        } else if (email && password) {
          const userData = { email, name: email.split('@')[0], role: 'user' as const };
          setUser(userData);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userName', email.split('@')[0]);
          resolve({ success: true, role: 'user' });
        } else {
          resolve({ success: false, role: 'user' });
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
