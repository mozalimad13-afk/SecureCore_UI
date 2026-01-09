import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, RefreshCw, Key, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

export default function TokenPage() {
  const [showToken, setShowToken] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  // Check if user has an active subscription
  const isFreePlan = settings.plan === 'Cancelled' || settings.plan === 'Free Trial';
  
  // Simulated token - in production this would come from the backend
  const [token] = useState('sk_live_securecore_7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0');

  const maskedToken = token.substring(0, 12) + '••••••••••••••••••••••••••••••••' + token.substring(token.length - 4);

  const copyToken = () => {
    if (isFreePlan) return;
    navigator.clipboard.writeText(token);
    toast({
      title: 'Token copied!',
      description: 'API token has been copied to your clipboard.',
    });
  };

  const regenerateToken = () => {
    if (isFreePlan) return;
    setIsRegenerating(true);
    setTimeout(() => {
      toast({
        title: 'Token regenerated',
        description: 'Your new API token is ready. Make sure to update your applications.',
      });
      setIsRegenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Token</h2>
        <p className="text-muted-foreground">
          Your API token is used to authenticate requests from your IDS agent.
        </p>
      </div>

      {isFreePlan && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Lock className="w-8 h-8 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-warning">Subscription Required</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade your plan to access your API token and start using SecureCore.
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard/settings')}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={isFreePlan ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Your API Token
          </CardTitle>
          <CardDescription>
            Keep this token secure. It provides full access to your SecureCore account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Input 
                readOnly 
                value={isFreePlan ? '••••••••••••••••••••••••••••••••••••••••••••••' : (showToken ? token : maskedToken)}
                className={`font-mono text-sm pr-10 ${isFreePlan ? 'blur-sm select-none' : ''}`}
              />
              {!isFreePlan && (
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            <Button variant="outline" onClick={copyToken} disabled={isFreePlan}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className={`p-4 rounded-lg bg-muted/50 border border-border ${isFreePlan ? 'blur-sm' : ''}`}>
            <h4 className="font-medium mb-2">How to use your token</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Pass your API token in the configuration file of your SecureCore agent:
            </p>
            <pre className="bg-background p-3 rounded text-sm font-mono overflow-x-auto">
{`# config.yaml
api_token: "${isFreePlan ? '••••••••••••••••••••' : (showToken ? token : maskedToken)}"
endpoint: "https://api.securecore.com/v1"
`}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border gap-4">
            <div>
              <p className="font-medium">Regenerate Token</p>
              <p className="text-sm text-muted-foreground">
                This will invalidate your current token immediately.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={regenerateToken}
              disabled={isRegenerating || isFreePlan}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={isFreePlan ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle>Token Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Requests Today</p>
              <p className="text-2xl font-bold">{isFreePlan ? '—' : '2,847'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Used</p>
              <p className="text-2xl font-bold">{isFreePlan ? '—' : '2 min ago'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Rate Limit</p>
              <p className="text-2xl font-bold">{isFreePlan ? '—' : '10K/min'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
