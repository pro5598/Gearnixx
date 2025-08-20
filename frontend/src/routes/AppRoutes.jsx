import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AuthLayout from "../layout/AuthLayout";
import AdminLayout from "../layout/AdminLayout.jsx";
import AdminHome from "../pages/Admin/Dashboard.jsx";
import UserLayout from "../layout/UserLayout.jsx";
import UserHome from "../pages/User/Dashboard";
import BrowseProducts from "../pages/User/BrowseProducts.jsx";
import Wishlist from "../pages/User/Wishlist.jsx";
import ShoppingCart from "../pages/User/ShoppingCart.jsx";
import OrderHistory from "../pages/User/OrderHistory.jsx";
import Support from "../pages/User/Support.jsx";
import Profile from "../pages/User/Profile.jsx";
import ManageUsers from "../pages/Admin/ManageUsers.jsx";
import ManageProducts from "../pages/Admin/ManageProducts.jsx";
import ManageOrders from "../pages/Admin/ManageOrders.jsx";
import UserReviews from "../pages/User/UserReviews.jsx";
import AdminReviews from "../pages/Admin/AdminReviews.jsx";
import UserSettings from "../pages/User/UserSettings.jsx";
import { CartProvider } from "../contexts/CartContext.jsx";
import { WishlistProvider } from "../contexts/WishlistContext.jsx";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import {
  ProtectedRoute,
  AdminRoute,
  UserRoute,
  PublicRoute,
} from "../components/ProtectedRoutes.jsx";

// NEW: Component to handle authenticated user redirect from home page
const HomeWithRedirect = () => {
  return (
    <ProtectedRoute requireAuth={false}>
      <Home />
    </ProtectedRoute>
  );
};

export default function AppRoutes() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
            {/* Public Home page - accessible to everyone, but redirects authenticated users */}
            <Route path="/" element={<HomeWithRedirect />} />

            {/* Auth pages - only accessible when NOT logged in */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthLayout />
                </PublicRoute>
              }
            >
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              {/* Redirect /auth to /auth/login */}
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Admin Protected Routes - require admin role ONLY */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              {/* Default admin route */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminHome />} />

              {/* User Management Routes */}
              <Route path="users" element={<ManageUsers />} />
              <Route path="users/add" element={<ManageUsers />} />
              <Route path="users/:id/edit" element={<ManageUsers />} />
              <Route path="users/:id/view" element={<ManageUsers />} />
              <Route path="users/:id/delete" element={<ManageUsers />} />
              <Route path="users/:id/change-role" element={<ManageUsers />} />

              {/* Product Management Routes */}
              <Route path="products" element={<ManageProducts />} />
              <Route path="products/add" element={<ManageProducts />} />
              <Route path="products/:id/edit" element={<ManageProducts />} />
              <Route path="products/:id/view" element={<ManageProducts />} />
              <Route path="products/:id/delete" element={<ManageProducts />} />
              <Route
                path="products/:id/analytics"
                element={<ManageProducts />}
              />

              {/* Order Management Routes */}
              <Route path="orders" element={<ManageOrders />} />
              <Route path="orders/:id/view" element={<ManageOrders />} />
              <Route
                path="orders/:id/update-status"
                element={<ManageOrders />}
              />
              <Route path="orders/:id/track" element={<ManageOrders />} />

              {/* Admin Settings & Reviews */}
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            {/* User Protected Routes - require user role ONLY (not admin) */}
            <Route
              path="/user"
              element={
                <UserRoute>
                  <UserLayout />
                </UserRoute>
              }
            >
              {/* Default user route */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserHome />} />
              <Route path="products" element={<BrowseProducts />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="cart" element={<ShoppingCart />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<Profile />} />
              <Route path="reviews" element={<UserReviews />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* Legacy redirects for better UX */}
            <Route
              path="/login"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route
              path="/register"
              element={<Navigate to="/auth/register" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAuth={true}>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

// NEW: Component to redirect to appropriate dashboard based on role
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
};

// NEW: Enhanced 404 page
const NotFoundPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getHomeLink = () => {
    if (!isAuthenticated) return "/";
    return user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  const getHomeLinkText = () => {
    if (!isAuthenticated) return "Go Home";
    return user?.role === "admin"
      ? "Go to Admin Dashboard"
      : "Go to User Dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
        <p className="text-slate-300 text-xl mb-4">Page not found</p>
        <p className="text-slate-400 text-sm mb-6">
          The page you're looking for doesn't exist or you don't have permission
          to access it.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
          <a
            href={getHomeLink()}
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {getHomeLinkText()}
          </a>
        </div>
      </div>
    </div>
  );
};
