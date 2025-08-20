import { useNavigate, useParams } from "react-router-dom";
import { X, Star, Edit, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function ViewProductModal({ isOpen, onClose, product }) {
  const navigate = useNavigate();
  const params = useParams();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'low_stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'mice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'keyboards': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'headsets': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'controllers': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleClose = () => {
    navigate('/admin/products');
  };

  const handleEdit = () => {
    navigate(`/admin/products/${params.id}/edit`);
  };

  const handleAnalytics = () => {
    navigate(`/admin/products/${params.id}/analytics`);
  };

  const handleDelete = () => {
    navigate(`/admin/products/${params.id}/delete`);
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
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Details</h2>
            <p className="text-gray-400 text-sm mt-1">Product ID: {params.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Action Buttons */}
            <Button
              onClick={handleEdit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={handleAnalytics}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg mb-4 border border-gray-600"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400 text-sm">Product Name</Label>
                    <p className="text-white font-medium text-lg">{product.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">Description</Label>
                    <p className="text-white">{product.description}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">Features</Label>
                    <p className="text-white">{product.features}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Product Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Category</Label>
                      <Badge className={`${getCategoryColor(product.category)} mt-1`}>
                        {product.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Status</Label>
                      <Badge className={`${getStatusColor(product.status)} mt-1`}>
                        {product.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Price</Label>
                      <p className="text-green-400 font-medium text-xl">${product.price}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Stock</Label>
                      <p className={`font-medium text-xl ${product.stock <= 10 ? 'text-red-400' : 'text-white'}`}>
                        {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Units Sold</Label>
                      <p className="text-white font-medium">{product.sold}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Rating</Label>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Brand</Label>
                      <p className="text-white">{product.brand}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Weight</Label>
                      <p className="text-white">{product.weight}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">Connectivity</Label>
                    <p className="text-white">{product.connectivity}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
