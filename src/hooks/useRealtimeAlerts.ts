import { useEffect, useRef } from 'react';
import { useNotificationPopup } from '@/contexts/NotificationPopupContext';
import { useAuth } from '@/contexts/AuthContext';

type AlertCreatedPayload = {
  id?: number | string;
  attack_type?: string;
  severity?: string;
  confidence?: number;
  source_ip?: string;
  destination_ip?: string;
  created_at?: string;
};

type NotificationCreatedPayload = {
  id?: number | string;
  title?: string;
  message?: string;
  type?: 'alert' | 'warning' | 'info' | string;
  created_at?: string;
  is_read?: boolean;
};

export function useRealtimeAlerts() {
  const { showNotification } = useNotificationPopup();
  const { isAuthenticated, addNotification } = useAuth();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    // Only connect realtime when logged in.
    if (!isAuthenticated) {
      try {
        socketRef.current?.removeAllListeners?.();
        socketRef.current?.disconnect?.();
      } catch {
        // ignore
      }
      socketRef.current = null;
      return () => {
        active = false;
      };
    }

    // Already connected/connecting.
    if (socketRef.current) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const { io } = await import('socket.io-client');

        // UI realtime channel (JWT cookie auth)
        // Prefer polling in dev to avoid flaky WebSocket upgrades.
        socketRef.current = io('http://localhost:5000/ws/ui', {
          transports: ['polling'],
          autoConnect: false,
          reconnection: false,
          withCredentials: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
          // eslint-disable-next-line no-console
          console.log('[ws/ui] connected', socket.id);
        });

        socket.on('alert_created', (payload: AlertCreatedPayload) => {
          if (!active) return;
          showNotification({
            title: `${(payload.severity ?? 'alert').toString().toUpperCase()} Alert`,
            message: `${payload.attack_type ?? 'Attack'} detected`,
            type: 'alert',
            link: payload.id ? `/dashboard/alerts/${payload.id}` : '/dashboard',
          });
        });

        socket.on('notification_created', (payload: NotificationCreatedPayload) => {
          if (!active) return;
          // eslint-disable-next-line no-console
          console.log('[ws/ui] notification_created', payload);
          // Keep dropdown + notifications page in sync immediately.
          addNotification({
            title: payload.title ?? 'Notification',
            message: payload.message ?? 'New notification',
            type: ((payload.type as any) ?? 'info') as any,
            time: 'Just now',
          });
          showNotification({
            title: payload.title ?? 'Notification',
            message: payload.message ?? 'New notification',
            type: (payload.type as any) ?? 'info',
            link: '/dashboard',
          });
        });

        socket.on('connect_error', (err: any) => {
          // eslint-disable-next-line no-console
          // Avoid noisy console spam in dev; only log when authenticated.
          if (isAuthenticated) {
            console.log('[ws/ui] connect_error', err?.message ?? err);
          }
        });

        // Connect after listeners are registered.
        socket.connect();
      } catch {
        // Missing dependency or blocked connection; ignore.
      }
    })();

    return () => {
      active = false;
      try {
        socketRef.current?.removeAllListeners?.();
        socketRef.current?.disconnect?.();
      } catch {
        // ignore
      }
      socketRef.current = null;
    };
  }, [showNotification, isAuthenticated, addNotification]);
}
