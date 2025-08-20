import { useNavigate, useParams } from "react-router-dom";
import { X, Truck, Package, CheckCircle, Clock, XCircle, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrackOrderModal({ isOpen, onClose, order }) {
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
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleClose = () => {
    navigate('/admin/orders');
  };

  const handleViewOrder = () => {
    navigate(`/admin/orders/${params.id}/view`);
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
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Track Package</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">Order ID: {params.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Package Information */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Information
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-gray-400">Tracking Number:</span>
                  <span className="text-purple-400 font-mono break-all">{order.trackingNumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-gray-400">Current Status:</span>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white">{order.customer}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <span className="text-gray-400">Destination:</span>
                  <div className="text-white text-right">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Tracking Timeline
              </h4>
              <div className="space-y-4">
                {/* Order Placed */}
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium">Order Placed</p>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Order has been received and confirmed</p>
                  </div>
                </div>

                {/* Order Confirmed */}
                {order.status !== 'pending' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Order Confirmed</p>
                      <p className="text-gray-400 text-sm">Payment processed and order is being prepared</p>
                    </div>
                  </div>
                )}

                {/* Processing */}
                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Order Processing</p>
                      <p className="text-gray-400 text-sm">Items are being prepared for shipment</p>
                    </div>
                  </div>
                )}

                {/* Shipped */}
                {(['shipped', 'delivered'].includes(order.status)) && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Package Shipped</p>
                      <p className="text-gray-400 text-sm">Package is in transit to destination</p>
                      {order.trackingNumber && (
                        <p className="text-purple-400 text-sm font-mono">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Out for Delivery */}
                {order.status === 'delivered' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Out for Delivery</p>
                      <p className="text-gray-400 text-sm">Package is out for delivery</p>
                    </div>
                  </div>
                )}

                {/* Delivered */}
                {order.status === 'delivered' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Package Delivered</p>
                      <p className="text-gray-400 text-sm">Package has been successfully delivered</p>
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {order.status === 'cancelled' && (
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Order Cancelled</p>
                      <p className="text-gray-400 text-sm">Order has been cancelled</p>
                      {order.notes && (
                        <p className="text-red-400 text-sm">Reason: {order.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Delivery */}
            {['processing', 'shipped'].includes(order.status) && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">Estimated Delivery</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      {order.status === 'processing' 
                        ? 'Your order will ship within 1-2 business days'
                        : 'Expected delivery within 3-5 business days'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={() => window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
              >
                <Truck className="h-4 w-4 mr-2" />
                View on Carrier Website
              </Button>
              <Button
                onClick={handleViewOrder}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 sm:flex-none"
              >
                View Full Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
