import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Ban, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { blocklistAPI, whitelistAPI } from '@/services/api';

const ITEMS_PER_PAGE = 15;

interface BlockedIP {
  id: number;
  ip: string;
  reason: string;
  timestamp: string;
}

const initialBlocklist: BlockedIP[] = [
  { id: 1, ip: '192.168.1.105', reason: 'Multiple brute force attempts', timestamp: '2024-01-15 14:32:15' },
  { id: 2, ip: '10.0.0.45', reason: 'Port scanning activity', timestamp: '2024-01-15 12:18:42' },
  { id: 3, ip: '172.16.0.88', reason: 'DDoS source', timestamp: '2024-01-14 09:45:33' },
  { id: 4, ip: '192.168.2.201', reason: 'Malware distribution', timestamp: '2024-01-14 08:22:15' },
  { id: 5, ip: '10.0.1.33', reason: 'Suspicious activity', timestamp: '2024-01-13 16:55:08' },
  { id: 6, ip: '203.0.113.50', reason: 'Spam bot detected', timestamp: '2024-01-13 14:22:10' },
  { id: 7, ip: '198.51.100.23', reason: 'SQL injection attempts', timestamp: '2024-01-12 11:45:22' },
  { id: 8, ip: '192.0.2.100', reason: 'Credential stuffing', timestamp: '2024-01-12 09:18:45' },
  { id: 9, ip: '10.0.2.55', reason: 'XSS attack attempts', timestamp: '2024-01-11 16:33:20' },
  { id: 10, ip: '172.16.1.88', reason: 'Bot network activity', timestamp: '2024-01-11 14:15:30' },
  { id: 11, ip: '192.168.3.101', reason: 'Unauthorized API access', timestamp: '2024-01-10 12:45:15' },
  { id: 12, ip: '10.0.3.77', reason: 'Rate limit abuse', timestamp: '2024-01-10 10:22:08' },
  { id: 13, ip: '172.16.2.99', reason: 'Directory traversal attempt', timestamp: '2024-01-09 15:18:42' },
  { id: 14, ip: '192.168.4.150', reason: 'Malicious payload detected', timestamp: '2024-01-09 11:55:33' },
  { id: 15, ip: '10.0.4.120', reason: 'Repeated failed logins', timestamp: '2024-01-08 09:42:18' },
  { id: 16, ip: '172.16.3.45', reason: 'Suspicious user agent', timestamp: '2024-01-08 08:15:55' },
  { id: 17, ip: '192.168.5.200', reason: 'Known malware IP', timestamp: '2024-01-07 16:28:40' },
];

export default function BlocklistPage() {
  const [blocklist, setBlocklist] = useState<BlockedIP[]>(initialBlocklist);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlockedIP | null>(null);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [whitelistIPs, setWhitelistIPs] = useState<string[]>([]);
  const { toast } = useToast();

  // Load blocklist from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [blockData, whiteData] = await Promise.all([
          blocklistAPI.getBlocklist({ page: 1, per_page: 1000 }),
          whitelistAPI.getWhitelist({ page: 1, per_page: 1000 })
        ]);

        const mappedBlock = blockData.blocked_ips.map((item: any) => ({
          id: item.id,
          ip: item.ip_address,
          reason: item.reason,
          timestamp: new Date(item.created_at).toISOString().replace('T', ' ').substring(0, 19)
        }));
        setBlocklist(mappedBlock);
        setWhitelistIPs(whiteData.whitelisted_ips.map(item => item.ip_address));
      } catch (error) {
        // Silent fail as requested
      }
    };
    loadData();
  }, []);

  const filteredList = blocklist.filter(item =>
    item.ip.includes(searchTerm) || item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdd = async () => {
    if (!newIP || !newReason) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    // Check if already in blocklist
    if (blocklist.some(item => item.ip === newIP)) {
      toast({
        title: 'Error',
        description: `IP address ${newIP} is already in the blocklist.`,
        variant: 'destructive'
      });
      return;
    }

    // Check if in whitelist
    if (whitelistIPs.includes(newIP)) {
      toast({
        title: 'Error',
        description: `You can't add this IP to the blocklist because it's already in the whitelist.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = await blocklistAPI.blockIP(newIP, newReason);
      const newItem: BlockedIP = {
        id: (data as any).id || Date.now(),
        ip: newIP,
        reason: newReason,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setBlocklist([newItem, ...blocklist]);
      setNewIP('');
      setNewReason('');
      setIsAddOpen(false);
      toast({ title: 'IP Blocked', description: `${newIP} has been added to the blocklist.` });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || error.message || 'Failed to add IP to blocklist.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      await blocklistAPI.updateBlockedIP(editingItem.id, editingItem.reason);
      setBlocklist(blocklist.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setIsEditOpen(false);
      setEditingItem(null);
      toast({ title: 'Updated', description: 'Blocklist entry has been updated.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || error.message || 'Failed to update blocklist entry.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await blocklistAPI.unblockIP(id);
      setBlocklist(blocklist.filter(item => item.id !== id));
      toast({ title: 'Removed', description: 'IP has been removed from the blocklist.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove IP', variant: 'destructive' });
    }
  };

  const renderPaginationItems = () => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Block List</h2>
          <p className="text-muted-foreground">Manage blocked IP addresses.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add IP to Blocklist</DialogTitle>
              <DialogDescription>
                Enter the IP address you want to block.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.1"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Reason for blocking"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add to Blocklist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search IP or reason..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Blocked At</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="font-mono text-sm">{item.ip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{item.reason}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm hidden lg:table-cell">{item.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                  {renderPaginationItems()}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blocklist Entry</DialogTitle>
            <DialogDescription>
              Update the IP address or reason for blocking.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ip">IP Address</Label>
                <Input
                  id="edit-ip"
                  value={editingItem.ip}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Reason</Label>
                <Input
                  id="edit-reason"
                  value={editingItem.reason}
                  onChange={(e) => setEditingItem({ ...editingItem, reason: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
