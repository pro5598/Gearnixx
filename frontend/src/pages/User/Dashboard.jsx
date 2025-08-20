// Dashboard.jsx - Fixed version with enhanced debugging and error handling
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { orderAPI } from "../../../services/orderAPI";
import { productAPI } from "../../../services/api";
import {
  ShoppingBag,
  Heart,
  Package,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Gamepad2,
  Headphones,
  Mouse,
  Keyboard,
  Award,
  Zap,
  RefreshCw,
  AlertTriangle,
  Loader
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    featuredProducts: [],
    orderStats: {
      thisMonth: 0,
      thisMonthSpent: 0
    }
  });

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch dashboard data when user is loaded
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data in parallel
      await Promise.all([
        fetchUserOrders(),
        fetchFeaturedProducts()
      ]);

      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      console.log('🔄 Fetching user orders for dashboard...');
      console.log('👤 Current user:', user);
      
      // Try different API endpoints
      let response;
      try {
        response = await orderAPI.getUserOrders();
        console.log('📡 getUserOrders API response:', response);
      } catch (firstError) {
        console.log('❌ getUserOrders failed, trying getOrders:', firstError);
        try {
          response = await orderAPI.getOrders();
          console.log('📡 getOrders API response:', response);
        } catch (secondError) {
          console.error('❌ Both API calls failed:', secondError);
          throw new Error('Unable to fetch orders from any API endpoint');
        }
      }
      
      if (response && (response.success || response.orders || Array.isArray(response))) {
        let orders = [];
        
        // Handle different response structures
        if (response.orders) {
          orders = response.orders;
        } else if (Array.isArray(response.data)) {
          orders = response.data;
        } else if (Array.isArray(response)) {
          orders = response;
        }
        
        console.log('📊 Orders loaded:', orders.length);
        console.log('📊 First order sample:', orders[0]);

        if (orders.length > 0) {
          console.log('📊 Order fields available:', Object.keys(orders[0]));
        }

        // Enhanced statistics calculation with multiple fallback strategies
        const totalOrders = orders.length;
        console.log('📈 Total orders calculated:', totalOrders);
        
        // Strategy 1: Try multiple field names for totals
        let totalSpent = 0;
        const failedOrders = [];
        
        orders.forEach((order, index) => {
          console.log(`💰 Processing order ${index + 1}:`);
          console.log('Order data:', {
            id: order.id,
            total: order.total,
            totalAmount: order.totalAmount,
            subtotal: order.subtotal,
            price: order.price,
            amount: order.amount,
            finalAmount: order.finalAmount,
            items: order.items?.length || 0
          });

          // Try different field names in order of preference
          const possibleTotalFields = [
            'total',
            'totalAmount', 
            'subtotal',
            'price', 
            'amount',
            'finalAmount',
            'grandTotal'
          ];
          
          let orderTotal = 0;
          let usedField = null;
          
          // Try each field
          for (const fieldName of possibleTotalFields) {
            const fieldValue = order[fieldName];
            if (fieldValue !== undefined && fieldValue !== null && !isNaN(parseFloat(fieldValue)) && fieldValue > 0) {
              orderTotal = parseFloat(fieldValue);
              usedField = fieldName;
              console.log(`✅ Using field '${fieldName}' with value: ${orderTotal}`);
              break;
            }
          }

          // Strategy 2: Calculate from order items if no total field found
          if (orderTotal === 0 && order.items && order.items.length > 0) {
            console.log('🧮 Calculating from order items...');
            orderTotal = order.items.reduce((sum, item, itemIndex) => {
              console.log(`Item ${itemIndex + 1}:`, {
                price: item.price,
                quantity: item.quantity,
                productPrice: item.product?.price
              });
              
              const itemPrice = parseFloat(item.price || item.product?.price || 0);
              const itemQuantity = parseInt(item.quantity || 1);
              const itemTotal = itemPrice * itemQuantity;
              
              console.log(`Item total: ${itemPrice} × ${itemQuantity} = ${itemTotal}`);
              return sum + itemTotal;
            }, 0);
            usedField = 'calculated from items';
            console.log(`🧮 Calculated total from items: ${orderTotal}`);
          }

          if (orderTotal > 0) {
            totalSpent += orderTotal;
            console.log(`💵 Running total: ${totalSpent} (used ${usedField})`);
          } else {
            failedOrders.push({ index: index + 1, id: order.id });
            console.warn(`⚠️ Could not calculate total for order ${index + 1} (ID: ${order.id})`);
          }
        });
        
        console.log('💵 Final calculated total spent:', totalSpent);
        if (failedOrders.length > 0) {
          console.warn('⚠️ Failed to calculate totals for orders:', failedOrders);
        }
        
        // Get this month's data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.created_at || order.date);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
        
        const thisMonthCount = thisMonthOrders.length;
        
        // Calculate this month's spending using same logic
        let thisMonthSpent = 0;
        thisMonthOrders.forEach(order => {
          const possibleTotalFields = ['total', 'totalAmount', 'subtotal', 'price', 'amount', 'finalAmount'];
          
          let orderTotal = 0;
          for (const fieldName of possibleTotalFields) {
            const fieldValue = order[fieldName];
            if (fieldValue !== undefined && fieldValue !== null && !isNaN(parseFloat(fieldValue)) && fieldValue > 0) {
              orderTotal = parseFloat(fieldValue);
              break;
            }
          }

          if (orderTotal === 0 && order.items && order.items.length > 0) {
            orderTotal = order.items.reduce((sum, item) => {
              const itemPrice = parseFloat(item.price || item.product?.price || 0);
              const itemQuantity = parseInt(item.quantity || 1);
              return sum + (itemPrice * itemQuantity);
            }, 0);
          }

          thisMonthSpent += orderTotal;
        });

        console.log('📅 This month stats:', { thisMonthCount, thisMonthSpent });

        // Get recent orders (last 3)
        const recentOrders = orders
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
            const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
            return dateB - dateA;
          })
          .slice(0, 3)
          .map(order => {
            let orderTotal = 0;
            
            // Use same calculation logic
            const possibleTotalFields = ['total', 'totalAmount', 'subtotal', 'price', 'amount', 'finalAmount'];
            
            for (const fieldName of possibleTotalFields) {
              const fieldValue = order[fieldName];
              if (fieldValue !== undefined && fieldValue !== null && !isNaN(parseFloat(fieldValue)) && fieldValue > 0) {
                orderTotal = parseFloat(fieldValue);
                break;
              }
            }

            if (orderTotal === 0 && order.items && order.items.length > 0) {
              orderTotal = order.items.reduce((sum, item) => {
                const itemPrice = parseFloat(item.price || item.product?.price || 0);
                const itemQuantity = parseInt(item.quantity || 1);
                return sum + (itemPrice * itemQuantity);
              }, 0);
            }

            return {
              id: order.orderNumber || order.id,
              product: order.items?.[0]?.product?.name || 
                      order.items?.[0]?.productName || 
                      (order.items?.length > 1 ? `${order.items.length} items` : 'Order'),
              status: order.status || 'pending',
              date: formatTimeAgo(order.createdAt || order.created_at || order.date),
              price: `$${orderTotal.toFixed(2)}`,
              image: processImageUrl(order.items?.[0]?.product?.image || order.items?.[0]?.productImage)
            };
          });

        console.log('📋 Recent orders processed:', recentOrders);

        // Update state with calculated values
        const newDashboardData = {
          orders,
          totalOrders,
          totalSpent,
          recentOrders,
          orderStats: {
            thisMonth: thisMonthCount,
            thisMonthSpent
          }
        };

        console.log('📊 Setting dashboard data:', newDashboardData);

        setDashboardData(prev => ({
          ...prev,
          ...newDashboardData
        }));

        // Show success message if we found some data
        if (totalOrders > 0) {
          console.log(`✅ Successfully loaded ${totalOrders} orders with total spent: $${totalSpent.toFixed(2)}`);
        } else {
          console.log('ℹ️ No orders found - this is normal for new accounts');
        }

      } else {
        console.error('❌ API response not successful or empty:', response);
        throw new Error('API response indicates failure or no data');
      }
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      // Set empty data on error but don't block the dashboard
      setDashboardData(prev => ({
        ...prev,
        orders: [],
        totalOrders: 0,
        totalSpent: 0,
        recentOrders: [],
        orderStats: {
          thisMonth: 0,
          thisMonthSpent: 0
        }
      }));
      
      // Set a user-friendly error message
      setError(`Unable to load order data: ${error.message}. This might be normal if you haven't placed any orders yet.`);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      console.log('🔄 Fetching featured products for dashboard...');
      const response = await productAPI.getProducts({
        status: 'active',
        limit: 6
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

      const featuredProducts = productsArray
        .filter(product => product.status === 'active' && product.stock > 0)
        .slice(0, 3)
        .map(product => ({
          id: product.id,
          name: product.name,
          price: `$${parseFloat(product.price || 0).toFixed(2)}`,
          rating: product.rating || 0,
          image: processImageUrl(product.image),
          badge: getDynamicBadge(product)
        }));

      setDashboardData(prev => ({
        ...prev,
        featuredProducts
      }));

    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      setDashboardData(prev => ({
        ...prev,
        featuredProducts: []
      }));
    }
  };

  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return "/api/placeholder/200/150";
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:5000${imageUrl}`;
    }
    
    return "/api/placeholder/200/150";
  };

  const getDynamicBadge = (product) => {
    const createdDate = new Date(product.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (product.stock <= 10 && product.stock > 0) return "Limited";
    if (createdDate > weekAgo) return "New";
    if (product.rating >= 4.5) return "Top Rated";
    if (product.price < 50) return "Great Deal";
    return "Popular";
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      }
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Dynamic stats with real data - Enhanced with fallback values
  const stats = [
    {
      title: "Total Orders",
      value: (dashboardData.totalOrders || 0).toString(),
      change: `+${dashboardData.orderStats?.thisMonth || 0} this month`,
      icon: ShoppingBag,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Wishlist Items",
      value: (getWishlistCount() || 0).toString(),
      change: getWishlistCount() > 0 ? 'Items saved' : 'Start adding items',
      icon: Heart,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Total Spent",
      value: `$${(dashboardData.totalSpent || 0).toFixed(2)}`,
      change: `+$${(dashboardData.orderStats?.thisMonthSpent || 0).toFixed(2)} this month`,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Cart Items",
      value: (getCartItemsCount() || 0).toString(),
      change: getCartItemsCount() > 0 ? 'Ready to checkout' : 'Cart is empty',
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  const quickActions = [
    {
      title: "Browse Products",
      description: "Discover new gaming gear",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/user/products"),
    },
    {
      title: "Track Orders",
      description: `${dashboardData.totalOrders || 0} orders`,
      icon: Clock,
      color: "from-green-500 to-green-600",
      action: () => navigate("/user/orders"),
    },
    {
      title: "View Wishlist",
      description: `${getWishlistCount() || 0} saved items`,
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      action: () => navigate("/user/wishlist"),
    },
    {
      title: "Get Support",
      description: "Contact our gaming experts",
      icon: Headphones,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/user/support"),
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-gray-300 text-lg">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Welcome Header - Now with real user data */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName || user?.username || "Gamer"}! 🎮
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Ready to level up your gaming setup? You have {getCartItemsCount() || 0} items in cart and {getWishlistCount() || 0} items in wishlist.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">
              {user?.role === 'admin' ? 'Admin' : 'Gaming Elite'}
            </span>
          </div>
        </div>
      </div>

      {/* Error notification if there were partial failures */}
      {error && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">{error}</p>
            <Button
              onClick={fetchDashboardData}
              variant="ghost"
              size="sm"
              className="ml-auto text-yellow-400 hover:text-yellow-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid - Now using real data with null checks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Now using real data with better error handling */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-lg sm:text-xl">
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/user/orders")}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!dashboardData.recentOrders || dashboardData.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {error ? 'Unable to load orders' : 'No orders yet'}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {error ? 'Check the console for details' : 'Start shopping to see your orders here'}
                  </p>
                  <Button
                    onClick={() => navigate("/user/products")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                dashboardData.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => navigate("/user/orders")}
                  >
                    <img
                      src={order.image}
                      alt={order.product}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/60/60";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {order.product}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {order.id} • {order.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} border text-xs`}
                      >
                        {order.status}
                      </Badge>
                      <span className="text-green-400 font-semibold text-sm">
                        {order.price}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Updated with real counts */}
        <div>
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 hover:scale-[1.02] transition-all duration-200 text-left group border border-gray-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}
                    >
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {action.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Products - Now using real data */}
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg sm:text-xl">
            Recommended for You
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/user/products")}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            Shop All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {!dashboardData.featuredProducts || dashboardData.featuredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No products available</p>
              <Button
                onClick={() => navigate("/user/products")}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {dashboardData.featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => navigate("/user/products")}
                >
                  <div className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200 group-hover:scale-[1.02] border border-gray-600/30">
                    <div className="relative mb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 sm:h-36 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/200/150";
                        }}
                      />
                      <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
                        {product.badge}
                      </Badge>
                    </div>
                    <h3 className="text-white font-medium text-sm sm:text-base mb-2 group-hover:text-purple-300 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold text-sm sm:text-base">
                        {product.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-400 text-xs sm:text-sm">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
