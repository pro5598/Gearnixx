// layout/UserLayout.jsx - Updated with authentication and logout functionality
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Add this import
import UserNavbar from "../components/user/UserNavbar";
import UserSidebar from "../components/user/UserSidebar";
import UserFooter from "../components/user/UserFooter";
import { Loader2 } from "lucide-react"; // Add this for loading state

export default function UserLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading, isAuthenticated } = useAuth(); // Use AuthContext

  // Loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  // This shouldn't happen due to protected routes, but good to have as fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-4">Please login to access your dashboard</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Logout functionality
  const handleLogout = () => {
    console.log('🔄 User logging out...');
    logout();
    navigate('/', { replace: true });
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sticky navbar at the top */}
      <div className="sticky top-0 z-50">
        <UserNavbar
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          user={user} // Pass user data to navbar
          onLogout={handleLogout} // Pass logout handler to navbar
        />
      </div>

      {/* Main content area with sidebar and main content */}
      <div className="flex flex-1">
        {/* Sidebar - Responsive */}
        <UserSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={closeMobileMenu}
          user={user} // Pass user data to sidebar
          onLogout={handleLogout} // Pass logout handler to sidebar
        />

        {/* Main content area - scrollable */}
        <main className="flex-1 p-4 md:p-8 bg-slate-900 min-h-[calc(100vh-4rem)]">
          <div className="min-h-full">
            {/* Welcome message for successful login */}
            {location.state?.message && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  {location.state.message}
                </p>
              </div>
            )}
            
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer - appears after content */}
      <UserFooter />
    </div>
  );
}
