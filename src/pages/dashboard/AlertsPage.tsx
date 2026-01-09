import { useState, useEffect } from 'react';
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
import { Search, Download, Ban, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { alertsAPI, blocklistAPI, whitelistAPI } from '@/services/api';

const severityColors: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-destructive/10 text-destructive',
  Critical: 'bg-purple-500/10 text-purple-500',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 15, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, [pagination.page, severityFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        per_page: pagination.per_page,
      };

      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }

      const data = await alertsAPI.getAlerts(params);
      setAlerts(data.alerts || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadAlerts();
  };

  const handleBlockIP = async (ip: string) => {
    try {
      await blocklistAPI.blockIP(ip, 'Blocked from alerts page');
      toast({
        title: 'IP Blocked',
        description: `${ip} has been blocked`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block IP',
        variant: 'destructive',
      });
    }
  };

  const handleWhitelistIP = async (ip: string) => {
    try {
      await whitelistAPI.addIP(ip, 'Whitelisted from alerts page');
      toast({
        title: 'IP Whitelisted',
        description: `${ip} has been whitelisted`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to whitelist IP',
        variant: 'destructive',
      });
    }
  };

  const filteredAlerts = searchTerm
    ? alerts.filter(alert =>
      alert.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : alerts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and manage security threats detected by the system
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by IP or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
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
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alerts ({pagination.total})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No alerts found</div>
          ) : (
            <div className="space-y-2">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${severityColors[alert.severity]}`}>
                      {alert.severity}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{alert.ip || alert.source_ip}</div>
                      <div className="text-sm text-muted-foreground">{alert.type || alert.attack_type}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{alert.time || alert.timestamp}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBlockIP(alert.ip || alert.source_ip)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Block IP
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleWhitelistIP(alert.ip || alert.source_ip)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Whitelist IP
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => pagination.page > 1 && setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          isActive={pagination.page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => pagination.page < pagination.pages && setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      className={pagination.page === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
