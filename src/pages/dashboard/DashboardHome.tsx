import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Activity, Ban, ShieldCheck } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useNotificationPopup } from '@/contexts/NotificationPopupContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { alertsAPI, blocklistAPI, whitelistAPI } from '@/services/api';

const severityColors: Record<string, string> = {
  'Low': 'bg-green-500',
  'Medium': 'bg-yellow-500',
  'High': 'bg-orange-500',
  'Critical': 'bg-red-500',
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showNotification } = useNotificationPopup();

  const [stats, setStats] = useState({
    total_today: 0,
    blocked_threats: 0,
    whitelisted_count: 0,
    network_health: 98.5,
  });

  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsData = await alertsAPI.getStats();
      setStats({
        total_today: statsData.total_today || 0,
        blocked_threats: statsData.blocked_threats || 0,
        whitelisted_count: 0, // Will fetch separately
        network_health: 98.5, // Placeholder
      });

      // Fetch recent alerts
      const recentData = await alertsAPI.getRecent(5);
      setRecentAlerts(recentData.recent_alerts || []);

      // Process weekly trend for line chart
      if (statsData.weekly_trend) {
        const chartData = statsData.weekly_trend.map((day: any) => ({
          name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          alerts: day.alerts,
          blocked: day.blocked,
        }));
        setLineChartData(chartData);
      }

      // Process severity distribution for pie chart
      if (statsData.severity_distribution) {
        const pie = [
          { name: 'Low', value: statsData.severity_distribution.Low || 0, color: '#22c55e' },
          { name: 'Medium', value: statsData.severity_distribution.Medium || 0, color: '#f59e0b' },
          { name: 'High', value: statsData.severity_distribution.High || 0, color: '#ef4444' },
          { name: 'Critical', value: statsData.severity_distribution.Critical || 0, color: '#7c3aed' },
        ];
        setPieData(pie);
      }

      // Fetch whitelist count
      const whitelistData = await whitelistAPI.getWhitelist({ per_page: 1 });
      if (whitelistData.pagination) {
        setStats(prev => ({ ...prev, whitelisted_count: whitelistData.pagination.total }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error loading dashboard',
        description: 'Could not fetch dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (ip: string) => {
    try {
      await blocklistAPI.blockIP(ip, 'Blocked from dashboard');
      toast({
        title: 'IP Blocked',
        description: `Successfully blocked ${ip}`,
      });
      showNotification({
        title: 'IP Blocked',
        message: `${ip} has been added to the blocklist`,
        type: 'info',
      });
      loadDashboardData(); // Refresh data
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
      await whitelistAPI.addIP(ip, 'Whitelisted from dashboard');
      toast({
        title: 'IP Whitelisted',
        description: `Successfully whitelisted ${ip}`,
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to whitelist IP',
        variant: 'destructive',
      });
    }
  };

  const statsData = [
    { title: 'Total Alerts Today', value: stats.total_today.toString(), icon: AlertTriangle, color: 'text-warning' },
    { title: 'Blocked Threats', value: stats.blocked_threats.toString(), icon: Shield, color: 'text-destructive' },
    { title: 'Whitelisted IPs', value: stats.whitelisted_count.toString(), icon: CheckCircle, color: 'text-success' },
    { title: 'Network Health', value: `${stats.network_health}%`, icon: Activity, color: 'text-primary' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your security overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Line Chart - Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={2} name="Alerts" />
                <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} name="Blocked" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent alerts
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${severityColors[alert.severity]}`}></div>
                    <div>
                      <div className="font-medium">{alert.ip}</div>
                      <div className="text-sm text-muted-foreground">{alert.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBlockIP(alert.ip)}>
                          <Ban className="mr-2 h-4 w-4" />
                          <span>Block IP</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhitelistIP(alert.ip)}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>Whitelist IP</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
