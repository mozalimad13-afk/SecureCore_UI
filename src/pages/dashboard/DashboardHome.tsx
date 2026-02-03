import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Shield, AlertTriangle, Activity, Ban, CheckCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { alertsAPI, blocklistAPI, whitelistAPI } from '@/services/api';
import { Alert, AlertStats } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#7c3aed',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  Critical: '#7c3aed',
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

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

const getTimeRangeTitle = (range: string) => {
  switch (range) {
    case 'all': return 'All Time';
    case 'month': return 'This Month';
    case 'quarter': return 'This Quarter';
    case 'year': return 'This Year';
    default: return 'All Time';
  }
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { canViewBlocklist, canViewWhitelist, canManageBlocklist, canManageWhitelist } = useUserRole();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [blocklistCount, setBlocklistCount] = useState(0);
  const [whitelistCount, setWhitelistCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, recentData, blocklistData, whitelistData] = await Promise.all([
          alertsAPI.getStats('today'),
          alertsAPI.getRecentAlerts(),
          canViewBlocklist ? blocklistAPI.getBlocklist({ per_page: 1 }).catch(() => null) : Promise.resolve(null),
          canViewWhitelist ? whitelistAPI.getWhitelist({ per_page: 1 }).catch(() => null) : Promise.resolve(null)
        ]);

        setStats(statsData);
        setRecentAlerts(recentData.recent_alerts);
        if (blocklistData) setBlocklistCount(blocklistData.pagination.total);
        if (whitelistData) setWhitelistCount(whitelistData.pagination.total);

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, canViewBlocklist, canViewWhitelist]);

  const handleAction = async (action: 'block' | 'whitelist', ip?: string) => {
    if (!ip) return;

    if (action === 'block' && !canManageBlocklist) {
      toast({ title: 'Permission Denied', description: 'You do not have permission to block IPs.', variant: 'destructive' });
      return;
    }
    if (action === 'whitelist' && !canManageWhitelist) {
      toast({ title: 'Permission Denied', description: 'You do not have permission to whitelist IPs.', variant: 'destructive' });
      return;
    }

    try {
      if (action === 'block') {
        await blocklistAPI.blockIP(ip, 'Added from Dashboard');
        toast({ title: 'Success', description: `IP ${ip} blocked.` });
      } else {
        await whitelistAPI.addIP(ip, 'Added from Dashboard');
        toast({ title: 'Success', description: `IP ${ip} whitelisted.` });
      }

      // Refresh the blocklist/whitelist counts
      const [blocklistData, whitelistData] = await Promise.all([
        canViewBlocklist ? blocklistAPI.getBlocklist({ per_page: 1 }).catch(() => null) : Promise.resolve(null),
        canViewWhitelist ? whitelistAPI.getWhitelist({ per_page: 1 }).catch(() => null) : Promise.resolve(null)
      ]);
      if (blocklistData) setBlocklistCount(blocklistData.pagination.total);
      if (whitelistData) setWhitelistCount(whitelistData.pagination.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || error.message || `Failed to ${action} IP.`,
        variant: 'destructive'
      });
    }
  };

  // Prepare Data for Charts
  const pieDataRaw = stats ? Object.entries(stats.severity_distribution).map(([name, value]) => ({
    name,
    value,
    color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS] || '#888888'
  })) : [];

  const hasPieData = pieDataRaw.some(item => item.value > 0);
  const pieData = hasPieData
    ? pieDataRaw.filter(item => item.value > 0)
    : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]; // Light grey for empty state

  const lineChartData = stats ? stats.weekly_trend.map((day) => ({
    name: day.date,
    alerts: day.alerts,
    blocked: day.blocked
  })) : [];

  const totalAlerts = stats ? Object.values(stats.severity_distribution).reduce((sum, count) => sum + count, 0) : 0;

  const statsData = [
    {
      title: 'Total Alerts Today',
      value: stats?.total_today?.toString() || '0',
      icon: AlertTriangle,
      color: 'text-warning'
    },
    {
      title: 'Blocked Threats',
      value: blocklistCount.toString(),
      icon: Shield,
      color: 'text-destructive'
    },
    {
      title: 'Whitelisted IPs',
      value: whitelistCount.toString(),
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Network Health',
      value: stats?.system_status ? (stats.system_status.charAt(0).toUpperCase() + stats.system_status.slice(1)) : '...',
      icon: Activity,
      color: stats?.system_status === 'healthy' ? 'text-primary' : 'text-warning'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Here's what's happening with your network security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alerts Overview - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="alerts" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="blocked" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [name === 'No Data' ? 0 : value, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: '#000000'
                    }}
                    itemStyle={{ color: '#000000' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {!hasPieData ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <span className="text-sm font-medium">No Data: 0</span>
                  </div>
                ) : (
                  pieDataRaw.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name} {item.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/alerts')}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Source</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-foreground">No recent alerts.</td>
                  </tr>
                ) : (
                  recentAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">{alert.source_ip}</td>
                      <td className="py-3 px-4">{alert.attack_type || 'Suspicious'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${severityColors[alert.severity] || 'bg-muted text-muted-foreground'}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {new Date(alert.created_at || '').toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Add to List</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('block', alert.source_ip)}>
                              <Ban className="w-4 h-4 mr-2" />
                              Add to Blocklist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('whitelist', alert.source_ip)}>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Add to Whitelist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
