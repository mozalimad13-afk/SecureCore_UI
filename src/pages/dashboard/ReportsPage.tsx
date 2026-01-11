import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Download, FileText, Calendar, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const monthlyData = [
  { month: 'Jan', alerts: 1240, blocked: 420 },
  { month: 'Feb', alerts: 1580, blocked: 580 },
  { month: 'Mar', alerts: 1320, blocked: 490 },
  { month: 'Apr', alerts: 1890, blocked: 720 },
  { month: 'May', alerts: 1650, blocked: 610 },
  { month: 'Jun', alerts: 2100, blocked: 890 },
];

const threatTrend = [
  { date: '01', value: 120 },
  { date: '05', value: 180 },
  { date: '10', value: 150 },
  { date: '15', value: 220 },
  { date: '20', value: 190 },
  { date: '25', value: 280 },
  { date: '30', value: 240 },
];

const reports = [
  { id: 1, name: 'Monthly Security Summary - January 2024', date: '2024-01-31', size: '2.4 MB', type: 'PDF' },
  { id: 2, name: 'Weekly Threat Analysis - Week 4', date: '2024-01-28', size: '1.8 MB', type: 'PDF' },
  { id: 3, name: 'Quarterly Compliance Report Q4 2023', date: '2024-01-15', size: '5.2 MB', type: 'PDF' },
  { id: 4, name: 'Incident Response Report - DDoS Attack', date: '2024-01-12', size: '890 KB', type: 'PDF' },
  { id: 5, name: 'Network Traffic Analysis - December', date: '2024-01-05', size: '3.1 MB', type: 'PDF' },
];

export default function ReportsPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reportType, setReportType] = useState('security');
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!fromDate || !toDate) {
      toast({ title: 'Error', description: 'Please select both start and end dates.', variant: 'destructive' });
      return;
    }

    if (fromDate > toDate) {
      toast({ title: 'Error', description: 'Start date must be before end date.', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SecureCore Security Report', 20, 20);
    
    // Report info
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType === 'security' ? 'Security Summary' : reportType === 'threat' ? 'Threat Analysis' : reportType === 'compliance' ? 'Compliance Report' : 'Traffic Analysis'}`, 20, 35);
    doc.text(`Period: ${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`, 20, 42);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 49);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('Executive Summary', 20, 65);
    doc.setFontSize(10);
    doc.text('This report provides a comprehensive overview of security events during the selected period.', 20, 75);
    
    // Stats
    doc.setFontSize(12);
    doc.text('Key Metrics:', 20, 90);
    doc.setFontSize(10);
    doc.text('• Total Alerts Detected: 2,547', 25, 100);
    doc.text('• Threats Blocked: 892', 25, 108);
    doc.text('• Detection Rate: 99.2%', 25, 116);
    doc.text('• Average Response Time: 45ms', 25, 124);
    
    // Severity breakdown
    doc.setFontSize(12);
    doc.text('Severity Breakdown:', 20, 140);
    doc.setFontSize(10);
    doc.text('• Critical: 127 (5%)', 25, 150);
    doc.text('• High: 458 (18%)', 25, 158);
    doc.text('• Medium: 814 (32%)', 25, 166);
    doc.text('• Low: 1,148 (45%)', 25, 174);
    
    // Recommendations
    doc.setFontSize(12);
    doc.text('Recommendations:', 20, 190);
    doc.setFontSize(10);
    doc.text('1. Review and update blocklist for recurring threat sources', 25, 200);
    doc.text('2. Enable additional monitoring for critical assets', 25, 208);
    doc.text('3. Schedule regular security audits', 25, 216);
    
    const fileName = `securecore-${reportType}-report-${format(fromDate, 'yyyy-MM-dd')}-to-${format(toDate, 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
    setIsGenerateOpen(false);
    toast({ title: 'Report generated', description: `${fileName} has been downloaded.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Reports</h2>
          <p className="text-muted-foreground">View and download comprehensive security reports.</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Select a date range and report type to generate a custom security report.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security">Security Summary</SelectItem>
                      <SelectItem value="threat">Threat Analysis</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                      <SelectItem value="traffic">Traffic Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateReport}>Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">9,780</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                <p className="text-2xl font-bold">3,710</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold">99.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="alerts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="blocked" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
