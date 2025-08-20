import { useNavigate, useParams } from "react-router-dom";
import { X, Eye, Package, Edit, Truck, User, Mail, Phone, MapPin, CreditCard, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function ViewOrderModal({ isOpen, onClose, order }) {
  const navigate = useNavigate();
  const params = useParams();

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
      case 'pending': return <Package className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleClose = () => {
    navigate('/admin/orders');
  };

  const handleEdit = () => {
    navigate(`/admin/orders/${params.id}/update-status`);
  };

  const handleTrack = () => {
    navigate(`/admin/orders/${params.id}/track`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Order Details</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">Order ID: {params.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEdit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white hidden sm:flex"
            >
              <Edit className="h-4 w-4 mr-1" />
              Update
            </Button>
            {order.trackingNumber && (
              <Button
                onClick={handleTrack}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hidden sm:flex"
              >
                <Truck className="h-4 w-4 mr-1" />
                Track
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h3 className="text-xl font-semibold text-white">Order {order.id}</h3>
                <p className="text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-sm flex items-center gap-1`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </Badge>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <Label className="text-gray-400 text-sm">Name</Label>
                      <p className="text-white">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <Label className="text-gray-400 text-sm">Email</Label>
                      <p className="text-white">{order.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <Label className="text-gray-400 text-sm">Phone</Label>
                      <p className="text-white">{order.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h4>
                <div className="text-gray-300 space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Items
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-600/30 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-600"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/80/80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium text-sm sm:text-base">{item.name}</h5>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <p className="text-green-400 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-600">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h4>
                <p className="text-gray-300">{order.paymentMethod}</p>
              </div>

              {order.trackingNumber && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tracking Number
                  </h4>
                  <p className="text-purple-400 font-mono break-all">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Order Notes</h4>
                <p className="text-gray-300">{order.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-700">
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              {order.trackingNumber && (
                <Button
                  onClick={handleTrack}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 sm:flex-none"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
