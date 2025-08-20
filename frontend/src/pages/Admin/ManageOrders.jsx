// ManageOrders.jsx - Complete fixed version with proper ID handling
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  X,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the modal components
import ViewOrderModal from "../Admin/modals/ViewOrderModal";
import UpdateStatusModal from "../Admin/modals/UpdateStausModal";
import TrackOrderModal from "../Admin/modals/TrackOrderModal";

// Admin Order API Service - Fixed with proper ID handling
const API_BASE_URL = 'http://localhost:5000/api';

const adminOrderAPI = {
  // Get all orders (admin only)
  getAllOrders: async () => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Fetching all orders...');
    
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    
    const data = await response.json();
    console.log('✅ Orders fetched:', data.orders?.length || 0);
    return data;
  },

  // Update order status (admin only) - FIXED with proper ID handling
  updateOrderStatus: async (orderId, statusData) => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Updating order status:');
    console.log('📝 Order ID:', orderId);
    console.log('📝 Status data:', statusData);
    console.log('📡 API URL:', `${API_BASE_URL}/admin/orders/${orderId}/status`);
    
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const responseData = await response.json();
    console.log('📦 Response data:', responseData);
    
    if (!response.ok) {
      console.error('❌ Update failed:', responseData);
      throw new Error(responseData.message || 'Failed to update order status');
    }
    
    console.log('✅ Order status updated successfully');
    return responseData;
  },

  // Get order by ID (admin only) - FIXED with proper ID handling
  getOrderById: async (orderId) => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Fetching order by ID:', orderId);
    
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch order');
    }
    
    const data = await response.json();
    console.log('✅ Order fetched:', data.order?.id);
    return data;
  }
};

export default function ManageOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Dynamic state for real data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching orders from API...');
      const response = await adminOrderAPI.getAllOrders();
      
      if (response.success) {
        console.log('✅ Orders fetched successfully:', response.orders?.length || 0);
        setOrders(response.orders || []);
      } else {
        console.error('❌ Failed to fetch orders:', response.message);
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // FIXED: Determine which modal should be open with proper ID matching
  const getCurrentModal = () => {
    const path = location.pathname;
    const orderId = params.id;
    
    console.log('🔍 Current path:', path);
    console.log('🔍 Order ID from params:', orderId);
    console.log('🔍 Available orders:', orders.map(o => ({ 
      id: o.id, 
      originalId: o.originalId,
      orderNumber: o.orderNumber 
    })));
    
    if (path.includes('/view') && orderId) {
      const order = orders.find(o => 
        o.id === orderId || 
        o.originalId === orderId || 
        o.originalId === parseInt(orderId) ||
        o.orderNumber === orderId
      );
      console.log('👁️ View order found:', order?.id);
      return { type: 'view', order };
    } else if (path.includes('/update-status') && orderId) {
      const order = orders.find(o => 
        o.id === orderId || 
        o.originalId === orderId || 
        o.originalId === parseInt(orderId) ||
        o.orderNumber === orderId
      );
      console.log('📝 Update status order found:', order?.id);
      return { type: 'updateStatus', order };
    } else if (path.includes('/track') && orderId) {
      const order = orders.find(o => 
        o.id === orderId || 
        o.originalId === orderId || 
        o.originalId === parseInt(orderId) ||
        o.orderNumber === orderId
      );
      console.log('🚚 Track order found:', order?.id);
      return { type: 'track', order };
    }
    
    return { type: null, order: null };
  };

  const currentModal = getCurrentModal();

  // Update selected order when route changes
  useEffect(() => {
    if (currentModal.order) {
      setSelectedOrder(currentModal.order);
    } else {
      setSelectedOrder(null);
    }
  }, [location.pathname, params.id, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Navigation helpers
  const navigateToModal = (type, orderId = null) => {
    const basePath = '/admin/orders';
    switch (type) {
      case 'view':
        navigate(`${basePath}/${orderId}/view`);
        break;
      case 'updateStatus':
        navigate(`${basePath}/${orderId}/update-status`);
        break;
      case 'track':
        navigate(`${basePath}/${orderId}/track`);
        break;
      default:
        navigate('/admin/orders');
    }
  };

  const closeModal = () => {
    navigate('/admin/orders');
  };

  // FIXED: Update order status with proper ID handling
  const handleUpdateStatus = async (updateStatusForm) => {
    try {
      console.log('🔄 Starting order status update...');
      console.log('📝 Selected order:', {
        id: selectedOrder?.id,
        originalId: selectedOrder?.originalId,
        orderNumber: selectedOrder?.orderNumber
      });
      console.log('📝 Update form data:', updateStatusForm);
      
      // Use the correct ID priority: originalId (database ID) > id (orderNumber)
      const orderId = selectedOrder.originalId || selectedOrder.id;
      console.log('🎯 Using order ID for update:', orderId);
      
      if (!orderId) {
        throw new Error('No valid order ID found');
      }

      const response = await adminOrderAPI.updateOrderStatus(orderId, {
        status: updateStatusForm.status,
        trackingNumber: updateStatusForm.trackingNumber || null,
        notes: updateStatusForm.notes || ''
      });

      if (response.success) {
        console.log('✅ Status update successful, updating local state...');
        
        // Update local state with proper ID matching
        setOrders(orders.map(order => {
          const isTargetOrder = 
            order.id === selectedOrder.id || 
            order.originalId === selectedOrder.originalId ||
            order.orderNumber === selectedOrder.orderNumber;
            
          return isTargetOrder ? { 
            ...order, 
            status: updateStatusForm.status,
            trackingNumber: updateStatusForm.trackingNumber || order.trackingNumber,
            notes: updateStatusForm.notes || order.notes
          } : order;
        }));
        
        closeModal();
        
        // Success feedback
        alert('✅ Order status updated successfully!');
        console.log('✅ Order status update completed');
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert(`❌ Failed to update order status: ${error.message}`);
    }
  };

  // FIXED: Quick status update with proper ID handling
  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('🔄 Quick status update for order:', orderId);
      
      const order = orders.find(o => o.id === orderId || o.originalId === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const updateId = order.originalId || order.id;
      const response = await adminOrderAPI.updateOrderStatus(updateId, { 
        status: newStatus 
      });

      if (response.success) {
        setOrders(orders.map(order => 
          (order.id === orderId || order.originalId === orderId) 
            ? { ...order, status: newStatus } 
            : order
        ));
        console.log('✅ Quick status update successful');
      }
    } catch (error) {
      console.error('❌ Error in quick status update:', error);
      alert(`❌ Failed to update order status: ${error.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              Manage Orders
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Loading orders...
            </p>
          </div>
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-gray-300 text-lg">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              Manage Orders
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Track and manage customer orders
            </p>
          </div>
          
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Orders</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button 
                onClick={fetchOrders}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header - Updated with real data count and refresh button */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                Manage Orders
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Track and manage customer orders ({orders.length} total)
              </p>
            </div>
            <Button
              onClick={refreshOrders}
              variant="outline"
              size="sm"
              className="border-gray-600 text-black hover:bg-gray-700"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Using real data */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Total Orders", value: orders.length, color: "bg-blue-600/20", icon: ShoppingCart, iconColor: "text-blue-400" },
            { label: "Pending", value: orders.filter(o => o.status === 'pending').length, color: "bg-yellow-600/20", icon: Clock, iconColor: "text-yellow-400" },
            { label: "Processing", value: orders.filter(o => o.status === 'processing').length, color: "bg-purple-600/20", icon: Package, iconColor: "text-purple-400" },
            { label: "Shipped", value: orders.filter(o => o.status === 'shipped').length, color: "bg-orange-600/20", icon: Truck, iconColor: "text-orange-400" },
            { label: "Delivered", value: orders.filter(o => o.status === 'delivered').length, color: "bg-green-600/20", icon: CheckCircle, iconColor: "text-green-400" },
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                    <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-6 h-6 sm:w-10 sm:h-10 ${stat.color} rounded-lg flex items-center justify-center self-end sm:self-auto`}>
                    <stat.icon className={`h-3 w-3 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter - Responsive */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder="Search orders by ID, customer, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 text-sm sm:text-base"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 w-full sm:w-auto justify-between sm:justify-center"
                size="sm"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="sm:hidden">Filter</span>
                  <span className="hidden sm:inline">Status: {filterStatus === "all" ? "All" : filterStatus}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 w-56">
              <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-white hover:bg-gray-700">
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending")} className="text-white hover:bg-gray-700">
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("processing")} className="text-white hover:bg-gray-700">
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("shipped")} className="text-white hover:bg-gray-700">
                Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("delivered")} className="text-white hover:bg-gray-700">
                Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("cancelled")} className="text-white hover:bg-gray-700">
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Orders Table/Cards - Shows real data or empty state */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {filteredOrders.length === 0 ? (
              // Empty state
              <div className="text-center p-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                <p className="text-gray-400 mb-6">
                  {orders.length === 0 
                    ? "No orders have been placed yet." 
                    : "No orders match your current search and filter criteria."
                  }
                </p>
                {searchTerm || filterStatus !== "all" ? (
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Items</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Total</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Payment</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                          <td className="py-4 px-4">
                            <div className="text-white font-medium">{order.id}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-white font-medium">{order.customer}</div>
                              <div className="text-gray-400 text-sm">{order.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-white">{order.items?.length || 0} items</td>
                          <td className="py-4 px-4 text-green-400 font-medium">${(order.total || 0).toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => navigateToModal('updateStatus', order.id)}
                              className="cursor-pointer"
                            >
                              <Badge className={`text-xs ${getStatusColor(order.status)} flex items-center gap-1 hover:opacity-80 transition-opacity`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{order.paymentMethod || 'N/A'}</td>
                          <td className="py-4 px-4 text-gray-300">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700/50">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem 
                                  onClick={() => navigateToModal('view', order.id)}
                                  className="text-white hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigateToModal('updateStatus', order.id)}
                                  className="text-white hover:bg-gray-700"
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                {order.trackingNumber && (
                                  <DropdownMenuItem 
                                    onClick={() => navigateToModal('track', order.id)}
                                    className="text-white hover:bg-gray-700"
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Track Package
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="bg-gray-700/30 border-gray-600/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium text-sm sm:text-base">{order.id}</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">{order.customer}</p>
                                <p className="text-gray-500 text-xs">{order.email}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                    <MoreHorizontal className="h-4 w-4 text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
                                  <DropdownMenuItem 
                                    onClick={() => navigateToModal('view', order.id)}
                                    className="text-white hover:bg-gray-700"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => navigateToModal('updateStatus', order.id)}
                                    className="text-white hover:bg-gray-700"
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  {order.trackingNumber && (
                                    <DropdownMenuItem 
                                      onClick={() => navigateToModal('track', order.id)}
                                      className="text-white hover:bg-gray-700"
                                    >
                                      <Truck className="h-4 w-4 mr-2" />
                                      Track Package
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
                              <div>
                                <span className="text-gray-400">Items:</span>
                                <span className="text-white ml-1">{order.items?.length || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Total:</span>
                                <span className="text-green-400 font-medium ml-1">${(order.total || 0).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Payment:</span>
                                <span className="text-white ml-1">{order.paymentMethod || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <span className="text-white ml-1">{new Date(order.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => navigateToModal('updateStatus', order.id)}
                                className="cursor-pointer"
                              >
                                <Badge className={`text-xs ${getStatusColor(order.status)} flex items-center gap-1 hover:opacity-80 transition-opacity`}>
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </Badge>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal Components - These handle the order management actions */}
        <ViewOrderModal 
          isOpen={currentModal.type === 'view'}
          onClose={closeModal}
          order={selectedOrder}
        />

        <UpdateStatusModal 
          isOpen={currentModal.type === 'updateStatus'}
          onClose={closeModal}
          onSubmit={handleUpdateStatus}
          order={selectedOrder}
        />

        <TrackOrderModal 
          isOpen={currentModal.type === 'track'}
          onClose={closeModal}
          order={selectedOrder}
        />
      </div>
    </div>
  );
}
