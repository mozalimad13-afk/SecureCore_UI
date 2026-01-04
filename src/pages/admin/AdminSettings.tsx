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
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, addPaymentMethod, removePaymentMethod, runBackupNow, cancelSubscription } = useSettings();
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Settings</h2>
        <p className="text-muted-foreground">Manage admin account preferences and settings.</p>
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
              <Button onClick={handleSave}>Save Preferences</Button>
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
                  <Label>Webhook URL</Label>
                  <Input 
                    value={settings.webhookUrl}
                    onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
                    placeholder="https://your-webhook-url.com"
                  />
                </div>
              )}
              <Button onClick={handleSave}>Save Notifications</Button>
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
              <Button onClick={handleSave}>Save Reminders</Button>
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
                  <span className="text-sm text-muted-foreground">
                    {new Date(settings.lastBackup).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next Scheduled</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(settings.nextBackup).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave}>Save Settings</Button>
                <Button variant="outline" onClick={() => {
                  runBackupNow();
                  toast({ title: 'Backup Started', description: 'Your data backup is now running.' });
                }}>Run Backup Now</Button>
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
                  <span className="px-3 py-1 bg-success/10 text-success text-sm rounded-full">Active</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Next billing date: {settings.nextBillingDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Payment Methods</Label>
                  <Button variant="outline" size="sm" onClick={() => {
                    addPaymentMethod({ last4: '1234', expiry: '12/2026', isDefault: false });
                    toast({ title: 'Payment Method Added', description: 'New payment method has been added.' });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
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
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => {
                        removePaymentMethod(method.id);
                        toast({ title: 'Payment Method Removed', description: 'Payment method has been removed.' });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="destructive" onClick={() => {
                  cancelSubscription();
                  toast({ title: 'Subscription Cancelled', description: 'Your subscription has been cancelled.', variant: 'destructive' });
                }}>Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
