import { useState, useMemo } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Filter, Download, AlertTriangle, Ban, ShieldCheck, MoreHorizontal, Clock } from 'lucide-react';
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
import jsPDF from 'jspdf';

const generateAlertsForPeriod = (days: number) => {
  const baseAlerts = [
    { ipSource: '192.168.1.105', sourcePort: '45678', ipDest: '10.0.0.1', destPort: '443', protocol: 'TCP', severity: 'High' },
    { ipSource: '10.0.0.45', sourcePort: '52341', ipDest: '192.168.1.1', destPort: '22', protocol: 'TCP', severity: 'Critical' },
    { ipSource: '172.16.0.88', sourcePort: '33456', ipDest: '10.0.0.5', destPort: '80', protocol: 'TCP', severity: 'Medium' },
    { ipSource: '192.168.2.201', sourcePort: '48923', ipDest: '172.16.0.1', destPort: '3389', protocol: 'TCP', severity: 'High' },
    { ipSource: '10.0.1.33', sourcePort: '51234', ipDest: '192.168.1.50', destPort: '8080', protocol: 'TCP', severity: 'Low' },
    { ipSource: '192.168.1.78', sourcePort: '44567', ipDest: '10.0.0.100', destPort: '21', protocol: 'TCP', severity: 'Medium' },
    { ipSource: '172.16.1.45', sourcePort: '39876', ipDest: '192.168.2.1', destPort: '53', protocol: 'UDP', severity: 'Low' },
    { ipSource: '10.0.2.67', sourcePort: '47123', ipDest: '172.16.0.50', destPort: '445', protocol: 'TCP', severity: 'Critical' },
  ];

  const now = new Date();
  const alerts = [];
  const alertCount = days === 1 ? 8 : days === 7 ? 35 : 120;

  for (let i = 0; i < alertCount; i++) {
    const baseAlert = baseAlerts[i % baseAlerts.length];
    const randomHours = Math.floor(Math.random() * days * 24);
    const timestamp = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
    alerts.push({
      id: i + 1,
      ...baseAlert,
      sourcePort: String(Math.floor(Math.random() * 50000) + 10000),
      timestamp: timestamp.toISOString(),
    });
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateHourlyData = (days: number) => {
  const hours = days === 1 ? 24 : days === 7 ? 24 : 24;
  return Array.from({ length: hours }, (_, i) => ({
    hour: `${i}:00`,
    alerts: Math.floor(Math.random() * 50 * (days === 30 ? 4 : days === 7 ? 2 : 1)) + 10,
  }));
};

const severityColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-destructive/10 text-destructive',
  Critical: 'bg-purple-500/10 text-purple-500',
};

const ITEMS_PER_PAGE = 15;

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
  const alerts = useMemo(() => generateAlertsForPeriod(days), [days]);
  const hourlyData = useMemo(() => generateHourlyData(days), [days]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.ipSource.includes(searchTerm) || 
      alert.ipDest.includes(searchTerm) ||
      alert.protocol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter: string) => {
    setSeverityFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setCurrentPage(1);
  };

  const handleAddToBlocklist = (ip: string) => {
    toast({ title: 'Added to Blocklist', description: `${ip} has been added to your blocklist.` });
  };

  const handleAddToWhitelist = (ip: string) => {
    toast({ title: 'Added to Whitelist', description: `${ip} has been added to your whitelist.` });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SecureCore - Security Alerts Report', 20, 20);
    
    // Time range info
    doc.setFontSize(12);
    const rangeLabel = timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days';
    doc.text(`Time Range: ${rangeLabel}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
    doc.text(`Total Alerts: ${filteredAlerts.length}`, 20, 49);
    
    // Table header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let y = 65;
    doc.text('Source IP', 20, y);
    doc.text('Dest IP', 55, y);
    doc.text('Protocol', 90, y);
    doc.text('Severity', 115, y);
    doc.text('Timestamp', 145, y);
    
    // Table content
    doc.setFont('helvetica', 'normal');
    y += 8;
    
    filteredAlerts.slice(0, 40).forEach((alert) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(alert.ipSource, 20, y);
      doc.text(alert.ipDest, 55, y);
      doc.text(alert.protocol, 90, y);
      doc.text(alert.severity, 115, y);
      doc.text(new Date(alert.timestamp).toLocaleString(), 145, y);
      y += 6;
    });
    
    doc.save(`securecore-alerts-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF exported', description: 'Alerts report has been downloaded.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Recent Alerts</h2>
          <p className="text-muted-foreground">Monitor and analyze security alerts.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alert Activity ({timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'})
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
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={handleFilterChange}>
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
                {paginatedAlerts.map((alert) => (
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
                    <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(alert.timestamp).toLocaleString()}</td>
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
                  {(() => {
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
                  })()}
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
