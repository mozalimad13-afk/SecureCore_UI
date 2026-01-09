import { useState, useCallback } from 'react';

interface PopupNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info';
  link?: string;
}

export function useNotificationPopup() {
  const [popups, setPopups] = useState<PopupNotification[]>([]);

  const showNotification = useCallback((notification: Omit<PopupNotification, 'id'>) => {
    const id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPopup: PopupNotification = { ...notification, id };
    
    setPopups(prev => [...prev, newPopup]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);

    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setPopups([]);
  }, []);

  return {
    popups,
    showNotification,
    dismissNotification,
    dismissAll,
  };
}
