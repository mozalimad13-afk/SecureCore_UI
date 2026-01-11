import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, RefreshCw, Key, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { tokensAPI } from '@/services/api';

export default function TokenPage() {
  const [showToken, setShowToken] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [tokenStats, setTokenStats] = useState({
    requestsToday: 0,
    lastUsed: '',
    rateLimit: '10K/min'
  });
  const { toast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Check if user has an active subscription
  const isFreePlan = settings.plan === 'Cancelled' || settings.plan === 'Free Trial';

  useEffect(() => {
    if (!isFreePlan) {
      loadTokenInfo();
    } else {
      setIsLoading(false);
    }
  }, [isFreePlan]);

  const loadTokenInfo = async () => {
    try {
      setIsLoading(true);
      const data = await tokensAPI.getTokens();
      if (data.tokens && data.tokens.length > 0) {
        const tokenData = data.tokens[0];
        setHasToken(true);
        // Can't show actual token (not stored), only prefix
        setToken(''); // Will be shown as masked

        // Set stats from token data
        setTokenStats({
          requestsToday: tokenData.requests_today || 0,
          lastUsed: tokenData.last_used_relative || 'Never',
          rateLimit: '10K/min'
        });
      } else {
        setHasToken(false);
      }
    } catch (error) {
      console.error('Failed to load token info:', error);
      setHasToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  const maskedToken = token && token.length > 16
    ? token.substring(0, 12) + '••••••••••••••••••••••••••••••••' + token.substring(token.length - 4)
    : '••••••••••••••••••••••••••••••••••••••••••••••';

  const displayToken = hasToken && !token
    ? 'sk_live_••••••••••••••••••••••••••••••••••••••' // Existing token (actual value not available)
    : (showToken ? token : maskedToken); // Newly generated token

  const copyToken = () => {
    if (isFreePlan || !token) {
      toast({
        title: 'Cannot copy',
        description: 'Token value is only available immediately after generation.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(token);
    toast({
      title: 'Token copied!',
      description: 'API token has been copied to your clipboard.',
    });
  };

  const regenerateToken = async () => {
    if (isFreePlan) return;
    setIsRegenerating(true);
    try {
      const data = await tokensAPI.generateToken('Default Token');
      setToken(data.token); // Save the full token value
      setHasToken(true);
      setShowToken(true); // Show it immediately after generation
      toast({
        title: 'Token regenerated',
        description: 'Your new API token is ready. Make sure to copy it now!',
      });
      // Don't reload - keep the token visible
    } catch (error) {
      console.error('Failed to regenerate token:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate token. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading && !isFreePlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                value={isFreePlan ? '••••••••••••••••••••••••••••••••••••••••••••••' : displayToken}
                className={`font-mono text-sm pr-10 ${isFreePlan ? 'blur-sm select-none' : ''}`}
              />
              {!isFreePlan && token && (
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            <Button variant="outline" onClick={copyToken} disabled={isFreePlan || !token}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          {!hasToken && !isFreePlan && (
            <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No token generated yet. Click "Regenerate" below to create your API token.
              </p>
            </div>
          )}

          {hasToken && !token && (
            <div className="p-4 rounded-lg bg-muted/50 border border-warning/30">
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>Note:</strong> For security reasons, the full token value is only shown once during generation.
                If you've lost your token, click "Regenerate" to create a new one.
              </p>
            </div>
          )}

          <div className={`p-4 rounded-lg bg-muted/50 border border-border ${isFreePlan ? 'blur-sm' : ''}`}>
            <h4 className="font-medium mb-2">How to use your token</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Pass your API token in the configuration file of your SecureCore agent:
            </p>
            <pre className="bg-background p-3 rounded text-sm font-mono overflow-x-auto">
              {`# config.yaml
api_token: "${isFreePlan ? '••••••••••••••••••••' : (token ? (showToken ? token : maskedToken) : 'YOUR_TOKEN_HERE')}"
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
              <p className="text-2xl font-bold">{isFreePlan ? '—' : tokenStats.requestsToday.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Used</p>
              <p className="text-2xl font-bold">{isFreePlan ? '—' : tokenStats.lastUsed}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Rate Limit</p>
              <p className="text-2xl font-bold">{isFreePlan ? '—' : tokenStats.rateLimit}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
