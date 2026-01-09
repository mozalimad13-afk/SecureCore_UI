import { useState } from 'react';
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
import { CheckCircle, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 15;

interface WhitelistedIP {
  id: number;
  ip: string;
  description: string;
  timestamp: string;
}

const initialWhitelist: WhitelistedIP[] = [
  { id: 1, ip: '10.0.0.1', description: 'Main office gateway', timestamp: '2024-01-15 10:15:22' },
  { id: 2, ip: '192.168.1.0/24', description: 'Internal network subnet', timestamp: '2024-01-14 14:32:45' },
  { id: 3, ip: '172.16.0.50', description: 'Backup server', timestamp: '2024-01-12 09:08:33' },
  { id: 4, ip: '10.0.1.100', description: 'Development server', timestamp: '2024-01-10 16:42:18' },
  { id: 5, ip: '192.168.2.1', description: 'Branch office router', timestamp: '2024-01-08 11:25:55' },
  { id: 6, ip: '10.0.2.50', description: 'Monitoring server', timestamp: '2024-01-07 09:15:30' },
  { id: 7, ip: '172.16.1.100', description: 'Database server', timestamp: '2024-01-06 14:22:18' },
  { id: 8, ip: '192.168.3.0/24', description: 'Guest network', timestamp: '2024-01-05 11:45:42' },
  { id: 9, ip: '10.0.3.75', description: 'Load balancer', timestamp: '2024-01-04 16:33:55' },
  { id: 10, ip: '172.16.2.25', description: 'API gateway', timestamp: '2024-01-03 10:18:22' },
  { id: 11, ip: '192.168.4.10', description: 'CI/CD server', timestamp: '2024-01-02 08:55:15' },
  { id: 12, ip: '10.0.4.200', description: 'Staging server', timestamp: '2024-01-01 15:42:30' },
  { id: 13, ip: '172.16.3.150', description: 'VPN gateway', timestamp: '2023-12-31 12:28:45' },
  { id: 14, ip: '192.168.5.0/24', description: 'Server room subnet', timestamp: '2023-12-30 09:15:18' },
  { id: 15, ip: '10.0.5.100', description: 'DNS server', timestamp: '2023-12-29 16:45:55' },
  { id: 16, ip: '172.16.4.75', description: 'Mail server', timestamp: '2023-12-28 11:22:33' },
  { id: 17, ip: '192.168.6.50', description: 'Log aggregator', timestamp: '2023-12-27 14:55:42' },
];

export default function WhitelistPage() {
  const [whitelist, setWhitelist] = useState<WhitelistedIP[]>(initialWhitelist);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhitelistedIP | null>(null);
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filteredList = whitelist.filter(item => 
    item.ip.includes(searchTerm) || item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdd = () => {
    if (!newIP || !newDescription) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    const newItem: WhitelistedIP = {
      id: Date.now(),
      ip: newIP,
      description: newDescription,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    
    setWhitelist([newItem, ...whitelist]);
    setNewIP('');
    setNewDescription('');
    setIsAddOpen(false);
    toast({ title: 'IP Whitelisted', description: `${newIP} has been added to the whitelist.` });
  };

  const handleEdit = () => {
    if (!editingItem) return;
    
    setWhitelist(whitelist.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setIsEditOpen(false);
    setEditingItem(null);
    toast({ title: 'Updated', description: 'Whitelist entry has been updated.' });
  };

  const handleDelete = (id: number) => {
    setWhitelist(whitelist.filter(item => item.id !== id));
    toast({ title: 'Removed', description: 'IP has been removed from the whitelist.' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="font-mono text-sm">{item.ip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{item.description}</td>
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
            <DialogTitle>Edit Whitelist Entry</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ip">IP Address</Label>
                <Input 
                  id="edit-ip" 
                  value={editingItem.ip}
                  onChange={(e) => setEditingItem({ ...editingItem, ip: e.target.value })}
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
