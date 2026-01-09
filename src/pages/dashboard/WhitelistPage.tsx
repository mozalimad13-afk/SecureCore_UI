import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { whitelistAPI } from '@/services/api';

export default function WhitelistPage() {
  const [whitelistedIPs, setWhitelistedIPs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 15, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadWhitelistedIPs();
  }, [pagination.page]);

  const loadWhitelistedIPs = async () => {
    try {
      setLoading(true);
      const data = await whitelistAPI.getWhitelist({
        page: pagination.page,
        per_page: pagination.per_page,
        search: searchTerm,
      });
      setWhitelistedIPs(data.whitelisted_ips || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Failed to load whitelist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load whitelisted IPs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIP = async () => {
    if (!newIP || !newDescription) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both IP and description',
        variant: 'destructive',
      });
      return;
    }

    try {
      await whitelistAPI.addIP(newIP, newDescription);
      toast({
        title: 'IP Whitelisted',
        description: `Successfully whitelisted ${newIP}`,
      });
      setIsDialogOpen(false);
      setNewIP('');
      setNewDescription('');
      loadWhitelistedIPs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to whitelist IP',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveIP = async (id: number, ip: string) => {
    try {
      await whitelistAPI.removeIP(id);
      toast({
        title: 'IP Removed',
        description: `Successfully removed ${ip} from whitelist`,
      });
      loadWhitelistedIPs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove IP',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadWhitelistedIPs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IP Whitelist</h1>
        <p className="text-muted-foreground">
          Manage trusted IP addresses that are always allowed
        </p>
      </div>

      {/* Header with Search and Add */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by IP or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add IP to Whitelist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">IP Address</label>
                <Input
                  placeholder="192.168.1.100"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Office network"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleAddIP} className="w-full">
                Add to Whitelist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Whitelisted IPs List */}
      <Card>
        <CardHeader>
          <CardTitle>Whitelisted IPs ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : whitelistedIPs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No whitelisted IPs</div>
          ) : (
            <div className="space-y-2">
              {whitelistedIPs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.ip || item.ip_address}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.time || item.timestamp}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIP(item.id, item.ip || item.ip_address)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
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
