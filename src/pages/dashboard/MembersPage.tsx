import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, UserPlus, Shield, Trash2, MoreHorizontal, Ban, UserCog, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { membersAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { locationsAPI } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'fully', label: 'Fully' },
  { value: 'limited', label: 'Limited' },
] as const;

type MemberRow = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  company_role?: string;
};

export default function MembersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { canAccessMembers } = useUserRole();
  const navigate = useNavigate();

  // Route protection - redirect if user doesn't have access
  useEffect(() => {
    if (!canAccessMembers) {
      toast({
        title: 'Access Denied',
        description: 'Only company admins can access members management.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [canAccessMembers, navigate, toast]);

  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<number | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [query, setQuery] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'fully' | 'limited'>('limited');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newCountry, setNewCountry] = useState<string>('');
  const [countries, setCountries] = useState<Array<{ id: number; code: string; name: string }>>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = members.filter((m) => (user?.id ? m.id !== user.id : true));
    if (!q) return rows;
    return rows.filter((m) => (m.name + ' ' + m.email).toLowerCase().includes(q));
  }, [members, query, user?.id]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await locationsAPI.getCountries();
        setCountries(res.countries || []);
      } catch {
        setCountries([]);
      }
    };
    loadCountries();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await membersAPI.listMembers();
      setMembers((res.members || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        is_active: !!m.is_active,
        company_role: m.company_role,
      })));
    } catch (e: any) {
      toast({
        title: 'Members',
        description: e?.message || 'Failed to load members (admin only).',
        variant: 'destructive',
      });
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMember = async () => {
    try {
      if (!newName.trim() || !newEmail.trim()) {
        toast({ title: 'Missing fields', description: 'Name and email are required.', variant: 'destructive' });
        return;
      }

      if (!!newPassword || !!newConfirmPassword) {
        if (newPassword.length < 6) {
          toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
          return;
        }
        if (newPassword !== newConfirmPassword) {
          toast({ title: 'Password mismatch', description: 'Password and confirm password must match.', variant: 'destructive' });
          return;
        }
      }

      setMutating(-1);
      await membersAPI.createMember({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        password: newPassword ? newPassword : undefined,
        country: newCountry ? newCountry : undefined,
      } as any);
      toast({ title: 'Member created', description: `${newEmail.trim()} was added.` });
      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRole('limited');
      setNewPassword('');
      setNewConfirmPassword('');
      setNewCountry('');
      await loadMembers();
    } catch (e: any) {
      toast({ title: 'Create failed', description: e?.message || 'Could not create member.', variant: 'destructive' });
    } finally {
      setMutating(null);
    }
  };

  const updateRole = async (memberId: number, role: string) => {
    try {
      setMutating(memberId);
      await membersAPI.updateMemberRole(memberId, role);
      toast({ title: 'Role updated', description: 'Member role updated.' });
      await loadMembers();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update role.', variant: 'destructive' });
    } finally {
      setMutating(null);
    }
  };

  const suspendMember = async (memberId: number) => {
    try {
      setMutating(memberId);
      await membersAPI.deactivateMember(memberId);
      toast({ title: 'Member suspended', description: 'The member has been suspended.' });
      await loadMembers();
    } catch (e: any) {
      toast({ title: 'Suspend failed', description: e?.message || 'Could not suspend member.', variant: 'destructive' });
    } finally {
      setMutating(null);
    }
  };

  const activateMember = async (memberId: number) => {
    try {
      setMutating(memberId);
      await membersAPI.activateMember(memberId);
      toast({ title: 'Member activated', description: 'The member has been activated.' });
      await loadMembers();
    } catch (e: any) {
      toast({ title: 'Activate failed', description: e?.message || 'Could not activate member.', variant: 'destructive' });
    } finally {
      setMutating(null);
    }
  };

  const deleteMember = async (memberId: number) => {
    try {
      setMutating(memberId);
      await membersAPI.deleteMember(memberId);
      toast({ title: 'Member deleted', description: 'User has been removed.' });
      await loadMembers();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || 'Could not delete member.', variant: 'destructive' });
    } finally {
      setMutating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-muted-foreground">Create users, assign roles, and suspend access.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadMembers} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create member</DialogTitle>
                <DialogDescription>Add a new user to your company.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jane@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={newConfirmPassword}
                      onChange={(e) => setNewConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={newCountry} onValueChange={(v) => setNewCountry(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={mutating !== null}>
                  Cancel
                </Button>
                <Button onClick={createMember} disabled={mutating !== null}>
                  {mutating === -1 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company members</CardTitle>
          <CardDescription>Only company admins can manage members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading members...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground">No members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => {
                    const roleValue = (m.company_role || 'limited').toLowerCase();
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.email}</TableCell>
                        <TableCell>
                          <Select
                            value={ROLE_OPTIONS.some((r) => r.value === roleValue) ? roleValue : 'limited'}
                            onValueChange={(v) => updateRole(m.id, v)}
                            disabled={mutating === m.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {m.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" disabled={mutating === m.id}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {m.is_active ? (
                                <DropdownMenuItem
                                  onClick={() => suspendMember(m.id)}
                                  disabled={mutating === m.id}
                                  className="text-destructive"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => activateMember(m.id)}
                                  disabled={mutating === m.id}
                                  className="text-success"
                                >
                                  <UserCog className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  const ok = window.confirm('Delete this member? This cannot be undone.');
                                  if (ok) deleteMember(m.id);
                                }}
                                disabled={mutating === m.id}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
