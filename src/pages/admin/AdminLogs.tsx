import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Download, FileText, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LOGS_PER_PAGE = 15;

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

  return Array.from({ length: 100 }, (_, i) => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const timestamp = new Date(Date.now() - i * 60000 * Math.random() * 60);
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
  const [logs, setLogs] = useState(generateLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

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
    
    // Date filter
    const logDate = new Date(log.timestamp);
    const matchesFromDate = !fromDate || logDate >= fromDate;
    const matchesToDate = !toDate || logDate <= new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesMethod && matchesStatus && matchesFromDate && matchesToDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDateChange = (type: 'from' | 'to', date: Date | undefined) => {
    if (type === 'from') {
      setFromDate(date);
    } else {
      setToDate(date);
    }
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setLogs(generateLogs());
    setCurrentPage(1);
    toast({ title: 'Logs refreshed', description: 'Latest logs have been loaded.' });
  };

  const handleExport = () => {
    const logContent = filteredLogs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      return `${timestamp} ${log.ip} "${log.method} ${log.path}" ${log.status} ${log.size} ${log.responseTime}ms "${log.userAgent}"`;
    }).join('\n');

    const header = '# SecureCore HTTP Logs\n# Format: timestamp ip "method path" status size response_time user_agent\n\n';
    const content = header + logContent;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securecore-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Logs exported', description: 'Log file has been downloaded.' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">HTTP Logs</h2>
          <p className="text-muted-foreground">View Nginx-style HTTP request logs from the server.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by path or IP..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                />
              </div>
              <Select value={methodFilter} onValueChange={(v) => handleFilterChange(setMethodFilter, v)}>
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
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
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

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Label className="text-sm font-medium whitespace-nowrap">Time Filter:</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[160px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PP") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => handleDateChange('from', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[160px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PP") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => handleDateChange('to', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {(fromDate || toDate) && (
                  <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">IP</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Size</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {paginatedLogs.map((log) => (
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
                    <td className="py-2 px-4 hidden md:table-cell">{log.ip}</td>
                    <td className="py-2 px-4 hidden lg:table-cell">{log.responseTime}ms</td>
                    <td className="py-2 px-4 hidden lg:table-cell">{(log.size / 1024).toFixed(1)}KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
