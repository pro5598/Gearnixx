// components/user/UserNavbar.jsx - Updated to work with AuthContext
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Add this import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings, 
  ShoppingBag, 
  Heart, 
  User, 
  Gamepad2,
  Menu,
  X,
  ShoppingCart,
  Package
} from "lucide-react";

// Accept user and onLogout props from UserLayout
export default function UserNavbar({ 
  onMobileMenuToggle, 
  isMobileMenuOpen,
  user, // Accept user from props (passed by UserLayout)
  onLogout // Accept logout handler from props (passed by UserLayout)
}) {
  const navigate = useNavigate();
  const { user: authUser, logout: authLogout } = useAuth(); // Use AuthContext as fallback
  
  // Use props first, then fallback to AuthContext
  const currentUser = user || authUser;
  const handleLogout = onLogout || authLogout;
  
  // Extract user display information
  const usernameDisplay = currentUser?.username?.trim() || 
                         currentUser?.firstName?.trim() || 
                         "GamerUser";
  const emailDisplay = currentUser?.email?.trim() || "gamer@gearnix.com";
  const fullName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || usernameDisplay;
  
  // Enhanced logout function
  const logout = () => {
    console.log('🔄 UserNavbar: Logout initiated');
    if (handleLogout) {
      handleLogout(); // Use the logout handler from props or context
    } else {
      // Fallback to direct logout
      localStorage.clear();
      navigate("/auth/login", { replace: true });
    }
  };
  
  return (
    <nav className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-4 sm:px-6 h-16 flex items-center sticky top-0 z-40">
      {/* Left section: Mobile menu button + logo */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button - Only visible on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 hover:bg-slate-800/50 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>

        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Gamepad2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GEARNIX
          </h1>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">Gaming Hub</span>
        </div>
      </div>
      
      {/* Center section: Welcome message - Hidden on small screens */}
      <div className="flex-1 flex justify-center">
        <div className="hidden lg:flex items-center gap-2 text-slate-300 text-sm">
          <span>Welcome back,</span>
          <span className="text-purple-400 font-medium">{usernameDisplay}</span>
        </div>
      </div>
      
      {/* Right section: Avatar & Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative h-10 w-10 rounded-full p-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 hover:scale-105">
            <Avatar className="h-10 w-10 ring-2 ring-slate-700 shadow-lg">
              <AvatarImage
                src={currentUser?.profileImage || "https://github.com/shadcn.png"}
                alt="Gamer avatar"
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                {usernameDisplay[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700">
          {/* User info */}
          <div className="px-4 py-3 select-none bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={currentUser?.profileImage || "https://github.com/shadcn.png"}
                    alt="Gamer avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-sm">
                    {usernameDisplay[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate" title={fullName}>
                  {fullName}
                </div>
                <div className="text-slate-300 text-xs truncate" title={emailDisplay}>
                  {emailDisplay}
                </div>
                <div className="text-purple-400 text-xs font-medium">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Member'}
                </div>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator className="bg-slate-700" />

          {/* Quick Stats - Optional addition */}
          <div className="px-4 py-2">
            <div className="text-xs text-slate-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400">Online & Active</span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-slate-700" />
          
          {/* Dashboard */}
          <DropdownMenuItem
            onClick={() => navigate("/user/dashboard")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <Package className="mr-3 h-4 w-4 text-purple-400" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          {/* Profile */}
          <DropdownMenuItem
            onClick={() => navigate("/user/profile")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <User className="mr-3 h-4 w-4 text-purple-400" />
            <span>My Profile</span>
          </DropdownMenuItem>
          
          {/* My Orders */}
          <DropdownMenuItem
            onClick={() => navigate("/user/orders")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <ShoppingBag className="mr-3 h-4 w-4 text-blue-400" />
            <span>My Orders</span>
          </DropdownMenuItem>
          
          {/* Shopping Cart */}
          <DropdownMenuItem
            onClick={() => navigate("/user/cart")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <ShoppingCart className="mr-3 h-4 w-4 text-green-400" />
            <span>Shopping Cart</span>
          </DropdownMenuItem>
          
          {/* Wishlist */}
          <DropdownMenuItem
            onClick={() => navigate("/user/wishlist")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <Heart className="mr-3 h-4 w-4 text-pink-400" />
            <span>Wishlist</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          {/* Settings */}
          <DropdownMenuItem
            onClick={() => navigate("/user/settings")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 text-white"
          >
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          {/* Logout */}
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
