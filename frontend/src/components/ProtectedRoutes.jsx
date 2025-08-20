// components/ProtectedRoutes.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, Shield, User } from 'lucide-react';

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  allowedRoles = [],
  strictRole = false, // NEW: For strict role enforcement
}) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isAdmin,
    userRole: user?.role,
    requireAuth,
    requireAdmin,
    allowedRoles,
    strictRole,
    currentPath: location.pathname
  });

  // Show loading screen while auth is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 Access denied: Not authenticated');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Admin-only route check
  if (requireAdmin && !isAdmin) {
    console.log('🚫 Access denied: Admin privileges required');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Admin Access Required</h1>
          <p className="text-slate-300 mb-6">
            You need administrator privileges to access this section.
          </p>
          <button
            onClick={() => window.location.href = '/user/dashboard'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Specific role-based check with strict enforcement
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user?.role);
    
    if (!hasAllowedRole) {
      console.log('🚫 Access denied: Role not allowed', {
        userRole: user?.role,
        allowedRoles
      });
      
      // Determine redirect based on user role
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      const roleText = user?.role === 'admin' ? 'Administrator' : 'User';
      
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Unauthorized Access</h1>
            <p className="text-slate-300 mb-2">
              You are logged in as <span className="text-purple-400 font-semibold">{roleText}</span>
            </p>
            <p className="text-slate-300 mb-6">
              You don't have permission to access this section.
            </p>
            <button
              onClick={() => window.location.href = redirectPath}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to {roleText} Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Prevent logged-in users from visiting public routes (like login/register)
  if (!requireAuth && isAuthenticated) {
    console.log('🔄 Authenticated user accessing public page, redirecting to dashboard');
    const redirectPath = isAdmin ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Access granted
  console.log('✅ Access granted to:', location.pathname);
  return children;
};

// 🔒 Admin-only route (STRICT - only admins allowed)
export const AdminRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireAdmin={true} 
    allowedRoles={['admin']}
    strictRole={true}
  >
    {children}
  </ProtectedRoute>
);

// 👤 User-only route (STRICT - only regular users allowed, NOT admins)
export const UserRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    allowedRoles={['user']}
    strictRole={true}
  >
    {children}
  </ProtectedRoute>
);

// 🔄 Mixed role route (both admins and users can access)
export const MixedRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    allowedRoles={['admin', 'user']}
  >
    {children}
  </ProtectedRoute>
);

// 🌐 Public route (like login/register) — redirect if already logged in
export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

// 🎯 Custom role route (specify exact roles)
export const RoleBasedRoute = ({ children, roles = [] }) => (
  <ProtectedRoute 
    requireAuth={true} 
    allowedRoles={roles}
    strictRole={true}
  >
    {children}
  </ProtectedRoute>
);
