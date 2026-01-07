import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  LogOut,
  Bell,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Activity, label: 'System Health', href: '/admin/system' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: FileText, label: 'Logs', href: '/admin/logs' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg text-sidebar-foreground">SecureCore</span>
            <span className="block text-xs text-sidebar-foreground/60">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
