import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsAPI, subscriptionAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface Settings {
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookNotifications: boolean;
  webhookUrl: string;

  // Reminders
  dailyDigest: boolean;
  weeklyReport: boolean;
  digestTime: string;

  // Backup
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastBackup: string;
  nextBackup: string;

  // Subscription
  plan: string;
  planPrice: string;
  nextBillingDate: string;
  paymentMethods: PaymentMethod[];
}

interface PaymentMethod {
  id: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  runBackupNow: () => Promise<void>;
  cancelSubscription: () => void;
  resubscribe: () => void;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  smsNotifications: false,
  webhookNotifications: false,
  webhookUrl: '',
  dailyDigest: false,
  weeklyReport: false,
  digestTime: '09:00',
  backupFrequency: 'daily',
  lastBackup: '',
  nextBackup: '',
  plan: 'Free',
  planPrice: '$0/month',
  nextBillingDate: '',
  paymentMethods: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  // Only load settings when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settingsData, subscriptionData] = await Promise.all([
        settingsAPI.getSettings(),
        subscriptionAPI.getSubscription().catch(() => null),
      ]);

      const merged: Settings = {
        emailNotifications: settingsData.email_notifications ?? defaultSettings.emailNotifications,
        smsNotifications: settingsData.sms_notifications ?? defaultSettings.smsNotifications,
        webhookNotifications: settingsData.webhook_notifications ?? defaultSettings.webhookNotifications,
        webhookUrl: settingsData.webhook_url || '',
        dailyDigest: settingsData.daily_digest ?? defaultSettings.dailyDigest,
        weeklyReport: settingsData.weekly_report ?? defaultSettings.weeklyReport,
        digestTime: settingsData.digest_time || defaultSettings.digestTime,
        backupFrequency: settingsData.backup_frequency || defaultSettings.backupFrequency,
        lastBackup: settingsData.last_backup || '',
        nextBackup: settingsData.next_backup || '',
        plan: subscriptionData?.plan_name || 'Free',
        planPrice: subscriptionData?.plan_price ? `$${subscriptionData.plan_price}/month` : '$0/month',
        nextBillingDate: subscriptionData?.next_billing_date || '',
        paymentMethods: [],
      };

      setSettings(merged);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const apiUpdates: any = {};

      if ('emailNotifications' in updates) apiUpdates.email_notifications = updates.emailNotifications;
      if ('smsNotifications' in updates) apiUpdates.sms_notifications = updates.smsNotifications;
      if ('webhookNotifications' in updates) apiUpdates.webhook_notifications = updates.webhookNotifications;
      if ('webhookUrl' in updates) apiUpdates.webhook_url = updates.webhookUrl;
      if ('dailyDigest' in updates) apiUpdates.daily_digest = updates.dailyDigest;
      if ('weeklyReport' in updates) apiUpdates.weekly_report = updates.weeklyReport;
      if ('digestTime' in updates) apiUpdates.digest_time = updates.digestTime;
      if ('backupFrequency' in updates) apiUpdates.backup_frequency = updates.backupFrequency;

      await settingsAPI.updateSettings(apiUpdates);
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const runBackupNow = async () => {
    try {
      await settingsAPI.runBackup();
      await loadSettings(); // Reload to get updated backup times
    } catch (error) {
      console.error('Failed to run backup:', error);
      throw error;
    }
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod = { ...method, id: Date.now().toString() };
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, newMethod],
    }));
  };

  const removePaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(m => m.id !== id),
    }));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id,
      })),
    }));
  };

  const cancelSubscription = () => {
    setSettings(prev => ({ ...prev, plan: 'Cancelled' }));
  };

  const resubscribe = () => {
    setSettings(prev => ({ ...prev, plan: 'Small Companies' }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      runBackupNow,
      cancelSubscription,
      resubscribe,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
