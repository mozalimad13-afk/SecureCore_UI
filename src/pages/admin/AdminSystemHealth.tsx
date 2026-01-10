import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database, Server, Cpu, HardDrive } from 'lucide-react';
import { adminAPI } from '@/services/api';
import { SystemHealth } from '@/types';

export default function AdminSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await adminAPI.getHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading system health...</div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load system health data
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor server and application status
        </p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${getStatusColor(health.overall_status)}`} />
            Overall Status: {health.overall_status?.toUpperCase()}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span>CPU</span>
              </div>
              <span className="font-medium">
                {health.server?.cpu?.usage_percent?.toFixed(1)}% ({health.server?.cpu?.cores} cores)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>Memory</span>
              </div>
              <span className="font-medium">
                {health.server?.memory?.usage_percent?.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span>Disk</span>
              </div>
              <span className="font-medium">
                {health.server?.disk?.usage_percent?.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Database Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={`font-medium ${getStatusColor(health.database?.status)}`}>
                {health.database?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Records</span>
              <span className="font-medium">{health.database?.total_records?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Type</span>
              <span className="font-medium">{health.database?.type || 'SQLite'}</span>
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={`font-medium ${getStatusColor(health.api?.status)}`}>
                {health.api?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Endpoints</span>
              <span className="font-medium">{health.api?.endpoints_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <span className="font-medium">{health.api?.environment || 'development'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Application Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className={`font-medium ${getStatusColor(health.application?.status)}`}>
                {health.application?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>ML Inference</span>
              <span className="font-medium">{health.application?.ml_inference}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WebSocket</span>
              <span className="font-medium">{health.application?.websocket_server}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Counts */}
      {health.database?.table_counts && (
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(health.database.table_counts as Record<string, number>).map(([table, count]) => (
                <div key={table} className="p-3 border rounded">
                  <div className="text-sm text-muted-foreground capitalize">{table}</div>
                  <div className="text-2xl font-bold">{count?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
