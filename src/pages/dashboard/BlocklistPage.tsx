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
import { Ban, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
];

export default function BlocklistPage() {
  const [blocklist, setBlocklist] = useState<BlockedIP[]>(initialBlocklist);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlockedIP | null>(null);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const { toast } = useToast();

  const filteredList = blocklist.filter(item => 
    item.ip.includes(searchTerm) || item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newIP || !newReason) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    const newItem: BlockedIP = {
      id: Date.now(),
      ip: newIP,
      reason: newReason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    
    setBlocklist([newItem, ...blocklist]);
    setNewIP('');
    setNewReason('');
    setIsAddOpen(false);
    toast({ title: 'IP Blocked', description: `${newIP} has been added to the blocklist.` });
  };

  const handleEdit = () => {
    if (!editingItem) return;
    
    setBlocklist(blocklist.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setIsEditOpen(false);
    setEditingItem(null);
    toast({ title: 'Updated', description: 'Blocklist entry has been updated.' });
  };

  const handleDelete = (id: number) => {
    setBlocklist(blocklist.filter(item => item.id !== id));
    toast({ title: 'Removed', description: 'IP has been removed from the blocklist.' });
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
            <DialogFooter>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Blocked At</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-destructive" />
                        <span className="font-mono">{item.ip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.reason}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{item.timestamp}</td>
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blocklist Entry</DialogTitle>
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
                <Label htmlFor="edit-reason">Reason</Label>
                <Input 
                  id="edit-reason" 
                  value={editingItem.reason}
                  onChange={(e) => setEditingItem({ ...editingItem, reason: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
