import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UpdateStatusModal({ isOpen, onClose, onSubmit, order }) {
  const navigate = useNavigate();
  const params = useParams();
  const [updateStatusForm, setUpdateStatusForm] = useState({
    status: "",
    trackingNumber: "",
    notes: ""
  });

  useEffect(() => {
    if (order) {
      setUpdateStatusForm({
        status: order.status,
        trackingNumber: order.trackingNumber || "",
        notes: order.notes || ""
      });
    }
  }, [order]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(updateStatusForm);
    navigate('/admin/orders');
  };

  const handleClose = () => {
    setUpdateStatusForm({
      status: "",
      trackingNumber: "",
      notes: ""
    });
    navigate('/admin/orders');
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
              <Package className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Update Order Status</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">Order ID: {params.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Status */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Current Order Status</h4>
              <div className="flex items-center gap-4">
                <Badge className={`${getStatusColor(order.status)} text-sm flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </Badge>
                <div className="text-gray-300">
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-sm text-gray-400">Order {order.id}</p>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">New Status</Label>
                <Select 
                  value={updateStatusForm.status} 
                  onValueChange={(value) => setUpdateStatusForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pending" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="processing" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Processing
                      </div>
                    </SelectItem>
                    <SelectItem value="shipped" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipped
                      </div>
                    </SelectItem>
                    <SelectItem value="delivered" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Delivered
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Tracking Number (Optional)</Label>
                <Input
                  value={updateStatusForm.trackingNumber}
                  onChange={(e) => setUpdateStatusForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Enter tracking number..."
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
                <p className="text-gray-400 text-xs">
                  Required for shipped status. Will be visible to customers.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Notes (Optional)</Label>
                <textarea
                  value={updateStatusForm.notes}
                  onChange={(e) => setUpdateStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this status update..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Change Notice */}
            {updateStatusForm.status !== order.status && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">Status Change Notice</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      Customer will be automatically notified about this status change via email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
