// OrderHistory.jsx - Complete implementation with review functionality
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../../services/orderapi";
import { reviewAPI } from "../../../services/reviewAPI";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
    recommend: null
  });

  // Dynamic orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Track which items have been reviewed
  const [reviewedItems, setReviewedItems] = useState(new Set());

  // Fetch orders and reviews on component mount
  useEffect(() => {
    fetchOrders();
    fetchUserReviews();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching orders from API...');
      const response = await orderAPI.getOrders();
      console.log('📦 Orders API response:', response);
      
      if (response.success) {
        // Transform Sequelize data to match component structure
        const transformedOrders = response.orders.map(order => ({
          id: order.orderNumber,
          originalId: order.id, // Keep original ID for operations
          date: order.createdAt,
          status: order.status,
          total: parseFloat(order.total),
          subtotal: parseFloat(order.subtotal),
          shipping: parseFloat(order.shipping || 0),
          tax: parseFloat(order.tax || 0),
          items: order.items.map(item => ({
            id: `item-${item.id}`,
            originalId: item.id, // Keep original item ID for reviews
            name: item.productName,
            quantity: item.quantity,
            price: parseFloat(item.price),
            image: item.productImage || "/api/placeholder/80/80",
            productId: item.productId
          })),
          estimatedDelivery: order.estimatedDelivery,
          deliveredDate: order.deliveredDate,
          shippingAddress: order.customerDetails ? {
            name: `${order.customerDetails.firstName} ${order.customerDetails.lastName}`,
            street: order.customerDetails.address,
            city: order.customerDetails.city || "N/A",
            state: order.customerDetails.state || "N/A",
            zipCode: order.customerDetails.zipCode || "N/A",
            country: "USA"
          } : {
            name: "N/A",
            street: "N/A",
            city: "N/A",
            state: "N/A",
            zipCode: "N/A",
            country: "USA"
          },
          paymentMethod: order.paymentDetails?.method || "Bank Transfer"
        }));
        
        console.log('✅ Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's reviews to track what's already reviewed
  const fetchUserReviews = async () => {
    try {
      console.log('🔄 Fetching user reviews...');
      const response = await reviewAPI.getUserReviews();
      if (response.success) {
        const reviewedItemIds = new Set();
        response.reviews.forEach(review => {
          // Create a unique key for each order item
          reviewedItemIds.add(`${review.productId}-${review.orderId}`);
        });
        setReviewedItems(reviewedItemIds);
        console.log('✅ Reviewed items loaded:', reviewedItemIds);
      }
    } catch (error) {
      console.error('❌ Error fetching user reviews:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Check if item can be reviewed and isn't already reviewed
  const canReviewItem = (item, orderStatus, orderId) => {
    const reviewKey = `${item.productId}-${orderId}`;
    return orderStatus === "delivered" && !reviewedItems.has(reviewKey);
  };

  // Check if item has been reviewed
  const isItemReviewed = (item, orderId) => {
    const reviewKey = `${item.productId}-${orderId}`;
    return reviewedItems.has(reviewKey);
  };

  // Open review modal with proper IDs
  const openReviewModal = (item, order) => {
    console.log('🌟 Opening review modal for:', { item, order });
    setReviewingItem({ 
      ...item, 
      orderId: order.id,
      originalOrderId: order.originalId, // Database ID for API
      originalItemId: item.originalId // Original item ID for API
    });
    setReviewForm({
      rating: 0,
      title: "",
      comment: "",
      recommend: null
    });
  };

  const closeReviewModal = () => {
    setReviewingItem(null);
    setReviewForm({
      rating: 0,
      title: "",
      comment: "",
      recommend: null
    });
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  // Handle review submission with real API
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewForm.rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingReview(true);

    try {
      console.log('📝 Submitting review for:', reviewingItem);
      
      const reviewData = {
        productId: reviewingItem.productId,
        orderId: reviewingItem.originalOrderId, // Use original order DB ID
        orderItemId: reviewingItem.originalItemId, // Use original item ID
        rating: reviewForm.rating,
        title: reviewForm.title || null,
        comment: reviewForm.comment || null,
        recommend: reviewForm.recommend
      };

      console.log('📤 Review data:', reviewData);

      const response = await reviewAPI.submitReview(reviewData);

      if (response.success) {
        // Add to reviewed items
        const reviewKey = `${reviewingItem.productId}-${reviewingItem.originalOrderId}`;
        setReviewedItems(prev => new Set([...prev, reviewKey]));
        
        // Show success message
        alert("✅ Thank you for your review! It has been submitted successfully.");
        
        closeReviewModal();
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert(`❌ Failed to submit review: ${error.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Order History
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Loading your orders...
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-300 text-lg">Loading your order history...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Order History
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Track and manage your gaming gear orders
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
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Order History
            </h1>
            <Button
              onClick={() => {
                fetchOrders();
                fetchUserReviews();
              }}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">
            Track and manage your gaming gear orders ({orders.length} total)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search orders or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => setStatusFilter("all")} className="text-white hover:bg-gray-700">
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")} className="text-white hover:bg-gray-700">
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("shipped")} className="text-white hover:bg-gray-700">
                Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("delivered")} className="text-white hover:bg-gray-700">
                Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")} className="text-white hover:bg-gray-700">
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't placed any orders yet. Start shopping for gaming gear!"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button 
                    onClick={() => navigate("/user/products")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Browse Products
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        Order {order.id}
                        <Badge className={`${getStatusColor(order.status)} border text-xs`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">
                        ${order.total.toFixed(2)}
                      </p>
                      {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                        <p className="text-gray-400 text-sm">
                          Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm sm:text-base truncate">
                            {item.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                          {isItemReviewed(item, order.originalId) && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Reviewed
                            </Badge>
                          )}
                        </div>
                        
                        {/* Review Button for Delivered Items */}
                        {canReviewItem(item, order.status, order.originalId) && (
                          <Button
                            size="sm"
                            onClick={() => openReviewModal(item, order)}
                            className="bg-purple-600/80 hover:bg-purple-600 text-white text-xs px-3 py-1"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                      className="bg-gray-700/50 hover:bg-gray-600/70 text-gray-200 hover:text-white border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {(order.status === "delivered" || order.status === "cancelled") && (
                      <Button
                        size="sm"
                        className="bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-500/50 hover:border-purple-400 shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                        onClick={() => navigate("/user/products")}
                      >
                        Reorder Items
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Order {selectedOrder.id}
                  <Badge className={`${getStatusColor(selectedOrder.status)} border text-sm`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
                  </Badge>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Placed on {new Date(selectedOrder.date).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeOrderDetails}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-lg mb-1">
                          {item.name}
                        </h4>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-green-400 font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        {isItemReviewed(item, selectedOrder.originalId) && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-2">
                            <Star className="h-3 w-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                      </div>
                      
                      {/* Review Button in Modal */}
                      {canReviewItem(item, selectedOrder.status, selectedOrder.originalId) && (
                        <Button
                          size="sm"
                          onClick={() => openReviewModal(item, selectedOrder)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Write Review
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h4>
                  <div className="text-gray-300 space-y-1">
                    <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h4>
                  <p className="text-gray-300">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Order placed - {new Date(selectedOrder.date).toLocaleDateString()}</span>
                  </div>
                  
                  {selectedOrder.status !== "cancelled" && (
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedOrder.status === "processing" ? "bg-yellow-500" : "bg-green-500"
                      }`}></div>
                      <span className="text-gray-300">Order confirmed and processing</span>
                    </div>
                  )}
                  
                  {selectedOrder.status === "shipped" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">Order shipped</span>
                    </div>
                  )}
                  
                  {selectedOrder.status === "delivered" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Order delivered - {selectedOrder.deliveredDate && new Date(selectedOrder.deliveredDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {selectedOrder.status === "cancelled" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-300">Order cancelled</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>{selectedOrder.shipping === 0 ? "Free" : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-600">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Review Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400" />
                Write a Review
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Review Modal Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
                <img
                  src={reviewingItem.image}
                  alt={reviewingItem.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-white font-medium text-lg">{reviewingItem.name}</h3>
                  <p className="text-gray-400 text-sm">Order {reviewingItem.orderId}</p>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Rating *</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className="transition-colors duration-150"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= reviewForm.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-300">
                      {reviewForm.rating > 0 && (
                        <>
                          {reviewForm.rating} of 5 stars
                          {reviewForm.rating === 1 && " - Poor"}
                          {reviewForm.rating === 2 && " - Fair"}
                          {reviewForm.rating === 3 && " - Good"}
                          {reviewForm.rating === 4 && " - Very Good"}
                          {reviewForm.rating === 5 && " - Excellent"}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Review Title</Label>
                  <Input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience..."
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Your Review</Label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Tell others about your experience with this product..."
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Recommendation */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Would you recommend this product?</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, recommend: true }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        reviewForm.recommend === true
                          ? "bg-green-600/20 border-green-500/50 text-green-400"
                          : "bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, recommend: false }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        reviewForm.recommend === false
                          ? "bg-red-600/20 border-red-500/50 text-red-400"
                          : "bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <X className="h-4 w-4" />
                      No
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeReviewModal}
                    disabled={submittingReview}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
