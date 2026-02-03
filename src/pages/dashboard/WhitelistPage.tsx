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
import { CheckCircle, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { whitelistAPI, blocklistAPI } from '@/services/api';

const ITEMS_PER_PAGE = 15;

interface WhitelistedIP {
  id: number;
  ip: string;
  description: string;
  timestamp: string;
}

export default function WhitelistPage() {
  const { canViewWhitelist, canManageWhitelist } = useUserRole();
  const [whitelist, setWhitelist] = useState<WhitelistedIP[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhitelistedIP | null>(null);
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blocklistIPs, setBlocklistIPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!canViewWhitelist) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [whiteData, blockData] = await Promise.all([
          whitelistAPI.getWhitelist({ page: 1, per_page: 1000 }).catch(() => ({ whitelisted_ips: [] })),
          blocklistAPI.getBlocklist({ page: 1, per_page: 1000 }).catch(() => ({ blocked_ips: [] }))
        ]);

        type WhitelistedIPApi = { id: number; ip_address: string; description?: string | null; created_at?: string | null };
        const mappedWhite = (whiteData.whitelisted_ips as WhitelistedIPApi[]).map((item) => ({
          id: item.id,
          ip: item.ip_address,
          description: item.description || '',
          timestamp: item.created_at
            ? new Date(item.created_at).toISOString().replace('T', ' ').substring(0, 19)
            : new Date().toISOString().replace('T', ' ').substring(0, 19)
        }));
        setWhitelist(mappedWhite);
        type BlockedIPApi = { ip_address: string };
        setBlocklistIPs((blockData.blocked_ips as BlockedIPApi[]).map((item) => item.ip_address));
      } catch (error) {
        // Silent fail as requested
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [canViewWhitelist]);

  const filteredList = whitelist.filter(item =>
    item.ip.includes(searchTerm) || item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdd = async () => {
    if (!newIP || !newDescription) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    // Check if already in whitelist
    if (whitelist.some(item => item.ip === newIP)) {
      toast({
        title: 'Error',
        description: `IP address ${newIP} is already in the whitelist.`,
        variant: 'destructive'
      });
      return;
    }

    // Check if in blocklist
    if (blocklistIPs.includes(newIP)) {
      toast({
        title: 'Error',
        description: `You can't add this IP to the whitelist because it's already in the blocklist.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = await whitelistAPI.addIP(newIP, newDescription);
      const newItem: WhitelistedIP = {
        id: (data as { id?: number }).id || Date.now(),
        ip: newIP,
        description: newDescription,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setWhitelist([newItem, ...whitelist]);
      setNewIP('');
      setNewDescription('');
      setIsAddOpen(false);
      toast({ title: 'IP Whitelisted', description: `${newIP} has been added to the whitelist.` });
    } catch (error: unknown) {
      const err = error as { error?: string; message?: string };
      toast({
        title: 'Error',
        description: err.error || err.message || 'Failed to add IP to whitelist.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      await whitelistAPI.updateWhitelistedIP(editingItem.id, editingItem.description);
      setWhitelist(whitelist.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setIsEditOpen(false);
      setEditingItem(null);
      toast({ title: 'Updated', description: 'Whitelist entry has been updated.' });
    } catch (error: unknown) {
      const err = error as { error?: string; message?: string };
      toast({
        title: 'Error',
        description: err.error || err.message || 'Failed to update whitelist entry.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await whitelistAPI.removeIP(id);
      setWhitelist(whitelist.filter(item => item.id !== id));
      toast({ title: 'Removed', description: 'IP has been removed from the whitelist.' });
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
          <h2 className="text-2xl font-bold mb-2">White List</h2>
          <p className="text-muted-foreground">Manage trusted IP addresses.</p>
        </div>
        {canManageWhitelist && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add IP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add IP to Whitelist</DialogTitle>
                <DialogDescription>
                  Enter the IP address you want to whitelist.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address or CIDR</Label>
                  <Input
                    id="ip"
                    placeholder="192.168.1.1 or 10.0.0.0/24"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description of this IP"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add to Whitelist</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search IP or description..."
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Added At</th>
                  {canManageWhitelist && <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canManageWhitelist ? 4 : 3} className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={canManageWhitelist ? 4 : 3} className="text-center py-10 text-muted-foreground">
                      No whitelisted IPs found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="font-mono text-sm">{item.ip}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{item.description}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm hidden lg:table-cell">{item.timestamp}</td>
                      {canManageWhitelist && (
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
                      )}
                    </tr>
                  ))
                )}
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
            <DialogTitle>Edit Whitelist Entry</DialogTitle>
            <DialogDescription>
              Update the IP address or description.
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
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
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
