import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  updateSettings: (updates: Partial<Settings>) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  runBackupNow: () => void;
  cancelSubscription: () => void;
  resubscribe: () => void;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  smsNotifications: false,
  webhookNotifications: true,
  webhookUrl: 'https://api.example.com/webhook',
  dailyDigest: true,
  weeklyReport: true,
  digestTime: '09:00',
  backupFrequency: 'daily',
  lastBackup: new Date().toISOString(),
  nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  plan: 'Small Companies',
  planPrice: '$44/month',
  nextBillingDate: '2024-02-15',
  paymentMethods: [
    { id: '1', last4: '4242', expiry: '12/2025', isDefault: true },
  ],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('appSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };
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

  const runBackupNow = () => {
    setSettings(prev => ({
      ...prev,
      lastBackup: new Date().toISOString(),
      nextBackup: calculateNextBackup(prev.backupFrequency),
    }));
  };

  const cancelSubscription = () => {
    setSettings(prev => ({
      ...prev,
      plan: 'Cancelled',
      planPrice: '$0',
    }));
  };

  const resubscribe = () => {
    setSettings(prev => ({
      ...prev,
      plan: 'Professional',
      planPrice: '$99/month',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
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

function calculateNextBackup(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
