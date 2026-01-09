import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { User, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPopup } from '@/contexts/NotificationPopupContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showNotification } = useNotificationPopup();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Show welcome notification on first load
  useEffect(() => {
    if (isAuthenticated && user && !hasShownWelcome) {
      const welcomeShown = sessionStorage.getItem('welcomeShown');
      if (!welcomeShown) {
        setTimeout(() => {
          showNotification({
            title: `Welcome back, ${user.name}!`,
            message: 'You have successfully logged in to your SecureCore dashboard.',
            type: 'info',
            link: '/dashboard',
          });
        }, 500);
        sessionStorage.setItem('welcomeShown', 'true');
        setHasShownWelcome(true);
      }
    }
  }, [isAuthenticated, user, hasShownWelcome, showNotification]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('welcomeShown');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
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
            <h1 className="text-lg font-semibold hidden sm:block">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden md:inline">{user?.name || 'Profile'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
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
