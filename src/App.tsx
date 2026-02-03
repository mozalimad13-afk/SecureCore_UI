import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { NotificationPopupProvider } from "@/contexts/NotificationPopupContext";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function RealtimeBridge() {
  useRealtimeAlerts();
  return null;
}

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import TokenPage from "./pages/dashboard/TokenPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import BlocklistPage from "./pages/dashboard/BlocklistPage";
import WhitelistPage from "./pages/dashboard/WhitelistPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import DownloadsPage from "./pages/dashboard/DownloadsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import MembersPage from "./pages/dashboard/MembersPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminLogs from "./pages/admin/AdminLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NotificationPopupProvider>
                <RealtimeBridge />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* User Dashboard */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />

                    {/* Admin-only routes */}
                    <Route
                      path="token"
                      element={
                        <ProtectedRoute requireAdmin>
                          <TokenPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="members"
                      element={
                        <ProtectedRoute requireAdmin>
                          <MembersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="downloads"
                      element={
                        <ProtectedRoute requireAdmin>
                          <DownloadsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Available to all authenticated users */}
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="blocklist" element={<BlocklistPage />} />
                    <Route path="whitelist" element={<WhitelistPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Admin Dashboard */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminHome />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="system" element={<AdminSystemHealth />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="logs" element={<AdminLogs />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NotificationPopupProvider>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
