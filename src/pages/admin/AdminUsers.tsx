import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, MoreHorizontal, Ban, Mail, Eye, UserCog, CheckCircle, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const USERS_PER_PAGE = 15;

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  plan: string;
  status: 'Active' | 'Trial' | 'Suspended' | 'Expired';
  alerts: number;
  joined: string;
  paymentInfo: {
    cardLast4: string;
    cardExpiry: string;
    billingAddress: string;
    lastPayment: string;
    nextPayment: string;
  };
}

const initialUsers: User[] = [
  { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp', plan: 'Enterprise', status: 'Active', alerts: 1247, joined: '2023-06-15', paymentInfo: { cardLast4: '4242', cardExpiry: '12/2025', billingAddress: '123 Tech St, SF CA', lastPayment: '2024-01-01', nextPayment: '2024-02-01' } },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@dataflow.io', company: 'DataFlow', plan: 'Small Companies', status: 'Active', alerts: 856, joined: '2023-08-22', paymentInfo: { cardLast4: '5555', cardExpiry: '08/2026', billingAddress: '456 Data Ave, NYC NY', lastPayment: '2024-01-05', nextPayment: '2024-02-05' } },
  { id: 3, name: 'Mike Chen', email: 'mike@securenet.com', company: 'SecureNet', plan: 'Enterprise', status: 'Trial', alerts: 342, joined: '2024-01-05', paymentInfo: { cardLast4: '1234', cardExpiry: '03/2027', billingAddress: '789 Secure Blvd, LA CA', lastPayment: 'N/A', nextPayment: '2024-01-19' } },
  { id: 4, name: 'Emily Davis', email: 'emily@cloudguard.co', company: 'CloudGuard', plan: 'Small Companies', status: 'Active', alerts: 1589, joined: '2023-04-10', paymentInfo: { cardLast4: '9876', cardExpiry: '11/2025', billingAddress: '321 Cloud Ln, Seattle WA', lastPayment: '2024-01-10', nextPayment: '2024-02-10' } },
  { id: 5, name: 'Alex Wilson', email: 'alex@startup.io', company: 'StartupIO', plan: 'Free Trial', status: 'Trial', alerts: 124, joined: '2024-01-12', paymentInfo: { cardLast4: '6789', cardExpiry: '05/2026', billingAddress: '555 Startup Way, Austin TX', lastPayment: 'N/A', nextPayment: '2024-01-26' } },
  { id: 6, name: 'Lisa Brown', email: 'lisa@enterprise.com', company: 'Enterprise Inc', plan: 'Enterprise', status: 'Suspended', alerts: 0, joined: '2023-02-28', paymentInfo: { cardLast4: '4321', cardExpiry: '09/2024', billingAddress: '999 Enterprise Dr, Chicago IL', lastPayment: '2023-12-28', nextPayment: 'Suspended' } },
  { id: 7, name: 'Tom Anderson', email: 'tom@security.net', company: 'SecurityNet', plan: 'Small Companies', status: 'Active', alerts: 2341, joined: '2023-05-17', paymentInfo: { cardLast4: '8765', cardExpiry: '07/2026', billingAddress: '777 Security Rd, Boston MA', lastPayment: '2024-01-17', nextPayment: '2024-02-17' } },
  { id: 8, name: 'Jane Miller', email: 'jane@protect.io', company: 'Protect.io', plan: 'Enterprise', status: 'Active', alerts: 4521, joined: '2022-11-03', paymentInfo: { cardLast4: '2468', cardExpiry: '02/2027', billingAddress: '888 Protect Pkwy, Denver CO', lastPayment: '2024-01-03', nextPayment: '2024-02-03' } },
  { id: 9, name: 'David Lee', email: 'david@cyberguard.com', company: 'CyberGuard', plan: 'Enterprise', status: 'Active', alerts: 3210, joined: '2023-03-20', paymentInfo: { cardLast4: '1357', cardExpiry: '04/2026', billingAddress: '100 Cyber Way, Miami FL', lastPayment: '2024-01-20', nextPayment: '2024-02-20' } },
  { id: 10, name: 'Rachel Green', email: 'rachel@infosec.io', company: 'InfoSec', plan: 'Small Companies', status: 'Active', alerts: 892, joined: '2023-07-11', paymentInfo: { cardLast4: '2468', cardExpiry: '09/2025', billingAddress: '200 Info Blvd, Portland OR', lastPayment: '2024-01-11', nextPayment: '2024-02-11' } },
  { id: 11, name: 'Chris Taylor', email: 'chris@netwatch.com', company: 'NetWatch', plan: 'Free Trial', status: 'Trial', alerts: 45, joined: '2024-01-08', paymentInfo: { cardLast4: '9753', cardExpiry: '12/2027', billingAddress: '300 Net St, Phoenix AZ', lastPayment: 'N/A', nextPayment: '2024-01-22' } },
  { id: 12, name: 'Amanda White', email: 'amanda@secops.co', company: 'SecOps', plan: 'Enterprise', status: 'Active', alerts: 5678, joined: '2022-09-15', paymentInfo: { cardLast4: '8642', cardExpiry: '06/2026', billingAddress: '400 Sec Ave, Dallas TX', lastPayment: '2024-01-15', nextPayment: '2024-02-15' } },
  { id: 13, name: 'Kevin Brown', email: 'kevin@shieldtech.io', company: 'ShieldTech', plan: 'Small Companies', status: 'Expired', alerts: 234, joined: '2023-01-25', paymentInfo: { cardLast4: '7531', cardExpiry: '01/2024', billingAddress: '500 Shield Rd, Atlanta GA', lastPayment: '2023-12-25', nextPayment: 'Expired' } },
  { id: 14, name: 'Nicole Kim', email: 'nicole@datafort.com', company: 'DataFort', plan: 'Enterprise', status: 'Active', alerts: 4123, joined: '2022-12-01', paymentInfo: { cardLast4: '1928', cardExpiry: '10/2026', billingAddress: '600 Fort Ln, San Diego CA', lastPayment: '2024-01-01', nextPayment: '2024-02-01' } },
  { id: 15, name: 'Ryan Martinez', email: 'ryan@techdefense.io', company: 'TechDefense', plan: 'Small Companies', status: 'Active', alerts: 1567, joined: '2023-06-30', paymentInfo: { cardLast4: '3847', cardExpiry: '08/2025', billingAddress: '700 Defense St, Las Vegas NV', lastPayment: '2024-01-30', nextPayment: '2024-02-30' } },
  { id: 16, name: 'Stephanie Clark', email: 'steph@cyberwatch.com', company: 'CyberWatch', plan: 'Enterprise', status: 'Active', alerts: 2890, joined: '2023-02-14', paymentInfo: { cardLast4: '5678', cardExpiry: '03/2026', billingAddress: '800 Watch Blvd, Minneapolis MN', lastPayment: '2024-01-14', nextPayment: '2024-02-14' } },
];

const statusColors: Record<string, string> = {
  Active: 'bg-success/10 text-success',
  Trial: 'bg-warning/10 text-warning',
  Suspended: 'bg-destructive/10 text-destructive',
  Expired: 'bg-muted text-muted-foreground',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus as 'Active' | 'Suspended' } : u
    ));
    toast({ 
      title: newStatus === 'Active' ? 'User Activated' : 'User Suspended', 
      description: `${user.name} has been ${newStatus === 'Active' ? 'activated' : 'suspended'}.` 
    });
  };

  const handleOpenEmail = (user: User) => {
    setSelectedUser(user);
    setEmailData({ subject: '', message: '' });
    setIsEmailOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailData.subject || !emailData.message) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    setIsSendingEmail(true);
    setTimeout(() => {
      toast({ title: 'Email Sent', description: `Email sent to ${selectedUser?.email}.` });
      setIsEmailOpen(false);
      setEmailData({ subject: '', message: '' });
      setIsSendingEmail(false);
    }, 1000);
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
      <div>
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">View and manage all registered users.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or company..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v);
              handleFilterChange();
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Alerts</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden xl:table-cell">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">{user.company}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">{user.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">{user.alerts.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm hidden xl:table-cell">{user.joined}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEmail(user)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user)} 
                            className={user.status === 'Suspended' ? 'text-success' : 'text-destructive'}
                          >
                            {user.status === 'Suspended' ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* User Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedUser.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedUser.status]}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{selectedUser.joined}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Alerts Generated</p>
                <p className="text-2xl font-bold">{selectedUser.alerts.toLocaleString()}</p>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Card</p>
                    <p className="font-medium">•••• •••• •••• {selectedUser.paymentInfo.cardLast4}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry</p>
                    <p className="font-medium">{selectedUser.paymentInfo.cardExpiry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Address</p>
                    <p className="font-medium">{selectedUser.paymentInfo.billingAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    <p className="font-medium">{selectedUser.paymentInfo.lastPayment}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Next Payment</p>
                    <p className="font-medium">{selectedUser.paymentInfo.nextPayment}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewOpen(false);
              handleOpenEmail(selectedUser!);
            }}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email to {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Send an email to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
