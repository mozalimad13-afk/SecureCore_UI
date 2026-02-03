import { useState, useEffect, useCallback } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, MoreHorizontal, Ban, Mail, Eye, UserCog, CreditCard, Pencil, Trash2, ArrowLeft, CheckCircle, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';
import { User, Pagination as PaginationType } from '@/types';

const statusColors: Record<string, string> = {
  Active: 'bg-success/10 text-success',
  Trial: 'bg-warning/10 text-warning',
  Cancelled: 'bg-destructive/10 text-destructive',
  Expired: 'bg-muted text-muted-foreground',
};

const COMPANY_PLANS = ['Free', 'Small Companies', 'Enterprise'] as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, per_page: 15, total: 0, pages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof COMPANY_PLANS)[number]>('Free');
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelSubUser, setCancelSubUser] = useState<User | null>(null);
  const [suspendMemberData, setSuspendMemberData] = useState<any | null>(null);
  const [activateMemberData, setActivateMemberData] = useState<any | null>(null);
  const [deleteMemberData, setDeleteMemberData] = useState<any | null>(null);
  const [savePlanConfirm, setSavePlanConfirm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const viewMode: 'details' | 'editUser' = editingMember ? 'editUser' : 'details';
  const [transitioning, setTransitioning] = useState(false);
  const [navDirection, setNavDirection] = useState<'toEdit' | 'toDetails'>('toEdit');
  const { toast } = useToast();
  const startEditMember = (m: any) => {
    setNavDirection('toEdit');
    setTransitioning(true);
    setMemberForm({
      name: m?.name ?? '',
      email: m?.email ?? '',
      password: '',
      confirmPassword: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);

    window.setTimeout(() => {
      setEditingMember(m);
      setTransitioning(false);
    }, 220);
  };

  const cancelEditMember = () => {
    setNavDirection('toDetails');
    setTransitioning(true);
    window.setTimeout(() => {
      setEditingMember(null);
      setMemberForm({ name: '', email: '', password: '', confirmPassword: '' });
      setTransitioning(false);
    }, 220);
  };

  const saveEditMember = async () => {
    if (!editingMember?.id) return;
    if (!memberForm.name || !memberForm.email) {
      toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' });
      return;
    }
    if (memberForm.password || memberForm.confirmPassword) {
      if (memberForm.password !== memberForm.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }
    }
    try {
      await adminAPI.updateUser(editingMember.id, {
        name: memberForm.name,
        email: memberForm.email,
        ...(memberForm.password ? { password: memberForm.password } : {}),
      });
      toast({ title: 'Saved', description: 'User updated successfully' });
      cancelEditMember();
      // Reload user details in the view dialog
      if (selectedUser?.id) {
        await loadUserDetails(selectedUser.id);
      }
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  const suspendMember = async () => {
    if (!suspendMemberData?.id) return;
    try {
      await adminAPI.suspendUser(suspendMemberData.id);
      toast({ title: 'User suspended', description: `${suspendMemberData.name} suspended.` });
      setSuspendMemberData(null);
      // Reload user details in the view dialog
      if (selectedUser?.id) {
        await loadUserDetails(selectedUser.id);
      }
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to suspend user', variant: 'destructive' });
    }
  };

  const activateMember = async () => {
    if (!activateMemberData?.id) return;
    try {
      await adminAPI.activateUser(activateMemberData.id);
      toast({ title: 'User activated', description: `${activateMemberData.name} activated.` });
      setActivateMemberData(null);
      // Reload user details in the view dialog
      if (selectedUser?.id) {
        await loadUserDetails(selectedUser.id);
      }
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to activate user', variant: 'destructive' });
    }
  };

  const deleteMember = async () => {
    if (!deleteMemberData?.id) return;
    try {
      await adminAPI.deleteUser(deleteMemberData.id);
      toast({ title: 'User deleted', description: `${deleteMemberData.name} deleted.` });
      setDeleteMemberData(null);
      // Close the view dialog since user is deleted
      setIsViewOpen(false);
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers({
        page: pagination.page,
        per_page: pagination.per_page,
      });
      setUsers(data.users || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getCompanyStatus = (company: User) => {
    const status = company.subscription?.status?.toLowerCase();
    const plan = company.subscription?.plan;

    if (status === 'active') return 'Active';
    if (status === 'trial') return 'Trial';
    if (status === 'expired') return 'Expired';
    if (status === 'cancelled') return 'Cancelled';

    // Fallback based on plan name if status is missing
    if (plan === 'Cancelled') return 'Cancelled';
    if (plan === 'Free' || plan === 'Free Trial') return 'Trial';
    if (plan && plan !== 'Free') return 'Active';

    return 'Trial';
  };

  const loadUserDetails = async (userId: number) => {
    try {
      const userData = await adminAPI.getUsers({ page: 1, per_page: 1000 });
      const user = userData.users.find((u: User) => u.id === userId);
      if (user) {
        setSelectedUser(user);
      }
    } catch (error) {
      console.error('Failed to reload user details:', error);
    }
  };

  const handleOpenPlan = (company: User) => {
    setSelectedUser(company);
    const current = (company.subscription?.plan as any) || 'Free';
    setSelectedPlan(COMPANY_PLANS.includes(current) ? current : 'Free');
    setIsPlanOpen(true);
  };

  const handleSavePlan = async () => {
    if (!selectedUser?.id) return;
    try {
      await adminAPI.setCompanyPlan(selectedUser.id, selectedPlan);
      toast({ title: 'Plan updated', description: `Plan set to ${selectedPlan}.` });
      setSavePlanConfirm(false);
      setIsPlanOpen(false);
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update plan', variant: 'destructive' });
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelSubUser?.id) return;
    try {
      await adminAPI.cancelCompanySubscription(cancelSubUser.id);
      toast({ title: 'Subscription cancelled', description: 'Company subscription cancelled.' });
      setCancelSubUser(null);
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to cancel subscription', variant: 'destructive' });
    }
  };

  const handleOpenEmail = (user: User) => {
    setSelectedUser(user);
    setEmailData({ subject: '', message: '' });
    setIsEmailOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsSendingEmail(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingEmail(false);
    setIsEmailOpen(false);
    toast({ title: 'Email Sent', description: `Email has been sent to ${selectedUser.email}` });
  };

  const filteredUsers = searchTerm || statusFilter !== 'all'
    ? users.filter(user => {
      const matchesSearch =
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const status = getCompanyStatus(user).toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    : users;

  const totalPages = pagination.pages;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage companies, subscriptions, and security status.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Alerts</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{(user as any).company ?? '—'} • {(user as any).phone_number ?? '—'}</div>
                      </td>
                      <td className="py-3 px-4">{user.subscription?.plan || 'Free'}</td>
                      <td className="py-3 px-4">
                        {(() => {
                          const s = getCompanyStatus(user);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s] || statusColors.Trial}`}>
                              {s}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">{user.alerts_count || 0}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsViewOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {(() => {
                              const status = getCompanyStatus(user);
                              const isCancelled = status === 'Cancelled';
                              return (
                                <DropdownMenuItem
                                  onClick={() => handleOpenPlan(user)}
                                  className={isCancelled ? 'text-success' : ''}
                                >
                                  {isCancelled ? (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  ) : (
                                    <CreditCard className="w-4 h-4 mr-2" />
                                  )}
                                  {isCancelled ? 'Activate' : 'Change Plan'}
                                </DropdownMenuItem>
                              );
                            })()}
                            {getCompanyStatus(user) !== 'Cancelled' && getCompanyStatus(user) !== 'Expired' && (
                              <DropdownMenuItem
                                onClick={() => setCancelSubUser(user)}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenEmail(user)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
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
                      onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                        isActive={pagination.page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPagination(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                      className={pagination.page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
        <DialogContent
          className={
            viewMode === 'editUser'
              ? 'p-0'
              : 'max-w-2xl max-h-[90vh] overflow-y-auto'
          }
        >
          {selectedUser && (
            <div className={viewMode === 'editUser' ? '' : ''}>
              {viewMode === 'details' && (
                <div className="p-6 animate-in slide-in-from-left-2 duration-200">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserCog className="w-5 h-5" />
                      Company Details
                    </DialogTitle>
                    <DialogDescription>
                      Review company subscription, alerts, members, and payment details.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{(selectedUser as any).phone_number ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium">{selectedUser.subscription?.plan || 'Free'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        {(() => {
                          const s = getCompanyStatus(selectedUser);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s] || statusColors.Trial}`}>
                              {s}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Company Alerts</p>
                      <p className="text-2xl font-bold">{(selectedUser.alerts_count || 0).toLocaleString()}</p>
                    </div>

                    {(selectedUser as any).members && Array.isArray((selectedUser as any).members) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">Company Members</h4>
                        <div className="rounded-lg border border-border divide-y">
                          {(selectedUser as any).members.map((m: any) => (
                            <div key={m.id} className="p-3 flex items-center justify-between">
                              <div>
                                <div className="font-medium">{m.name}</div>
                                <div className="text-sm text-muted-foreground">{m.email}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => startEditMember(m)}>
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    {!m.is_active ? (
                                      <DropdownMenuItem onClick={() => setActivateMemberData(m)} className="text-success">
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Activate
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => setSuspendMemberData(m)} className="text-destructive">
                                        <Ban className="w-4 h-4 mr-2" />
                                        Suspend
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setDeleteMemberData(m)} className="text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUser.payment_info ? (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payment Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-border">
                          <div>
                            <p className="text-sm text-muted-foreground">Card</p>
                            <p className="font-medium">{selectedUser.payment_info.card_brand} •••• {selectedUser.payment_info.card_last4}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expiry</p>
                            <p className="font-medium">{selectedUser.payment_info.expiry}</p>
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <p className="text-sm text-muted-foreground">Billing Address</p>
                            <p className="font-medium">{selectedUser.payment_info.billing_address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
                        No payment method on file
                      </div>
                    )}
                  </div>

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
                </div>
              )}

              {viewMode === 'editUser' && editingMember && (
                <div className="p-6 animate-in slide-in-from-right-2 duration-200">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={cancelEditMember} className="px-2">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h4 className="font-semibold">Edit Member</h4>
                    <div />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Name</Label>
                      <Input value={memberForm.name} onChange={(e) => setMemberForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Email</Label>
                      <Input value={memberForm.email} onChange={(e) => setMemberForm(f => ({ ...f, email: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={memberForm.password}
                          onChange={(e) => setMemberForm(f => ({ ...f, password: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(v => !v)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={memberForm.confirmPassword}
                          onChange={(e) => setMemberForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(v => !v)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={cancelEditMember}>Cancel</Button>
                    <Button onClick={saveEditMember}>Save</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedUser && getCompanyStatus(selectedUser) === 'Trial'
                ? 'Activate Company Plan'
                : 'Change Company Plan'}
            </DialogTitle>
            <DialogDescription>
              Choose a plan for this company. Selecting "Free" will cancel the subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_PLANS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPlanOpen(false)}>Cancel</Button>
            <Button onClick={() => setSavePlanConfirm(true)}>Save</Button>
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

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={!!cancelSubUser} onOpenChange={(open) => !open && setCancelSubUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the subscription for {cancelSubUser?.name}.
              The company will lose access to premium features at the end of the current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Member Confirmation Dialog */}
      <AlertDialog open={!!suspendMemberData} onOpenChange={(open) => !open && setSuspendMemberData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {suspendMemberData?.name}?
              This user will lose access to the system until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={suspendMember}>
              Yes, Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Member Confirmation Dialog */}
      <AlertDialog open={!!activateMemberData} onOpenChange={(open) => !open && setActivateMemberData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {activateMemberData?.name}?
              This user will regain access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={activateMember} className="bg-success text-success-foreground hover:bg-success/90">
              Yes, Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Member Confirmation Dialog */}
      <AlertDialog open={!!deleteMemberData} onOpenChange={(open) => !open && setDeleteMemberData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteMemberData?.name}?
              This action cannot be undone and all user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Plan Confirmation Dialog */}
      <AlertDialog open={savePlanConfirm} onOpenChange={setSavePlanConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply the "{selectedPlan}" plan to {selectedUser?.name}?
              {selectedPlan === 'Free' && ' This will cancel their current subscription.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePlan}>
              Yes, Apply Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
