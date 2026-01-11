import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Terminal, Apple, CheckCircle, Loader2, LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadsAPI } from '@/services/api';

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Terminal,
  Apple,
};

interface Platform {
  name: string;
  icon: string;
  version: string;
  size: string;
  requirements: string;
  downloadUrl: string;
  features: string[];
}

export default function DownloadsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await downloadsAPI.getMetadata();
        setPlatforms(data.platforms);
      } catch (error) {
        console.error('Failed to fetch download metadata:', error);
        toast({
          title: 'Error',
          description: 'Failed to load download options.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [toast]);

  const handleDownload = (platform: Platform) => {
    // Create a simulated download file
    const content = `# SecureCore Agent for ${platform.name}
# Version: ${platform.version}
# 
# This is a simulated download file.
# In production, this would be the actual installer.
#
# Installation Instructions:
# 1. Run this installer
# 2. Follow the setup wizard
#  3. Enter your API token when prompted
# 4. Start monitoring!
#
# Requirements: ${platform.requirements}
#
# For support, visit: https://support.securecore.com
`;

    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = platform.downloadUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download started',
      description: `SecureCore Agent for ${platform.name} v${platform.version} is downloading.`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Downloads</h2>
        <p className="text-muted-foreground">Download the SecureCore agent for your platform.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = iconMap[platform.icon] || Monitor;
          return (
            <Card key={platform.name} className="flex flex-col">
              <CardHeader>
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>{platform.name}</CardTitle>
                <CardDescription>{platform.requirements}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {platform.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Version {platform.version}</span>
                    <span>{platform.size}</span>
                  </div>
                  <Button className="w-full" onClick={() => handleDownload(platform)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download for {platform.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installation Guide</CardTitle>
          <CardDescription>Quick start guide for setting up the SecureCore agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Download and Install</h4>
            <p className="text-sm text-muted-foreground">
              Download the appropriate version for your operating system and run the installer.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Configure Your Token</h4>
            <p className="text-sm text-muted-foreground">
              Copy your API token from the Token page and paste it into the agent configuration.
            </p>
            <pre className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
              {`# config.yaml
api_token: "your-api-token"
endpoint: "https://api.securecore.com/v1"`}
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Start Monitoring</h4>
            <p className="text-sm text-muted-foreground">
              Launch the agent and start monitoring your network traffic. Alerts will appear in your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
