import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationPopupProps {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info';
  onClose: (id: string) => void;
  link?: string;
}

const typeIcons = {
  alert: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const typeColors = {
  alert: 'border-destructive/50 bg-destructive/10',
  warning: 'border-warning/50 bg-warning/10',
  info: 'border-primary/50 bg-primary/10',
};

const iconColors = {
  alert: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
};

export function NotificationPopup({ id, title, message, type, onClose, link }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();
  const Icon = typeIcons[type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const handleClick = () => {
    if (link) {
      navigate(link);
      handleClose();
    }
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300',
        typeColors[type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        link && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={link ? handleClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', iconColors[type])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-foreground">{title}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="flex-shrink-0 p-1 rounded-md hover:bg-background/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message}</p>
          {link && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <span>Click to view details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  children: React.ReactNode;
}

export function NotificationContainer({ children }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
