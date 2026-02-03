import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Search, Filter, Download, AlertTriangle, Ban, ShieldCheck, MoreHorizontal, Loader2 } from 'lucide-react';
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
import { alertsAPI, blocklistAPI, whitelistAPI } from '@/services/api';
import { Alert } from '@/types';
import jsPDF from 'jspdf';

const severityColors: Record<string, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  critical: 'bg-purple-500/10 text-purple-500',
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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await alertsAPI.getAlerts({ page: 1, per_page: 1000 }); // Get all for client-side filtering
        setAlerts(data.alerts);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load alerts.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [toast]);

  // Generate hourly/daily data from alerts based on time range
  const hourlyData = useMemo(() => {
    if (timeRange === '24h') {
      const hours = 24;
      const now = new Date();
      const hourCounts = Array(hours).fill(0);

      alerts.forEach(alert => {
        const alertDate = new Date(alert.created_at);
        const hoursDiff = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60));
        if (hoursDiff >= 0 && hoursDiff < hours) {
          hourCounts[hours - 1 - hoursDiff]++;
        }
      });

      return Array.from({ length: hours }, (_, i) => ({
        hour: `${i}:00`,
        alerts: hourCounts[i],
      }));
    } else if (timeRange === '7d') {
      // Last 7 days
      const days = 7;
      const now = new Date();
      const dayCounts = Array(days).fill(0);

      alerts.forEach(alert => {
        const alertDate = new Date(alert.created_at);
        const daysDiff = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < days) {
          dayCounts[days - 1 - daysDiff]++;
        }
      });

      return Array.from({ length: days }, (_, i) => ({
        hour: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        alerts: dayCounts[i],
      }));
    } else {
      // Last 30 days or All Time (show last 30 days trend)
      const days = 30;
      const now = new Date();
      const dayCounts = Array(days).fill(0);

      alerts.forEach(alert => {
        const alertDate = new Date(alert.created_at);
        const daysDiff = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < days) {
          dayCounts[days - 1 - daysDiff]++;
        }
      });

      return Array.from({ length: days }, (_, i) => ({
        hour: `Day ${i + 1}`,
        alerts: dayCounts[i],
      }));
    }
  }, [alerts, timeRange]);

  // Filter alerts by time range, search, and severity
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Time range filter
      if (timeRange === 'all') return true;
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const alertDate = new Date(alert.created_at);
      const now = new Date();
      const daysDiff = (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > days) return false;

      // Search filter
      const matchesSearch =
        alert.source_ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alert.destination_ip && alert.destination_ip.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alert.protocol && alert.protocol.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      // Severity filter
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;

      return true;
    });
  }, [alerts, searchTerm, severityFilter, timeRange]);

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSeverityFilter(value);
    setCurrentPage(1);
  };

  const handleAddToBlocklist = async (ip: string) => {
    try {
      await blocklistAPI.blockIP(ip, 'Added from Alerts');
      toast({
        title: 'Success',
        description: `${ip} added to blocklist`,
      });
    } catch (error: unknown) {
      const err = error as { error?: string; message?: string };
      toast({
        title: 'Error',
        description: err.error || err.message || 'Failed to block IP.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToWhitelist = async (ip: string) => {
    try {
      await whitelistAPI.addIP(ip, 'Added from Alerts');
      toast({
        title: 'Success',
        description: `${ip} added to whitelist`,
      });
    } catch (error: unknown) {
      const err = error as { error?: string; message?: string };
      toast({
        title: 'Error',
        description: err.error || err.message || 'Failed to whitelist IP.',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('SecureCore IDS - Security Alerts Report', 20, y);
    y += 15;

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 6;
    doc.text(`Time Range: ${timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`, 20, y);
    y += 6;
    doc.text(`Total Alerts: ${filteredAlerts.length}`, 20, y);
    y += 15;

    // Severity Breakdown
    const severityCounts = filteredAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Alerts by Severity:', 20, y);
    y += 8;
    doc.setFontSize(10);
    Object.entries(severityCounts).forEach(([severity, count]) => {
      doc.text(`  ${severity}: ${count}`, 25, y);
      y += 6;
    });
    y += 10;

    // Top Source IPs
    const ipCounts = filteredAlerts.reduce((acc, alert) => {
      acc[alert.source_ip] = (acc[alert.source_ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Top 5 Source IPs:', 20, y);
    y += 8;
    doc.setFontSize(10);
    topIPs.forEach(([ip, count]) => {
      doc.text(`  ${ip}: ${count} alerts`, 25, y);
      y += 6;
    });
    y += 10;

    // Alert Details
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Alert Details:', 20, y);
    y += 10;

    doc.setFontSize(8);
    const maxAlertsInPDF = 50; // Limit to first 50 alerts
    filteredAlerts.slice(0, maxAlertsInPDF).forEach((alert, index) => {
      if (y > 270) { // Check if we need a new page
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(60);
      doc.text(`${index + 1}. ${alert.attack_type} [${alert.severity}]`, 20, y);
      y += 5;
      doc.setTextColor(100);
      doc.text(`   Source: ${alert.source_ip}${alert.source_port ? ':' + alert.source_port : ''}`, 20, y);
      y += 4;
      doc.text(`   Destination: ${alert.destination_ip || 'N/A'}${alert.destination_port ? ':' + alert.destination_port : ''}`, 20, y);
      y += 4;
      doc.text(`   Protocol: ${alert.protocol || 'N/A'}  |  Time: ${new Date(alert.created_at).toLocaleString()}`, 20, y);
      y += 7;
    });

    if (filteredAlerts.length > maxAlertsInPDF) {
      doc.text(`... and ${filteredAlerts.length - maxAlertsInPDF} more alerts`, 20, y);
    }

    doc.save(`securecore-alerts-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({
      title: 'PDF Exported',
      description: `Alert report with ${filteredAlerts.length} alerts has been downloaded.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Security Alerts</h2>
          <p className="text-muted-foreground">
            Monitor and respond to detected security threats.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
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
            Alert Activity ({timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'All Time'})
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
                    <td className="py-3 px-4 font-mono text-sm">{alert.source_ip}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.source_port || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.destination_ip || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-sm">{alert.destination_port || 'N/A'}</td>
                    <td className="py-3 px-4">{alert.protocol || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${severityColors[alert.severity] || 'bg-muted text-muted-foreground'}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(alert.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Add to List
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAddToBlocklist(alert.source_ip)}>
                            <Ban className="w-4 h-4 mr-2" />
                            Add to Blocklist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToWhitelist(alert.source_ip)}>
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
