import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { tokensAPI } from '@/services/api';
import { APIToken } from '@/types';

export default function TokenPage() {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const { toast } = useToast();

  const loadTokens = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tokensAPI.getTokens();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleGenerateToken = async () => {
    if (!newTokenName) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a token name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = await tokensAPI.generateToken(newTokenName);
      setGeneratedToken(data.token);
      toast({
        title: 'Token Generated',
        description: 'New API token created successfully',
      });
      setNewTokenName('');
      loadTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate token',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeToken = async (id: number) => {
    try {
      await tokensAPI.revokeToken(id);
      toast({
        title: 'Token Revoked',
        description: 'API token has been revoked',
      });
      loadTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke token',
        variant: 'destructive',
      });
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: 'Copied',
      description: 'Token copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Token</h1>
        <p className="text-muted-foreground">
          Manage your API tokens for programmatic access
        </p>
      </div>

      {/* Generate New Token */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Token name (e.g., Production Server)"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
            />
            <Button onClick={handleGenerateToken}>
              <Plus className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>

          {generatedToken && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Your new token (save it now!):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded text-sm">
                  {generatedToken}
                </code>
                <Button size="sm" variant="ghost" onClick={() => handleCopyToken(generatedToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This token will only be shown once. Make sure to save it securely.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tokens ({tokens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tokens...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No API tokens yet</div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {token.created_relative || token.created_at}
                    </div>
                    {token.last_used_relative && (
                      <div className="text-xs text-muted-foreground">
                        Last used: {token.last_used_relative}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Your Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Include your token in the Authorization header:</p>
            <code className="block p-3 bg-muted rounded text-sm">
              Authorization: Bearer YOUR_TOKEN_HERE
            </code>
          </div>
          <div>
            <p className="text-sm mb-2">Example request:</p>
            <code className="block p-3 bg-muted rounded text-sm whitespace-pre">
              {`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  http://localhost:5000/api/v1/alerts`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
