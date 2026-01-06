import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, Download, AlertTriangle, Ban, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  alerts: Math.floor(Math.random() * 50) + 10,
}));

const alerts = [
  { id: 1, ipSource: '192.168.1.105', sourcePort: '45678', ipDest: '10.0.0.1', destPort: '443', protocol: 'TCP', severity: 'High', timestamp: '2024-01-15 14:32:15' },
  { id: 2, ipSource: '10.0.0.45', sourcePort: '52341', ipDest: '192.168.1.1', destPort: '22', protocol: 'TCP', severity: 'Critical', timestamp: '2024-01-15 14:28:42' },
  { id: 3, ipSource: '172.16.0.88', sourcePort: '33456', ipDest: '10.0.0.5', destPort: '80', protocol: 'TCP', severity: 'Medium', timestamp: '2024-01-15 14:25:18' },
  { id: 4, ipSource: '192.168.2.201', sourcePort: '48923', ipDest: '172.16.0.1', destPort: '3389', protocol: 'TCP', severity: 'High', timestamp: '2024-01-15 14:22:05' },
  { id: 5, ipSource: '10.0.1.33', sourcePort: '51234', ipDest: '192.168.1.50', destPort: '8080', protocol: 'TCP', severity: 'Low', timestamp: '2024-01-15 14:18:33' },
  { id: 6, ipSource: '192.168.1.78', sourcePort: '44567', ipDest: '10.0.0.100', destPort: '21', protocol: 'TCP', severity: 'Medium', timestamp: '2024-01-15 14:15:21' },
  { id: 7, ipSource: '172.16.1.45', sourcePort: '39876', ipDest: '192.168.2.1', destPort: '53', protocol: 'UDP', severity: 'Low', timestamp: '2024-01-15 14:12:08' },
  { id: 8, ipSource: '10.0.2.67', sourcePort: '47123', ipDest: '172.16.0.50', destPort: '445', protocol: 'TCP', severity: 'Critical', timestamp: '2024-01-15 14:08:45' },
];

const severityColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-destructive/10 text-destructive',
  Critical: 'bg-purple-500/10 text-purple-500',
};

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const { toast } = useToast();

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.ipSource.includes(searchTerm) || 
      alert.ipDest.includes(searchTerm) ||
      alert.protocol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleAddToBlocklist = (ip: string) => {
    toast({ title: 'Added to Blocklist', description: `${ip} has been added to your blocklist.` });
  };

  const handleAddToWhitelist = (ip: string) => {
    toast({ title: 'Added to Whitelist', description: `${ip} has been added to your whitelist.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Recent Alerts</h2>
          <p className="text-muted-foreground">Monitor and analyze security alerts from the last 30 days.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alert Activity (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="alerts" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by IP, protocol..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source IP</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Port</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination IP</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Port</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">{alert.ipSource}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.sourcePort}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.ipDest}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.destPort}</td>
                    <td className="py-3 px-4">{alert.protocol}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{alert.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Add to List
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAddToBlocklist(alert.ipSource)}>
                            <Ban className="w-4 h-4 mr-2" />
                            Add to Blocklist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToWhitelist(alert.ipSource)}>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Add to Whitelist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
