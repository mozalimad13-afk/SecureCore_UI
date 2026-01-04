import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, User, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const users = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@dataflow.io', company: 'DataFlow' },
  { id: '3', name: 'Mike Chen', email: 'mike@securenet.com', company: 'SecureNet' },
  { id: '4', name: 'Emily Davis', email: 'emily@cloudguard.co', company: 'CloudGuard' },
  { id: '5', name: 'Alex Wilson', email: 'alex@startup.io', company: 'StartupIO' },
];

const sentNotifications = [
  { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance tonight', target: 'All Users', sentAt: '2024-01-15 10:30', status: 'delivered' },
  { id: 2, title: 'New Feature Release', message: 'Check out our new reporting dashboard', target: 'All Users', sentAt: '2024-01-14 14:00', status: 'delivered' },
  { id: 3, title: 'Security Alert', message: 'Important security update required', target: 'TechCorp', sentAt: '2024-01-13 09:15', status: 'delivered' },
];

export default function AdminNotifications() {
  const [notificationType, setNotificationType] = useState<'all' | 'single' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [singleUserId, setSingleUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (notificationType === 'single' && !singleUserId) {
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
          const user = users.find(u => u.id === singleUserId);
          targetDescription = user?.name || 'selected user';
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
      setSingleUserId('');
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Push Notifications</h2>
        <p className="text-muted-foreground">Send notifications to users via Firebase Cloud Messaging.</p>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

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
                    onClick={() => setNotificationType('all')}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    All Users
                  </Button>
                  <Button
                    variant={notificationType === 'single' ? 'default' : 'outline'}
                    onClick={() => setNotificationType('single')}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Single User
                  </Button>
                  <Button
                    variant={notificationType === 'selected' ? 'default' : 'outline'}
                    onClick={() => setNotificationType('selected')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selected Users
                  </Button>
                </div>
              </div>

              {/* Single User Selection */}
              {notificationType === 'single' && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={singleUserId} onValueChange={setSingleUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Multiple User Selection */}
              {notificationType === 'selected' && (
                <div className="space-y-2">
                  <Label>Select Users ({selectedUsers.length} selected)</Label>
                  <div className="border border-border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                        />
                        <label htmlFor={user.id} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-muted-foreground ml-2">({user.company})</span>
                        </label>
                      </div>
                    ))}
                  </div>
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
