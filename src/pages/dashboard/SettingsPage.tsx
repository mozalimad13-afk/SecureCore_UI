import { useState, useEffect } from 'react';
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
  User as UserIcon,
  Building2,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
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
  const {
    settings,
    updateSettings,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    runBackupNow,
    cancelSubscription,
    resubscribe
  } = useSettings();
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { toast } = useToast();
  const { isAdmin, canAccessCompanySettings, canAccessSubscription, canAccessPaymentMethods } = useUserRole();

  // User Profile State (all users)
  const [pendingProfile, setPendingProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Company Settings State (admin only)
  const [pendingNotifications, setPendingNotifications] = useState({
    emailNotifications: settings.emailNotifications,
    smsNotifications: settings.smsNotifications,
    webhookNotifications: settings.webhookNotifications,
    webhookUrl: settings.webhookUrl,
  });
  const [pendingReminders, setPendingReminders] = useState({
    dailyDigest: settings.dailyDigest,
    weeklyReport: settings.weeklyReport,
    digestTime: settings.digestTime,
  });
  const [pendingBackup, setPendingBackup] = useState({
    backupFrequency: settings.backupFrequency,
  });

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
  });
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Small Companies' | 'Entropy'>('Small Companies');
  const [subscribeCard, setSubscribeCard] = useState({ cardNumber: '', cardName: '', expiry: '', cvc: '' });

  // Sync state when settings/user change
  useEffect(() => {
    setPendingNotifications({
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      webhookNotifications: settings.webhookNotifications,
      webhookUrl: settings.webhookUrl,
    });
    setPendingReminders({
      dailyDigest: settings.dailyDigest,
      weeklyReport: settings.weeklyReport,
      digestTime: settings.digestTime,
    });
    setPendingBackup({
      backupFrequency: settings.backupFrequency,
    });
    setPendingProfile({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [settings, user]);

  const handleSaveProfile = async () => {
    if (pendingProfile.newPassword && pendingProfile.newPassword !== pendingProfile.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    try {
      await updateAuthProfile({
        name: pendingProfile.name,
        email: pendingProfile.email,
        currentPassword: pendingProfile.currentPassword || undefined,
        newPassword: pendingProfile.newPassword || undefined,
      });
      toast({ title: 'Profile saved', description: 'Your personal information has been updated.' });

      // Clear password fields after success
      setPendingProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const handleSaveNotifications = () => {
    updateSettings(pendingNotifications);
    toast({ title: 'Notifications saved', description: 'Company notification preferences have been updated.' });
  };

  const handleSaveReminders = () => {
    updateSettings(pendingReminders);
    toast({ title: 'Reminders saved', description: 'Company reminder preferences have been updated.' });
  };

  const handleSaveBackup = () => {
    updateSettings(pendingBackup);
    toast({ title: 'Backup settings saved', description: 'Company backup preferences have been updated.' });
  };

  const handleRunBackup = () => {
    runBackupNow();
    toast({ title: 'Backup started', description: 'Company data backup has been initiated.' });
  };

  const handleAddPaymentMethod = () => {
    if (newCard.cardNumber && newCard.cardName && newCard.expiryMonth && newCard.expiryYear && newCard.cvc) {
      addPaymentMethod(newCard);
      setNewCard({ cardNumber: '', cardName: '', expiryMonth: '', expiryYear: '', cvc: '' });
      setIsAddCardOpen(false);
      toast({ title: 'Card added', description: 'New payment method has been added.' });
    } else {
      toast({ title: 'Error', description: 'Please fill in all card details.', variant: 'destructive' });
    }
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    toast({ title: 'Subscription cancelled', description: 'Company subscription has been cancelled.' });
  };

  const handleSubscribe = () => {
    if (subscribeCard.cardNumber && subscribeCard.cardName && subscribeCard.expiry && subscribeCard.cvc) {
      resubscribe(selectedPlan, subscribeCard);
      setIsSubscribeOpen(false);
      setSubscribeCard({ cardNumber: '', cardName: '', expiry: '', cvc: '' });
      toast({ title: 'Subscription activated', description: `Welcome back! ${selectedPlan} plan is now active.` });
    } else {
      toast({ title: 'Error', description: 'Please fill in all payment details.', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const isSubscriptionCancelled = settings.plan === 'Cancelled';

  // Define tab list based on user role
  const tabs = [
    { value: 'profile', label: 'My Profile', icon: UserIcon, show: true },
    ...(canAccessCompanySettings ? [
      { value: 'notifications', label: 'Notifications', icon: Bell, show: true },
      { value: 'reminders', label: 'Reminders', icon: Clock, show: true },
      { value: 'backup', label: 'Backup', icon: Database, show: true },
    ] : []),
    ...(canAccessSubscription ? [
      { value: 'subscription', label: 'Subscription', icon: CreditCard, show: true },
    ] : []),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage your profile and company settings.' : 'Manage your profile and preferences.'}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${tabs.length > 4 ? 'grid-cols-5' : `grid-cols-${tabs.length}`}`}>
          {tabs.filter(tab => tab.show).map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* USER PROFILE TAB - Available to all users */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                My Profile
              </CardTitle>
              <CardDescription>Manage your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Full Name</Label>
                  <Input
                    id="profileName"
                    value={pendingProfile.name}
                    onChange={(e) => setPendingProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email Address</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={pendingProfile.email}
                    onChange={(e) => setPendingProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={pendingProfile.currentPassword}
                      onChange={(e) => setPendingProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={pendingProfile.newPassword}
                        onChange={(e) => setPendingProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Match new password"
                        value={pendingProfile.confirmPassword}
                        onChange={(e) => setPendingProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY SETTINGS TAB

S - Admin Only */}
        {canAccessCompanySettings && (
          <>
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Company Notification Settings
                  </CardTitle>
                  <CardDescription>Configure how your company receives alerts and updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch
                      checked={pendingNotifications.emailNotifications}
                      onCheckedChange={(checked) => setPendingNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={pendingNotifications.smsNotifications}
                      onCheckedChange={(checked) => setPendingNotifications(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Webhook Notifications</p>
                      <p className="text-sm text-muted-foreground">Send alerts to your webhook endpoint</p>
                    </div>
                    <Switch
                      checked={pendingNotifications.webhookNotifications}
                      onCheckedChange={(checked) => setPendingNotifications(prev => ({ ...prev, webhookNotifications: checked }))}
                    />
                  </div>
                  {pendingNotifications.webhookNotifications && (
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={pendingNotifications.webhookUrl}
                        onChange={(e) => setPendingNotifications(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://your-webhook-endpoint.com/alerts"
                      />
                    </div>
                  )}
                  <Button onClick={handleSaveNotifications}>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Company Reminder Settings
                  </CardTitle>
                  <CardDescription>
                    Set up automated reminders and reports for your company.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Digest</p>
                      <p className="text-sm text-muted-foreground">Receive a daily summary of alerts</p>
                    </div>
                    <Switch
                      checked={pendingReminders.dailyDigest}
                      onCheckedChange={(checked) => setPendingReminders(prev => ({ ...prev, dailyDigest: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Security Report</p>
                      <p className="text-sm text-muted-foreground">Get a comprehensive weekly report</p>
                    </div>
                    <Switch
                      checked={pendingReminders.weeklyReport}
                      onCheckedChange={(checked) => setPendingReminders(prev => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Digest Time</Label>
                    <Select
                      value={pendingReminders.digestTime}
                      onValueChange={(value) => setPendingReminders(prev => ({ ...prev, digestTime: value }))}
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
                  <Button onClick={handleSaveReminders}>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Company Data Backup
                  </CardTitle>
                  <CardDescription>
                    Manage your company's data backup settings. Backups include all company data, security logs, alert history, blocklist/whitelist, and configurations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select
                      value={pendingBackup.backupFrequency}
                      onValueChange={(value: 'hourly' | 'daily' | 'weekly' | 'monthly') => setPendingBackup({ backupFrequency: value })}
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
          </>
        )}

        {/* SUBSCRIPTION TAB - Admin Only */}
        {canAccessSubscription && (
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Company Subscription
                </CardTitle>
                <CardDescription>Manage your company subscription and payment methods.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">{isSubscriptionCancelled ? 'No Active Plan' : `${settings.plan} Plan`}</p>
                      <p className="text-sm text-muted-foreground">{isSubscriptionCancelled ? 'Subscribe to continue using SecureCore' : settings.planPrice}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${isSubscriptionCancelled ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                      {isSubscriptionCancelled ? 'Cancelled' : 'Active'}
                    </span>
                  </div>
                  {!isSubscriptionCancelled && (
                    <div className="text-sm text-muted-foreground">
                      <p>Next billing date: {settings.nextBillingDate}</p>
                    </div>
                  )}
                </div>

                {canAccessPaymentMethods && (
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
                            <DialogDescription>Add a new credit card to your company account.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                placeholder="4242 4242 4242 4242"
                                value={newCard.cardNumber}
                                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardName">Cardholder Name</Label>
                              <Input
                                id="cardName"
                                placeholder="John Doe"
                                value={newCard.cardName}
                                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiryMonth">Expiry Month</Label>
                                <Input
                                  id="expiryMonth"
                                  placeholder="MM"
                                  maxLength={2}
                                  value={newCard.expiryMonth}
                                  onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="expiryYear">Expiry Year</Label>
                                <Input
                                  id="expiryYear"
                                  placeholder="YYYY"
                                  maxLength={4}
                                  value={newCard.expiryYear}
                                  onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newCardCvc">CVC</Label>
                              <Input
                                id="newCardCvc"
                                placeholder="123"
                                maxLength={4}
                                value={newCard.cvc}
                                onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
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
                )}

                <div className="pt-4 border-t border-border">
                  {isSubscriptionCancelled ? (
                    <Dialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen}>
                      <DialogTrigger asChild>
                        <Button>Subscribe</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Subscribe to SecureCore</DialogTitle>
                          <DialogDescription>
                            Enter payment details to activate subscription.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                              type="button"
                              onClick={() => setSelectedPlan('Small Companies')}
                              className={`p-4 rounded-lg border-2 text-left transition-colors ${selectedPlan === 'Small Companies'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                            >
                              <p className="font-semibold">Small Companies</p>
                              <p className="text-xl font-bold text-primary">$99/mo</p>
                              <p className="text-xs text-muted-foreground mt-1">Up to 10k alerts/mo</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPlan('Entropy')}
                              className={`p-4 rounded-lg border-2 text-left transition-colors ${selectedPlan === 'Entropy'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                            >
                              <p className="font-semibold">Entropy Plan</p>
                              <p className="text-xl font-bold text-primary">$499/mo</p>
                              <p className="text-xs text-muted-foreground mt-1">Unlimited alerts & premium support</p>
                            </button>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subCardName">Cardholder Name</Label>
                            <Input
                              id="subCardName"
                              placeholder="John Doe"
                              value={subscribeCard.cardName}
                              onChange={(e) => setSubscribeCard({ ...subscribeCard, cardName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={subscribeCard.cardNumber}
                              onChange={(e) => setSubscribeCard({ ...subscribeCard, cardNumber: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="subExpiry">Expiry Date</Label>
                              <Input
                                id="subExpiry"
                                placeholder="MM/YY"
                                value={subscribeCard.expiry}
                                onChange={(e) => setSubscribeCard({ ...subscribeCard, expiry: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvc">CVC</Label>
                              <Input
                                id="cvc"
                                placeholder="123"
                                value={subscribeCard.cvc}
                                onChange={(e) => setSubscribeCard({ ...subscribeCard, cvc: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsSubscribeOpen(false)}>Cancel</Button>
                          <Button onClick={handleSubscribe}>Subscribe Now</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will cancel your company subscription at the end of the current billing period.
                            All users will lose access to premium features.
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
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
