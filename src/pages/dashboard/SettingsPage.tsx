import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Clock, 
  Database, 
  CreditCard, 
  Trash2,
  Plus,
  Moon,
  Sun
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    settings, 
    updateSettings, 
    addPaymentMethod, 
    removePaymentMethod, 
    setDefaultPaymentMethod,
    runBackupNow,
    cancelSubscription 
  } = useSettings();
  const { toast } = useToast();
  
  const [newCard, setNewCard] = useState({ last4: '', expiry: '' });
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const handleSavePreferences = () => {
    toast({ title: 'Settings saved', description: 'Your theme preferences have been updated.' });
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Notifications saved', description: 'Your notification preferences have been updated.' });
  };

  const handleSaveReminders = () => {
    toast({ title: 'Reminders saved', description: 'Your reminder preferences have been updated.' });
  };

  const handleSaveBackup = () => {
    toast({ title: 'Backup settings saved', description: 'Your backup preferences have been updated.' });
  };

  const handleRunBackup = () => {
    runBackupNow();
    toast({ title: 'Backup started', description: 'Your data backup has been initiated.' });
  };

  const handleAddPaymentMethod = () => {
    if (newCard.last4.length === 4 && newCard.expiry) {
      addPaymentMethod({ last4: newCard.last4, expiry: newCard.expiry, isDefault: false });
      setNewCard({ last4: '', expiry: '' });
      setIsAddCardOpen(false);
      toast({ title: 'Card added', description: 'Your new payment method has been added.' });
    }
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    toast({ title: 'Subscription cancelled', description: 'Your subscription has been cancelled.' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and settings.</p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="backup">Data Backup</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>Customize the appearance of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: SettingsIcon },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        theme === option.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how you receive alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications} 
                  onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                </div>
                <Switch 
                  checked={settings.smsNotifications} 
                  onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Webhook Notifications</p>
                  <p className="text-sm text-muted-foreground">Send alerts to your webhook endpoint</p>
                </div>
                <Switch 
                  checked={settings.webhookNotifications} 
                  onCheckedChange={(checked) => updateSettings({ webhookNotifications: checked })} 
                />
              </div>
              {settings.webhookNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
                    placeholder="https://your-webhook-endpoint.com/alerts"
                  />
                </div>
              )}
              <Button onClick={handleSaveNotifications}>Save Notifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>Set up automated reminders and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of alerts</p>
                </div>
                <Switch 
                  checked={settings.dailyDigest} 
                  onCheckedChange={(checked) => updateSettings({ dailyDigest: checked })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Security Report</p>
                  <p className="text-sm text-muted-foreground">Get a comprehensive weekly report</p>
                </div>
                <Switch 
                  checked={settings.weeklyReport} 
                  onCheckedChange={(checked) => updateSettings({ weeklyReport: checked })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Digest Time</Label>
                <Select 
                  value={settings.digestTime} 
                  onValueChange={(value) => updateSettings({ digestTime: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveReminders}>Save Reminders</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Backup
              </CardTitle>
              <CardDescription>Manage your data backup settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select 
                  value={settings.backupFrequency} 
                  onValueChange={(value: 'hourly' | 'daily' | 'weekly' | 'monthly') => updateSettings({ backupFrequency: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Last Backup</span>
                  <span className="text-sm text-muted-foreground">{formatDate(settings.lastBackup)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next Scheduled</span>
                  <span className="text-sm text-muted-foreground">{formatDate(settings.nextBackup)}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSaveBackup}>Save Settings</Button>
                <Button variant="outline" onClick={handleRunBackup}>Run Backup Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">{settings.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">{settings.planPrice}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${settings.plan === 'Cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {settings.plan === 'Cancelled' ? 'Cancelled' : 'Active'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Next billing date: {settings.nextBillingDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Payment Methods</Label>
                  <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>Add a new credit card to your account.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="last4">Last 4 digits of card</Label>
                          <Input
                            id="last4"
                            placeholder="4242"
                            maxLength={4}
                            value={newCard.last4}
                            onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YYYY"
                            value={newCard.expiry}
                            onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddPaymentMethod}>Add Card</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {settings.paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• {method.last4}</p>
                        <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                      </div>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Default</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setDefaultPaymentMethod(method.id);
                            toast({ title: 'Default card updated' });
                          }}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => {
                          removePaymentMethod(method.id);
                          toast({ title: 'Card removed' });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={settings.plan === 'Cancelled'}>
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will cancel your subscription at the end of your current billing period. 
                        You will lose access to premium features.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription}>
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
