import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, AlertCircle, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const typeIcons = {
  alert: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const typeColors = {
  alert: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
};

const typeBgColors = {
  alert: 'bg-destructive/10',
  warning: 'bg-warning/10',
  info: 'bg-primary/10',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notifications</h2>
          <p className="text-muted-foreground">
            View and manage all your notifications. {unreadCount > 0 && `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            All Notifications ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm">You'll see security alerts and updates here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border border-border transition-colors',
                      !notification.read && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', typeBgColors[notification.type])}>
                      <Icon className={cn('w-5 h-5', typeColors[notification.type])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={cn('font-medium', !notification.read && 'text-foreground')}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
