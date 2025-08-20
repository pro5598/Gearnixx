import { useNavigate, useParams } from "react-router-dom";
import { Trash2, X, AlertTriangle, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteProductModal({ isOpen, onClose, onConfirm, product }) {
  const navigate = useNavigate();
  const params = useParams();

  const handleConfirm = () => {
    onConfirm();
    // Navigation back to products is handled in the parent component
  };

  const handleClose = () => {
    navigate('/admin/products');
  };

  const handleViewProduct = () => {
    navigate(`/admin/products/${params.id}/view`);
  };

  const handleEditProduct = () => {
    navigate(`/admin/products/${params.id}/edit`);
  };

  // Handle browser back button
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Delete Product</h2>
            <p className="text-gray-400 text-sm mt-1">Product ID: {params.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Product Preview */}
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                onError={(e) => {
                  e.target.src = "/api/placeholder/80/80";
                }}
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">{product.name}</h3>
                <p className="text-gray-400 text-sm">${product.price} • {product.stock} in stock</p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">Are you sure?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  This action cannot be undone. This will permanently delete{' '}
                  <span className="font-medium text-white">{product.name}</span> from your inventory.
                </p>
                <p className="text-red-400 text-xs">
                  • All product data will be lost
                  • Sales history will be preserved
                  • This action is irreversible
                </p>
              </div>
            </div>

            {/* Alternative Actions */}
            <div className="bg-gray-700/20 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-3">
                Instead of deleting, you could:
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleViewProduct}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button
                  onClick={handleEditProduct}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Instead
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Product
              </Button>
              <Button variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
