import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'admin' | 'fully_privileged' | 'limited';
    requireAdmin?: boolean;
    requireFullyPrivileged?: boolean;
}

/**
 * Protected Route component that checks user authentication and role permissions
 */
export const ProtectedRoute = ({
    children,
    requiredRole,
    requireAdmin = false,
    requireFullyPrivileged = false
}: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    const { isAdmin, isFullyPrivileged } = useUserRole();

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check fully privileged requirement (includes admin)
    if (requireFullyPrivileged && !(isAdmin || isFullyPrivileged)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check specific role requirement
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
