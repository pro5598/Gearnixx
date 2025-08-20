import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Star,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menu = [
  { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Manage Users" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/reviews", icon: Star, label: "Reviews"},
];

export default function AdminSidebar({ isMobileMenuOpen = false, onMobileMenuClose = () => {} }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile overlay */}
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
          "bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 flex-shrink-0 transition-all duration-300",
          "flex flex-col",
          "hidden md:flex md:w-64 md:sticky md:top-16 md:h-[calc(100vh-4rem)] h-full shadow-xl",
          isMobileMenuOpen && "md:hidden fixed top-0 left-0 z-50 w-72 h-screen shadow-2xl flex"
        )}
      >
        {/* Mobile close button */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Control Hub
            </h3>
            <button
              onClick={onMobileMenuClose}
              className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 hidden md:block">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Control Hub
          </h3>
          <p className="text-sm text-slate-400 mt-1">Manage your platform!</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col py-6 gap-2 px-4 flex-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              to={item.to}
              key={item.to}
              onClick={onMobileMenuClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all duration-200 group relative",
                  isActive || pathname === item.to
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {(isActive || pathname === item.to) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"></div>
                  )}

                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors flex-shrink-0",
                      isActive || pathname === item.to
                        ? "text-white"
                        : "text-slate-400 group-hover:text-purple-400"
                    )}
                  />

                  <span className="text-sm font-medium flex-1">{item.label}</span>

                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-semibold rounded-full",
                        isActive || pathname === item.to
                          ? "bg-white/20 text-white"
                          : "bg-purple-600/20 text-purple-400 border border-purple-400/30"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {(isActive || pathname === item.to) && (
                    <ChevronRight className="w-4 h-4 text-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-xs">System Online</span>
          </div>
          <div className="text-slate-500 text-xs">Admin Panel v2.1.0</div>
        </div>
      </aside>
    </>
  );
}
