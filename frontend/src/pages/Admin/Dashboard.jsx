import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../../services/orderAPI";
import { productAPI } from "../../../services/api";
import { userAPI } from "../../../services/userAPI";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Loader
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    orderStats: {
      thisMonth: 0,
      thisMonthRevenue: 0,
      completedOrders: 0,
      processingOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0
    },
    productStats: {
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    },
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      regularUsers: 0,
      newUsersThisMonth: 0,
      newUsersToday: 0
    }
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting admin dashboard data fetch...');

      // Fetch data in parallel using the new database endpoints
      await Promise.all([
        fetchOrderStats(),      // Use database stats instead of complex calculation
        fetchRecentOrders(),    // Get recent orders from database
        fetchAllProducts(),     // Keep existing product logic
        fetchUserStats()        // Keep existing user stats logic
      ]);

      console.log('✅ Admin dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching admin dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch order statistics directly from database
  const fetchOrderStats = async () => {
    try {
      console.log('📊 Fetching order statistics from database...');
      
      const response = await orderAPI.getOrderStats();
      
      if (response.success && response.data) {
        const stats = response.data;
        
        console.log('📊 Raw order stats from database:', stats);
        
        setDashboardData(prev => ({
          ...prev,
          totalOrders: stats.totalOrders,
          totalRevenue: stats.totalRevenue,
          pendingOrders: stats.ordersByStatus.processing, // Map processing to pending
          orderStats: {
            thisMonth: stats.thisMonth.orders,
            thisMonthRevenue: stats.thisMonth.revenue,
            completedOrders: stats.ordersByStatus.delivered,
            processingOrders: stats.ordersByStatus.processing,
            cancelledOrders: stats.ordersByStatus.cancelled,
            averageOrderValue: stats.averageOrderValue
          }
        }));

        console.log('📊 Order stats updated in dashboard:', {
          totalOrders: stats.totalOrders,
          totalRevenue: `$${stats.totalRevenue}`,
          thisMonth: stats.thisMonth,
          averageOrderValue: `$${stats.averageOrderValue}`
        });
      } else {
        throw new Error(response.message || 'Failed to fetch order statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching order statistics:', error);
      throw error;
    }
  };

  // NEW: Fetch recent orders directly from database
  const fetchRecentOrders = async () => {
    try {
      console.log('📋 Fetching recent orders from database...');
      
      const response = await orderAPI.getRecentOrders(10);
      
      if (response.success && response.data && response.data.orders) {
        const orders = response.data.orders;
        
        console.log('📋 Raw recent orders from database:', orders);
        
        const recentOrders = orders.map(order => {
          // Get customer name from user relationship or customerDetails
          let customerName = 'Unknown Customer';
          if (order.user) {
            customerName = `${order.user.firstName} ${order.user.lastName}`.trim();
            if (!customerName || customerName === '') {
              customerName = order.user.username || order.user.email || 'Unknown Customer';
            }
          } else if (order.customerDetails) {
            // Parse customerDetails JSON if it exists
            try {
              const details = typeof order.customerDetails === 'string' 
                ? JSON.parse(order.customerDetails) 
                : order.customerDetails;
              customerName = `${details.firstName || ''} ${details.lastName || ''}`.trim() 
                || details.name 
                || details.email 
                || 'Unknown Customer';
            } catch (e) {
              console.warn('Could not parse customerDetails:', order.customerDetails);
            }
          }

          return {
            id: order.orderNumber || order.id,
            customer: customerName,
            amount: parseFloat(order.total) || 0,
            status: order.status || 'processing',
            time: formatTimeAgo(order.createdAt),
            userId: order.userId
          };
        });

        setDashboardData(prev => ({
          ...prev,
          recentOrders
        }));

        console.log('📋 Recent orders processed:', recentOrders);
      } else {
        console.warn('⚠️ No recent orders found or invalid response');
        setDashboardData(prev => ({
          ...prev,
          recentOrders: []
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching recent orders:', error);
      // Don't throw error, just set empty array
      setDashboardData(prev => ({
        ...prev,
        recentOrders: []
      }));
    }
  };

  // Keep existing product fetch logic
  const fetchAllProducts = async () => {
    try {
      console.log('🔄 Fetching all products for admin dashboard...');
      const response = await productAPI.getProducts({
        limit: 1000 // Get all products
      });

      let productsArray = [];
      if (response.data && response.data.products) {
        productsArray = response.data.products;
      } else if (response.products) {
        productsArray = response.products;
      } else if (Array.isArray(response.data)) {
        productsArray = response.data;
      } else if (Array.isArray(response)) {
        productsArray = response;
      }

      const totalProducts = productsArray.length;
      const activeProducts = productsArray.filter(p => p.status === 'active').length;
      const lowStockProducts = productsArray.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStockProducts = productsArray.filter(p => p.stock === 0).length;

      setDashboardData(prev => ({
        ...prev,
        totalProducts,
        productStats: {
          activeProducts,
          lowStockProducts,
          outOfStockProducts
        }
      }));

      console.log('📦 Product stats calculated:', {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts
      });

    } catch (error) {
      console.error('❌ Error fetching admin products:', error);
      // Don't throw error, just log it as products might not be critical
    }
  };

  // Keep existing user stats logic
  const fetchUserStats = async () => {
    try {
      console.log('👥 Fetching real user statistics from database...');
      
      const response = await userAPI.getAdminUserStats();
      
      if (response.success && response.data) {
        const userStats = response.data;
        
        setDashboardData(prev => ({
          ...prev,
          totalUsers: userStats.totalUsers,
          userStats: {
            totalUsers: userStats.totalUsers,
            activeUsers: userStats.activeUsers,
            inactiveUsers: userStats.inactiveUsers,
            adminUsers: userStats.adminUsers,
            regularUsers: userStats.regularUsers,
            newUsersThisMonth: userStats.newUsersThisMonth,
            newUsersToday: userStats.newUsersToday
          }
        }));

        console.log('👥 User stats loaded:', {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          newUsersThisMonth: userStats.newUsersThisMonth
        });
      } else {
        throw new Error(response.message || 'Failed to fetch user statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching user statistics:', error);
      
      // Set fallback values
      setDashboardData(prev => ({
        ...prev,
        totalUsers: 0,
        userStats: {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          adminUsers: 0,
          regularUsers: 0,
          newUsersThisMonth: 0,
          newUsersToday: 0
        }
      }));
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-gray-300 text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Welcome to Gearnix Admin Panel - Monitor your gaming platform
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Data from database | Revenue: ${dashboardData.totalRevenue.toFixed(2)} | Orders: {dashboardData.totalOrders}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchAdminDashboardData}
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <Button
              onClick={fetchAdminDashboardData}
              variant="ghost"
              size="sm"
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Users Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.userStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  +{dashboardData.userStats.newUsersThisMonth} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Products</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.totalProducts}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.productStats.activeProducts} active
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  +{dashboardData.orderStats.thisMonth} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${dashboardData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  +${dashboardData.orderStats.thisMonthRevenue.toFixed(0)} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Orders Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Processing Orders</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.pendingOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg Order</p>
                <p className="text-2xl font-bold text-white">
                  ${dashboardData.orderStats.averageOrderValue.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per order</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!dashboardData.recentOrders || dashboardData.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No recent orders found</p>
              <p className="text-gray-500 text-sm">Orders will appear here once customers start placing them</p>
            </div>
          ) : (
            <>
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{order.id}</span>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{order.customer}</p>
                    <p className="text-gray-500 text-xs">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      ${order.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => navigate('/admin/orders')}
              >
                View All Orders
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
