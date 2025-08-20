import { useNavigate, useParams } from "react-router-dom";
import { X, DollarSign, TrendingUp, Star, Package, Users, Calendar, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsModal({ isOpen, onClose, product }) {
  const navigate = useNavigate();
  const params = useParams();

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

  // Calculate additional metrics
  const calculateMetrics = (product) => {
    const totalRevenue = product.price * product.sold;
    const inventoryValue = product.price * product.stock;
    const turnoverRate = product.stock > 0 ? (product.sold / (product.sold + product.stock) * 100).toFixed(1) : 0;
    const averageOrderValue = product.sold > 0 ? totalRevenue / product.sold : 0;
    
    return {
      totalRevenue,
      inventoryValue,
      turnoverRate,
      averageOrderValue
    };
  };

  if (!isOpen || !product) return null;

  const metrics = calculateMetrics(product);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">
              Analytics for Product ID: {params.id} • {product.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleViewProduct}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              onClick={handleEditProduct}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Product Overview */}
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-600"
                onError={(e) => {
                  e.target.src = "/api/placeholder/80/80";
                }}
              />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{product.name}</h3>
                <p className="text-gray-400">{product.category} • {product.brand}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-green-400 font-medium">${product.price}</span>
                  <span className="text-gray-300">{product.stock} in stock</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${metrics.totalRevenue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Units Sold</p>
                  <p className="text-2xl font-bold text-white">{product.sold}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Inventory Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${metrics.inventoryValue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Customer Rating</p>
                  <p className="text-2xl font-bold text-white">{product.rating}/5.0</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Turnover Rate</p>
                  <p className="text-xl font-bold text-white">{metrics.turnoverRate}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Avg Order Value</p>
                  <p className="text-xl font-bold text-white">
                    ${metrics.averageOrderValue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Stock Status</p>
                  <p className={`text-xl font-bold ${
                    product.stock <= 10 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="bg-gray-700/30 p-6 rounded-lg">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Summary
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-600/30 rounded">
                  <span className="text-gray-300">Revenue Performance:</span>
                  <span className="text-green-400 font-medium">
                    ${metrics.totalRevenue.toFixed(2)} generated
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-600/30 rounded">
                  <span className="text-gray-300">Sales Performance:</span>
                  <span className="text-blue-400 font-medium">
                    {product.sold} units sold
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-600/30 rounded">
                  <span className="text-gray-300">Inventory Status:</span>
                  <span className={`font-medium ${
                    product.stock <= 10 ? 'text-red-400' : 'text-white'
                  }`}>
                    {product.stock} units remaining
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-600/30 rounded">
                  <span className="text-gray-300">Customer Satisfaction:</span>
                  <span className="text-yellow-400 font-medium">
                    {product.rating}/5.0 rating
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">💡 Recommendations</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                {product.stock <= 10 && (
                  <li>• Consider restocking - current inventory is low</li>
                )}
                {product.rating >= 4.5 && (
                  <li>• High customer satisfaction - consider promoting this product</li>
                )}
                {metrics.turnoverRate > 70 && (
                  <li>• Excellent turnover rate - popular product performing well</li>
                )}
                {product.sold > 200 && (
                  <li>• Strong sales performance - consider expanding similar products</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
