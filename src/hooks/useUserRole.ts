import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook to get the current user's role and permission checks
 * 
 * Role hierarchy:
 * - Service Admin (users.role === 'admin'): Access to /admin panel
 * - Company Admin (company_role === 'admin'): Full /dashboard access
 * - Full User (company_role === 'full'): No members/tokens/settings (except profile), can edit IPs
 * - Limited User (company_role === 'limited'): Like full but read-only for IPs
 */
export const useUserRole = () => {
    const { user } = useContext(AuthContext);

    // Check service provider admin (global role)
    const isServiceAdmin = user?.role === 'admin';

    // Get company role from user object (for company users)
    const companyRole = (user as any)?.company_role;
    const isCompanyAdmin = companyRole === 'admin';
    const isFull = companyRole === 'fully';  // Database uses 'fully' not 'full'
    const isLimited = companyRole === 'limited';

    // Service provider admins should have access to everything in /admin
    // Company admins should have access to everything in /dashboard
    const hasAdminAccess = isServiceAdmin || isCompanyAdmin;

    return {
        // Role information
        role: companyRole || user?.role || null,
        isServiceAdmin,
        isCompanyAdmin,
        isFull,
        isLimited,
        isAdmin: hasAdminAccess, // For backward compatibility - true for both types of admin

        // Permission checks for specific features
        // Service provider admins get full access, company users follow company role rules
        canAccessMembers: hasAdminAccess,
        canAccessTokens: hasAdminAccess,
        canAccessDownloads: hasAdminAccess,
        canAccessCompanySettings: hasAdminAccess,
        canAccessSubscription: hasAdminAccess,
        canAccessPaymentMethods: hasAdminAccess,
        canAccessNotifications: hasAdminAccess,  // Only admins can access notifications

        // Blocklist/Whitelist permissions
        canViewBlocklist: hasAdminAccess || isFull || isLimited,
        canManageBlocklist: hasAdminAccess || isFull,
        canViewWhitelist: hasAdminAccess || isFull || isLimited,
        canManageWhitelist: hasAdminAccess || isFull,
    };
};
