import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Download, FileText, RefreshCw } from 'lucide-react';

const generateLogs = () => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const statusCodes = [200, 201, 301, 400, 401, 403, 404, 500, 502];
  const paths = [
    '/api/v1/alerts',
    '/api/v1/users',
    '/api/v1/auth/login',
    '/api/v1/token',
    '/api/v1/blocklist',
    '/api/v1/whitelist',
    '/api/v1/reports',
    '/health',
    '/api/v1/notifications',
  ];
  const ips = [
    '192.168.1.100',
    '10.0.0.45',
    '172.16.0.88',
    '203.0.113.50',
    '198.51.100.23',
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const timestamp = new Date(Date.now() - i * 60000 * Math.random() * 10);
    const responseTime = Math.floor(Math.random() * 500) + 10;
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    return {
      id: i + 1,
      timestamp: timestamp.toISOString(),
      method,
      path,
      status,
      ip,
      responseTime,
      userAgent,
      size: Math.floor(Math.random() * 5000) + 100,
    };
  });
};

const logs = generateLogs();

const getStatusColor = (status: number) => {
  if (status >= 500) return 'bg-destructive text-destructive-foreground';
  if (status >= 400) return 'bg-warning text-warning-foreground';
  if (status >= 300) return 'bg-primary/50 text-primary-foreground';
  return 'bg-success text-success-foreground';
};

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-primary/20 text-primary';
    case 'POST': return 'bg-success/20 text-success';
    case 'PUT': return 'bg-warning/20 text-warning';
    case 'DELETE': return 'bg-destructive/20 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    const matchesMethod = methodFilter === 'all' || log.method === methodFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === '2xx' && log.status >= 200 && log.status < 300) ||
      (statusFilter === '3xx' && log.status >= 300 && log.status < 400) ||
      (statusFilter === '4xx' && log.status >= 400 && log.status < 500) ||
      (statusFilter === '5xx' && log.status >= 500);
    return matchesSearch && matchesMethod && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">HTTP Logs</h2>
          <p className="text-muted-foreground">View Nginx-style HTTP request logs from the server.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by path or IP..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="2xx">2xx Success</SelectItem>
                <SelectItem value="3xx">3xx Redirect</SelectItem>
                <SelectItem value="4xx">4xx Client Error</SelectItem>
                <SelectItem value="5xx">5xx Server Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Request Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Path</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {filteredLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-4 text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant="outline" className={getMethodColor(log.method)}>
                        {log.method}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 max-w-[200px] truncate">{log.path}</td>
                    <td className="py-2 px-4">
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">{log.ip}</td>
                    <td className="py-2 px-4">{log.responseTime}ms</td>
                    <td className="py-2 px-4">{(log.size / 1024).toFixed(1)}KB</td>
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
