import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { User, Shield, LayoutDashboard, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPopup } from '@/contexts/NotificationPopupContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showNotification } = useNotificationPopup();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Show welcome notification on first load
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && !hasShownWelcome) {
      const welcomeShown = sessionStorage.getItem('adminWelcomeShown');
      if (!welcomeShown) {
        setTimeout(() => {
          showNotification({
            title: 'Welcome, Administrator!',
            message: 'You are now logged in to the Admin Dashboard.',
            type: 'info',
            link: '/admin',
          });
        }, 500);
        sessionStorage.setItem('adminWelcomeShown', 'true');
        setHasShownWelcome(true);
      }
    }
  }, [isAuthenticated, user, hasShownWelcome, showNotification]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('adminWelcomeShown');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Shield className="w-5 h-5 text-primary hidden sm:block" />
            <h1 className="text-lg font-semibold hidden sm:block">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="hidden md:inline">Administrator</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
