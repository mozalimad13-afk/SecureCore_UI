/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { settingsAPI, subscriptionAPI, paymentMethodsAPI } from '../services/api';
import { PaymentMethod as APIPaymentMethod, PaymentMethodForm } from '../types';
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
  subscriptionStatus: 'active' | 'suspended' | 'trial' | 'none';
  isSuspended: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  addPaymentMethod: (method: PaymentMethodForm) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  runBackupNow: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resubscribe: (plan: string, cardDetails: { cardNumber: string; cardName: string; expiry: string; cvc: string }) => Promise<void>;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  smsNotifications: false,
  webhookNotifications: false,
  webhookUrl: '',
  dailyDigest: false,
  weeklyReport: false,
  digestTime: '09:00',
  backupFrequency: 'monthly',
  lastBackup: '',
  nextBackup: '',
  plan: 'Free',
  planPrice: '$0/month',
  nextBillingDate: '',
  paymentMethods: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { isAuthenticated, user } = auth;
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;

      const companyRole = (user as any)?.company_role;
      const isAdmin = user?.role === 'admin' || companyRole === 'admin';

      const [settingsData, subscriptionData, paymentMethodsData] = await Promise.all([
        isAdmin ? settingsAPI.getSettings().catch(() => ({ settings: defaultSettings })) : Promise.resolve({ settings: defaultSettings }),
        isAdmin ? subscriptionAPI.getSubscription().catch(() => null) : Promise.resolve(null),
        isAdmin ? paymentMethodsAPI.getPaymentMethods().catch(() => ({ payment_methods: [] })) : Promise.resolve({ payment_methods: [] }),
      ]);

      // Handle the case where settingsData might be wrapped in a 'settings' property or be the object itself
      const rawSettings = (settingsData as { settings?: Record<string, unknown> }).settings || (settingsData as Record<string, unknown>);

      const merged: Settings = {
        emailNotifications: (rawSettings.email_notifications as boolean) ?? defaultSettings.emailNotifications,
        smsNotifications: (rawSettings.sms_notifications as boolean) ?? defaultSettings.smsNotifications,
        webhookNotifications: (rawSettings.webhook_notifications as boolean) ?? defaultSettings.webhookNotifications,
        webhookUrl: (rawSettings.webhook_url as string) || '',
        dailyDigest: (rawSettings.daily_digest as boolean) ?? defaultSettings.dailyDigest,
        weeklyReport: (rawSettings.weekly_report as boolean) ?? defaultSettings.weeklyReport,
        digestTime: (rawSettings.digest_time as string) || defaultSettings.digestTime,
        backupFrequency: (rawSettings.backup_frequency as 'hourly' | 'daily' | 'weekly' | 'monthly') || defaultSettings.backupFrequency,
        lastBackup: (rawSettings.last_backup as string) || '',
        nextBackup: (rawSettings.next_backup as string) || '',
        plan: (subscriptionData?.subscription?.plan_name as string) || 'Free',
        planPrice: subscriptionData?.subscription?.plan_price ? `$${subscriptionData.subscription.plan_price}/month` : '$0/month',
        nextBillingDate: (subscriptionData?.subscription?.next_billing_date as string) || '',
        paymentMethods: paymentMethodsData.payment_methods.map((pm: APIPaymentMethod) => ({
          id: pm.id.toString(),
          type: pm.card_brand || 'Card',
          last4: pm.card_last4,
          expiry: `${pm.expiry_month}/${pm.expiry_year}`,
          isDefault: pm.is_default
        })),
      };

      setSettings(merged);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [auth, user]);

  // Only load settings when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const apiUpdates: Record<string, unknown> = {};

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

  const addPaymentMethod = async (method: PaymentMethodForm) => {
    try {
      const addData = {
        card_number: method.cardNumber || '0000',
        card_holder_name: method.cardName || 'Unknown',
        expiry_month: method.expiryMonth || '01',
        expiry_year: method.expiryYear || '25',
        billing_address: method.billingAddress,
        city: method.city,
        zip_code: method.zipCode
      };

      const data = await paymentMethodsAPI.addPaymentMethod(addData);

      const newMethod = data.payment_method;

      setSettings(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, {
          id: newMethod.id.toString(),
          type: newMethod.card_brand || 'Card',
          last4: newMethod.card_last4,
          expiry: `${newMethod.expiry_month}/${newMethod.expiry_year}`,
          isDefault: newMethod.is_default
        }],
      }));
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      await paymentMethodsAPI.deletePaymentMethod(parseInt(id));
      setSettings(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter(m => m.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      await paymentMethodsAPI.setDefaultPaymentMethod(parseInt(id));
      setSettings(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(m => ({
          ...m,
          isDefault: m.id === id,
        })),
      }));
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      const data = await subscriptionAPI.cancelSubscription();
      if (data.subscription) {
        setSettings(prev => ({
          ...prev,
          plan: data.subscription.plan_name,
          planPrice: data.subscription.plan_price ? `$${data.subscription.plan_price}/month` : '$0/month'
        }));
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  const resubscribe = async (plan: string, cardDetails: { cardNumber: string; cardName: string; expiry: string; cvc: string }) => {
    try {
      const data = await subscriptionAPI.resubscribe(plan, cardDetails);
      if (data.subscription) {
        setSettings(prev => ({
          ...prev,
          plan: data.subscription.plan_name,
          planPrice: data.subscription.plan_price ? `$${data.subscription.plan_price}/month` : (plan === 'Entropy' ? '$499/month' : '$99/month')
        }));
      }
    } catch (error) {
      console.error('Failed to resubscribe:', error);
      throw error;
    }
  };

  const subscriptionStatus = settings.plan === 'Cancelled' ? 'suspended' : (settings.plan === 'Free' || settings.plan === 'Free Trial' ? 'trial' : 'active');
  const isSuspended = subscriptionStatus === 'suspended';

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      subscriptionStatus,
      isSuspended,
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
