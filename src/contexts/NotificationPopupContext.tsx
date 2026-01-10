/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { NotificationPopup, NotificationContainer } from '@/components/NotificationPopup';

interface PopupNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info';
  link?: string;
}

interface NotificationPopupContextType {
  showNotification: (notification: Omit<PopupNotification, 'id'>) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

const NotificationPopupContext = createContext<NotificationPopupContextType | undefined>(undefined);

export function NotificationPopupProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<PopupNotification[]>([]);

  const showNotification = useCallback((notification: Omit<PopupNotification, 'id'>) => {
    const id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPopup: PopupNotification = { ...notification, id };

    setPopups(prev => [...prev, newPopup]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 5000);

    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setPopups([]);
  }, []);

  return (
    <NotificationPopupContext.Provider value={{ showNotification, dismissNotification, dismissAll }}>
      {children}
      <NotificationContainer>
        {popups.map(popup => (
          <NotificationPopup
            key={popup.id}
            id={popup.id}
            title={popup.title}
            message={popup.message}
            type={popup.type}
            link={popup.link}
            onClose={dismissNotification}
          />
        ))}
      </NotificationContainer>
    </NotificationPopupContext.Provider>
  );
}

export function useNotificationPopup() {
  const context = useContext(NotificationPopupContext);
  if (context === undefined) {
    throw new Error('useNotificationPopup must be used within a NotificationPopupProvider');
  }
  return context;
}
