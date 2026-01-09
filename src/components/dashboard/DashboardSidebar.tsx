import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Key, 
  Bell, 
  FileText, 
  Ban, 
  CheckCircle, 
  Settings, 
  Download,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Key, label: 'API Token', href: '/dashboard/token' },
  { icon: Bell, label: 'Recent Alerts', href: '/dashboard/alerts' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Ban, label: 'Block List', href: '/dashboard/blocklist' },
  { icon: CheckCircle, label: 'White List', href: '/dashboard/whitelist' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: Download, label: 'Downloads', href: '/dashboard/downloads' },
];

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
    onNavigate?.();
  };

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">SecureCore</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
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
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
