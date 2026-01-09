import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, User, Clock, CheckCircle, Search, X, AlertTriangle, Info, AlertCircle, Activity, UserPlus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const allUsers = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@dataflow.io', company: 'DataFlow' },
  { id: '3', name: 'Mike Chen', email: 'mike@securenet.com', company: 'SecureNet' },
  { id: '4', name: 'Emily Davis', email: 'emily@cloudguard.co', company: 'CloudGuard' },
  { id: '5', name: 'Alex Wilson', email: 'alex@startup.io', company: 'StartupIO' },
  { id: '6', name: 'Lisa Brown', email: 'lisa@enterprise.com', company: 'Enterprise Inc' },
  { id: '7', name: 'Tom Anderson', email: 'tom@security.net', company: 'SecurityNet' },
  { id: '8', name: 'Jane Miller', email: 'jane@protect.io', company: 'Protect.io' },
  { id: '9', name: 'David Lee', email: 'david@cyberguard.com', company: 'CyberGuard' },
  { id: '10', name: 'Anna White', email: 'anna@safezone.io', company: 'SafeZone' },
];

const sentNotifications = [
  { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance tonight', target: 'All Users', sentAt: '2024-01-15 10:30', status: 'delivered' },
  { id: 2, title: 'New Feature Release', message: 'Check out our new reporting dashboard', target: 'All Users', sentAt: '2024-01-14 14:00', status: 'delivered' },
  { id: 3, title: 'Security Alert', message: 'Important security update required', target: 'TechCorp', sentAt: '2024-01-13 09:15', status: 'delivered' },
];

// Admin System Notifications (notifications received by admin)
interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: 'user' | 'system' | 'security' | 'alert';
  read: boolean;
  time: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const ITEMS_PER_PAGE = 10;

const adminSystemNotifications: AdminNotification[] = [
  { id: 1, title: 'New User Registration', message: 'John Doe (john@example.com) registered for Enterprise plan', type: 'user', read: false, time: '5 minutes ago', priority: 'low' },
  { id: 2, title: 'System Health Warning', message: 'CPU usage exceeded 85% threshold', type: 'system', read: false, time: '15 minutes ago', priority: 'high' },
  { id: 3, title: 'Security Alert', message: 'Multiple failed login attempts detected from IP 192.168.1.1', type: 'security', read: false, time: '1 hour ago', priority: 'critical' },
  { id: 4, title: 'New User Registration', message: 'Sarah Johnson (sarah@techcorp.com) registered for Small Companies plan', type: 'user', read: true, time: '2 hours ago', priority: 'low' },
  { id: 5, title: 'Database Performance', message: 'Database response time increased by 45%', type: 'system', read: false, time: '3 hours ago', priority: 'medium' },
  { id: 6, title: 'Critical System Error', message: 'Payment gateway connection failed', type: 'alert', read: false, time: '5 hours ago', priority: 'critical' },
  { id: 7, title: 'New User Registration', message: 'Mike Chen (mike@startup.io) registered for Free Trial', type: 'user', read: true, time: '6 hours ago', priority: 'low' },
  { id: 8, title: 'System Update', message: 'Security patches applied successfully', type: 'system', read: true, time: '1 day ago', priority: 'low' },
  { id: 9, title: 'Suspicious Activity', message: 'Unusual API usage pattern detected', type: 'security', read: true, time: '1 day ago', priority: 'high' },
  { id: 10, title: 'New User Registration', message: 'Emily Davis (emily@cloudguard.co) registered for Enterprise plan', type: 'user', read: true, time: '2 days ago', priority: 'low' },
  { id: 11, title: 'Server Memory Alert', message: 'Memory usage reached 90% capacity', type: 'alert', read: true, time: '2 days ago', priority: 'high' },
  { id: 12, title: 'New User Registration', message: 'Alex Wilson (alex@secureops.io) registered for Small Companies plan', type: 'user', read: true, time: '3 days ago', priority: 'low' },
];

const typeIcons = {
  user: UserPlus,
  system: Activity,
  security: AlertTriangle,
  alert: AlertCircle,
};

const typeColors = {
  user: 'text-primary',
  system: 'text-info',
  security: 'text-destructive',
  alert: 'text-warning',
};

const typeBgColors = {
  user: 'bg-primary/10',
  system: 'bg-info/10',
  security: 'bg-destructive/10',
  alert: 'bg-warning/10',
};

const priorityColors = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};

export default function AdminNotifications() {
  const [notificationType, setNotificationType] = useState<'all' | 'single' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<typeof allUsers>([]);
  const [singleUser, setSingleUser] = useState<typeof allUsers[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // System Notifications State
  const [systemNotifications, setSystemNotifications] = useState<AdminNotification[]>(adminSystemNotifications);
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const unreadCount = systemNotifications.filter(n => !n.read).length;

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredNotifications = useMemo(() => {
    return systemNotifications.filter(notification => {
      if (typeFilter === 'all') return true;
      if (typeFilter === 'unread') return !notification.read;
      return notification.type === typeFilter;
    });
  }, [systemNotifications, typeFilter]);

  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMarkAsRead = (id: number) => {
    setSystemNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setSystemNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  const handleSelectUser = (user: typeof allUsers[0]) => {
    if (notificationType === 'single') {
      setSingleUser(user);
      setSearchTerm('');
    } else {
      if (!selectedUsers.find(u => u.id === user.id)) {
        setSelectedUsers([...selectedUsers, user]);
      }
      setSearchTerm('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (notificationType === 'single') {
      setSingleUser(null);
    } else {
      setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    }
  };

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (notificationType === 'single' && !singleUser) {
      toast({ title: 'Error', description: 'Please select a user', variant: 'destructive' });
      return;
    }

    if (notificationType === 'selected' && selectedUsers.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one user', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      let targetDescription = '';
      switch (notificationType) {
        case 'all':
          targetDescription = 'all users';
          break;
        case 'single':
          targetDescription = singleUser?.name || 'selected user';
          break;
        case 'selected':
          targetDescription = `${selectedUsers.length} users`;
          break;
      }

      toast({ 
        title: 'Notification Sent!', 
        description: `Successfully sent to ${targetDescription}` 
      });
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      setSingleUser(null);
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notifications</h2>
        <p className="text-muted-foreground">Manage admin notifications and send messages to users.</p>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">System Notifications</TabsTrigger>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Admin System Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 && `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`}
                {unreadCount === 0 && 'All caught up!'}
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="user">User Events</SelectItem>
                  <SelectItem value="system">System Health</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                </SelectContent>
              </Select>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications ({filteredNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedNotifications.map((notification) => {
                      const Icon = typeIcons[notification.type];
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-lg border border-border transition-colors',
                            !notification.read && 'bg-primary/5 border-primary/20'
                          )}
                        >
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeBgColors[notification.type])}>
                            <Icon className={cn('w-5 h-5', typeColors[notification.type])} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={cn('font-medium', !notification.read && 'text-foreground')}>
                                    {notification.title}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={cn('text-xs', priorityColors[notification.priority])}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 hidden sm:block mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {renderPaginationItems()}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Compose Notification
              </CardTitle>
              <CardDescription>Send push notifications to your users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Selection */}
              <div className="space-y-4">
                <Label>Send To</Label>
                <div className="flex gap-4">
                  <Button
                    variant={notificationType === 'all' ? 'default' : 'outline'}
                    onClick={() => { setNotificationType('all'); setSelectedUsers([]); setSingleUser(null); }}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    All Users
                  </Button>
                  <Button
                    variant={notificationType === 'single' ? 'default' : 'outline'}
                    onClick={() => { setNotificationType('single'); setSelectedUsers([]); }}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Single User
                  </Button>
                  <Button
                    variant={notificationType === 'selected' ? 'default' : 'outline'}
                    onClick={() => { setNotificationType('selected'); setSingleUser(null); }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selected Users
                  </Button>
                </div>
              </div>

              {/* User Search - for Single or Selected */}
              {(notificationType === 'single' || notificationType === 'selected') && (
                <div className="space-y-4">
                  <Label>
                    {notificationType === 'single' ? 'Select User' : `Select Users (${selectedUsers.length} selected)`}
                  </Label>
                  
                  {/* Selected Users Display */}
                  {notificationType === 'single' && singleUser && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{singleUser.name}</span>
                        <span className="text-muted-foreground ml-2">({singleUser.email})</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(singleUser.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {notificationType === 'selected' && selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {selectedUsers.map(user => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1 pr-1">
                          {user.name}
                          <button 
                            onClick={() => handleRemoveUser(user.id)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  {(notificationType === 'selected' || (notificationType === 'single' && !singleUser)) && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name, email, or company..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      
                      {/* Search Results Dropdown */}
                      {searchTerm && (
                        <Card className="absolute z-10 w-full mt-1 shadow-lg">
                          <ScrollArea className="max-h-64">
                            {filteredUsers.length > 0 ? (
                              <div className="p-1">
                                {filteredUsers.map(user => (
                                  <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    disabled={selectedUsers.find(u => u.id === user.id) !== undefined}
                                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                                      selectedUsers.find(u => u.id === user.id) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email} • {user.company}</p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                No users found
                              </div>
                            )}
                          </ScrollArea>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Content */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendNotification} 
                disabled={isSending}
                className="w-full"
              >
                {isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Sent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>To: {notification.target}</span>
                      <span>•</span>
                      <span>{notification.sentAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
