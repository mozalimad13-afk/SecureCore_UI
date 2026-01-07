import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Terminal, Apple, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const platforms = [
  {
    name: 'Windows',
    icon: Monitor,
    version: '2.4.1',
    size: '45 MB',
    requirements: 'Windows 10 or later',
    downloadUrl: 'securecore-agent-windows-2.4.1.exe',
    features: ['System tray integration', 'Auto-start on boot', 'Background monitoring'],
  },
  {
    name: 'Linux',
    icon: Terminal,
    version: '2.4.1',
    size: '38 MB',
    requirements: 'Ubuntu 20.04+ / CentOS 8+ / Debian 10+',
    downloadUrl: 'securecore-agent-linux-2.4.1.tar.gz',
    features: ['Systemd service', 'CLI interface', 'Docker support'],
  },
  {
    name: 'macOS',
    icon: Apple,
    version: '2.4.1',
    size: '42 MB',
    requirements: 'macOS 11 Big Sur or later',
    downloadUrl: 'securecore-agent-macos-2.4.1.dmg',
    features: ['Menu bar app', 'Native notifications', 'Apple Silicon support'],
  },
];

export default function DownloadsPage() {
  const { toast } = useToast();

  const handleDownload = (platform: typeof platforms[0]) => {
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
# 3. Enter your API token when prompted
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Downloads</h2>
        <p className="text-muted-foreground">Download the SecureCore agent for your platform.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card key={platform.name} className="flex flex-col">
            <CardHeader>
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <platform.icon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>{platform.name}</CardTitle>
              <CardDescription>{platform.requirements}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 mb-6">
                {platform.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
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
        ))}
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
