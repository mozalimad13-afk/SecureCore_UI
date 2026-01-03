import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, AlertTriangle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const statsData = [
  { title: 'Total Users', value: '2,847', change: '+12%', icon: Users, positive: true },
  { title: 'Active Subscriptions', value: '1,924', change: '+8%', icon: CreditCard, positive: true },
  { title: 'Total Alerts Today', value: '12,458', change: '-5%', icon: AlertTriangle, positive: false },
  { title: 'System Health', value: '99.9%', change: '+0.1%', icon: Activity, positive: true },
];

const userGrowth = [
  { month: 'Jul', users: 1200 },
  { month: 'Aug', users: 1450 },
  { month: 'Sep', users: 1680 },
  { month: 'Oct', users: 1920 },
  { month: 'Nov', users: 2340 },
  { month: 'Dec', users: 2580 },
  { month: 'Jan', users: 2847 },
];

const revenue = [
  { month: 'Jul', revenue: 42500 },
  { month: 'Aug', revenue: 48200 },
  { month: 'Sep', revenue: 55800 },
  { month: 'Oct', revenue: 62400 },
  { month: 'Nov', revenue: 71200 },
  { month: 'Dec', revenue: 78500 },
  { month: 'Jan', revenue: 84700 },
];

const recentUsers = [
  { id: 1, name: 'John Smith', email: 'john@techcorp.com', plan: 'Enterprise', status: 'Active', date: '2024-01-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@dataflow.io', plan: 'Small Companies', status: 'Active', date: '2024-01-14' },
  { id: 3, name: 'Mike Chen', email: 'mike@securenet.com', plan: 'Enterprise', status: 'Trial', date: '2024-01-14' },
  { id: 4, name: 'Emily Davis', email: 'emily@cloudguard.co', plan: 'Small Companies', status: 'Active', date: '2024-01-13' },
  { id: 5, name: 'Alex Wilson', email: 'alex@startup.io', plan: 'Free Trial', status: 'Trial', date: '2024-01-13' },
];

const statusColors: Record<string, string> = {
  Active: 'bg-success/10 text-success',
  Trial: 'bg-warning/10 text-warning',
  Expired: 'bg-destructive/10 text-destructive',
};

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Overview</h2>
        <p className="text-muted-foreground">Monitor system performance and user activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                    {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">{user.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{user.date}</td>
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
