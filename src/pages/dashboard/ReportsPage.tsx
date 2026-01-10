import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { reportsAPI } from '@/services/api';
import { ReportPreview } from '@/types';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handlePreview = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = await reportsAPI.preview(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setPreview(data.preview);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to preview report',
        variant: 'destructive',
      });
    }
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      await reportsAPI.generate(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      toast({
        title: 'Report Generated',
        description: 'Your PDF report is being downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate comprehensive security reports for any time period
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handlePreview} className="w-full" variant="outline">
              Preview Report
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a date range and click Preview to see report summary
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <div className="text-2xl font-bold">{preview.alert_count}</div>
                    <div className="text-sm text-muted-foreground">Alerts</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-2xl font-bold">{preview.blocked_ip_count}</div>
                    <div className="text-sm text-muted-foreground">Blocked IPs</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-2xl font-bold">{preview.whitelisted_ip_count}</div>
                    <div className="text-sm text-muted-foreground">Whitelisted IPs</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-2xl font-bold">{preview.total_records}</div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Period: {format(new Date(preview.start_date), 'PPP')} to {format(new Date(preview.end_date), 'PPP')}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a comprehensive PDF report including alerts, blocked IPs, whitelisted IPs, and security statistics for the selected period.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={!startDate || !endDate || generating}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Download PDF Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Report Features */}
      <Card>
        <CardHeader>
          <CardTitle>Report Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Executive summary with key metrics</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Detailed alert table (up to 50 most recent)</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Blocked IP addresses with reasons</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Whitelisted IP addresses</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Professional formatting and color-coded sections</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
