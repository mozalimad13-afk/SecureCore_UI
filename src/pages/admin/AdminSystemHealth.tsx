import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Cloud,
  Globe
} from 'lucide-react';

const systemStatus = [
  { 
    name: 'Website', 
    status: 'operational', 
    uptime: '99.99%', 
    responseTime: '45ms',
    icon: Globe 
  },
  { 
    name: 'API Server', 
    status: 'operational', 
    uptime: '99.95%', 
    responseTime: '120ms',
    icon: Server 
  },
  { 
    name: 'Database', 
    status: 'operational', 
    uptime: '99.99%', 
    responseTime: '15ms',
    icon: Database 
  },
  { 
    name: 'ML Engine', 
    status: 'operational', 
    uptime: '99.90%', 
    responseTime: '250ms',
    icon: Activity 
  },
];

const cloudResources = [
  { name: 'CPU Usage', value: 42, max: 100, unit: '%', icon: Cpu, color: 'bg-primary' },
  { name: 'Memory', value: 12.4, max: 32, unit: 'GB', icon: HardDrive, color: 'bg-accent' },
  { name: 'Storage', value: 245, max: 500, unit: 'GB', icon: Database, color: 'bg-warning' },
  { name: 'Network I/O', value: 2.4, max: 10, unit: 'Gbps', icon: Wifi, color: 'bg-success' },
];

const recentIncidents = [
  { id: 1, type: 'warning', message: 'High CPU usage detected on API server', time: '2 hours ago', resolved: true },
  { id: 2, type: 'info', message: 'Scheduled maintenance completed', time: '1 day ago', resolved: true },
  { id: 3, type: 'warning', message: 'Database connection pool reaching limit', time: '3 days ago', resolved: true },
];

export default function AdminSystemHealth() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">System Health</h2>
        <p className="text-muted-foreground">Monitor infrastructure status and resource usage.</p>
      </div>

      {/* Overall Status */}
      <Card className="border-success/50 bg-success/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <p className="text-lg font-semibold text-success">All Systems Operational</p>
              <p className="text-sm text-muted-foreground">Last checked: Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStatus.map((service) => (
          <Card key={service.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <service.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge variant={service.status === 'operational' ? 'default' : 'destructive'} 
                       className={service.status === 'operational' ? 'bg-success text-success-foreground' : ''}>
                  {service.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response</span>
                  <span className="font-medium">{service.responseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cloud Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Resource Usage
          </CardTitle>
          <CardDescription>Current resource utilization across infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cloudResources.map((resource) => (
            <div key={resource.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <resource.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{resource.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {resource.value} / {resource.max} {resource.unit}
                </span>
              </div>
              <Progress 
                value={(resource.value / resource.max) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Server Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,247</p>
            <p className="text-sm text-success">+12% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requests/min</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8,432</p>
            <p className="text-sm text-muted-foreground">Average over 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0.02%</p>
            <p className="text-sm text-success">Below threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    incident.type === 'warning' ? 'text-warning' : 'text-primary'
                  }`} />
                  <div>
                    <p className="font-medium">{incident.message}</p>
                    <p className="text-sm text-muted-foreground">{incident.time}</p>
                  </div>
                </div>
                <Badge variant={incident.resolved ? 'default' : 'destructive'}
                       className={incident.resolved ? 'bg-success text-success-foreground' : ''}>
                  {incident.resolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
