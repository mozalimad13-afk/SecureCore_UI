import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, RefreshCw, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TokenPage() {
  const [showToken, setShowToken] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  
  // Simulated token - in production this would come from the backend
  const [token] = useState('sk_live_securecore_7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0');

  const maskedToken = token.substring(0, 12) + '••••••••••••••••••••••••••••••••' + token.substring(token.length - 4);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast({
      title: 'Token copied!',
      description: 'API token has been copied to your clipboard.',
    });
  };

  const regenerateToken = () => {
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

      <Card>
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
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input 
                readOnly 
                value={showToken ? token : maskedToken}
                className="font-mono text-sm pr-10"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="outline" onClick={copyToken}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">How to use your token</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Pass your API token in the configuration file of your SecureCore agent:
            </p>
            <pre className="bg-background p-3 rounded text-sm font-mono overflow-x-auto">
{`# config.yaml
api_token: "${showToken ? token : maskedToken}"
endpoint: "https://api.securecore.com/v1"
`}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="font-medium">Regenerate Token</p>
              <p className="text-sm text-muted-foreground">
                This will invalidate your current token immediately.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={regenerateToken}
              disabled={isRegenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Requests Today</p>
              <p className="text-2xl font-bold">2,847</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Used</p>
              <p className="text-2xl font-bold">2 min ago</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Rate Limit</p>
              <p className="text-2xl font-bold">10K/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
