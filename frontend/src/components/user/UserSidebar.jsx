import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Headphones,
  ShoppingCart,
  Package,
  Star,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menu = [
  { to: "/user/dashboard", icon: Home, label: "Dashboard" },
  { to: "/user/products", icon: Package, label: "Browse Products" },
  { to: "/user/cart", icon: ShoppingCart, label: "Shopping Cart" },
  { to: "/user/orders", icon: ShoppingBag, label: "Order History" },
  { to: "/user/reviews", icon: Star, label: "My Reviews" },
  { to: "/user/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/user/profile", icon: User, label: "Profile" },
  { to: "/user/settings", icon: Settings, label: "Settings" },
  { to: "/user/support", icon: Headphones, label: "Support" },
];

export default function UserSidebar({ isMobileMenuOpen, onMobileMenuClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile Overlay - Only shows when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50",
          "flex-shrink-0 transition-all duration-300 ease-in-out",
          "flex flex-col",
          // Desktop styles - Always visible and sticky
          "hidden md:flex md:w-64 md:sticky md:top-16 md:h-[calc(100vh-4rem)]",
          // Mobile styles - Only show when menu is open, full overlay
          isMobileMenuOpen && "fixed top-0 left-0 z-50 w-72 h-screen shadow-2xl flex"
        )}
      >
        {/* Mobile Close Button - Only visible on mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Gaming Hub
            </h3>
            <button
              onClick={onMobileMenuClose}
              className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Desktop Header - Only visible on desktop */}
        <div className="hidden md:block px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Gaming Hub
          </h3>
          <p className="text-sm text-slate-400 mt-1">Welcome back, Gamer!</p>
        </div>

        {/* Mobile Welcome Message - Only when mobile menu is open */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-6 py-2">
            <p className="text-sm text-slate-400">Welcome back, Gamer!</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex flex-col py-4 gap-1 px-3 flex-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              to={item.to}
              key={item.to}
              onClick={onMobileMenuClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 group",
                  isActive || pathname === item.to
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30 shadow-lg"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors flex-shrink-0",
                      isActive || pathname === item.to
                        ? "text-purple-400"
                        : "text-slate-400 group-hover:text-purple-400"
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  {(isActive || pathname === item.to) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
