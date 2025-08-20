import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { productAPI } from "../../../services/api";
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Package,
  TrendingUp,
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

// Import your modal components
import AddProductModal from "../Admin/modals/AddProductModal";
import EditProductModal from "../Admin/modals/EditProductModal";
import ViewProductModal from "../Admin/modals/ViewProductModal";
import DeleteProductModal from "../Admin/modals/DeleteProductModal";

export default function ManageProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // 🔧 FIXED: useCallback to prevent fetchProducts from changing on every render
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || '',
        category: filterCategory === 'all' ? undefined : filterCategory,
        status: filterStatus === 'all' ? undefined : filterStatus,
        ...filters
      };

      console.log('🔍 Fetching products with params:', params);
      const response = await productAPI.getProducts(params);
      console.log('🔍 API Response:', response);
      
      // Handle different possible response formats
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
      
      console.log('✅ Setting products:', productsArray.length);
      setProducts(productsArray);
      
    } catch (err) {
      console.error('❌ Fetch products error:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []); // 🔧 FIXED: Empty dependency array to prevent infinite loops

  // 🔧 FIXED: Separate useEffect for initial load
  useEffect(() => {
    console.log('🚀 Initial products fetch');
    fetchProducts();
  }, []); // Only run once on mount

  // 🔧 FIXED: Debounced search effect to prevent continuous API calls
  useEffect(() => {
    console.log('🔄 Search/filter changed');
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory, filterStatus, fetchProducts]);

  // Determine current modal type from URL
  const getCurrentModal = useCallback(() => {
    const path = location.pathname;
    const productId = params.id ? parseInt(params.id) : null;
    
    if (path === '/admin/products/add') {
      return { type: 'add', product: null };
    } else if (path.includes('/edit') && productId) {
      const product = products.find(p => p.id === productId);
      return { type: 'edit', product };
    } else if (path.includes('/view') && productId) {
      const product = products.find(p => p.id === productId);
      return { type: 'view', product };
    } else if (path.includes('/delete') && productId) {
      const product = products.find(p => p.id === productId);
      return { type: 'delete', product };
    }
    
    return { type: null, product: null };
  }, [location.pathname, params.id, products]);

  const currentModal = getCurrentModal();

  // Update selected product when route changes
  useEffect(() => {
    if (currentModal.product) {
      setSelectedProduct(currentModal.product);
    } else {
      setSelectedProduct(null);
    }
  }, [currentModal]);

  // 🔧 FIXED: Enhanced CRUD operations
  const handleAddProduct = async (productData) => {
    console.log('🚀 Starting to add product');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.createProduct(productData);
      console.log('✅ Product created successfully:', response);
      
      // Refresh the products list
      await fetchProducts();
      
      // Navigate back to products list
      navigate('/admin/products');
      
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      setError(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.updateProduct(selectedProduct.id, productData);
      console.log('✅ Product updated successfully:', response);
      
      await fetchProducts();
      navigate('/admin/products');
      
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      setError(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await productAPI.deleteProduct(selectedProduct.id);
      console.log('✅ Product deleted successfully');
      
      await fetchProducts();
      navigate('/admin/products');
      
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      setError(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await productAPI.updateProductStatus(product.id, newStatus);
      await fetchProducts();
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      setError(error.message || 'Failed to update status');
    }
  };

  // Navigation helpers
  const navigateToModal = (type, productId = null) => {
    const basePath = '/admin/products';
    switch (type) {
      case 'add':
        navigate(`${basePath}/add`);
        break;
      case 'edit':
        navigate(`${basePath}/${productId}/edit`);
        break;
      case 'view':
        navigate(`${basePath}/${productId}/view`);
        break;
      case 'delete':
        navigate(`${basePath}/${productId}/delete`);
        break;
      default:
        navigate('/admin/products');
    }
  };

  const closeModal = () => {
    navigate('/admin/products');
  };

  // Helper functions for styling
  const getCategoryColor = (category) => {
    switch (category) {
      case 'mice': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'keyboards': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'headsets': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'controllers': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'low_stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredProducts = products.filter(product => {
    if (!product) return false;
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                Manage Products
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Create and manage your gaming products
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => fetchProducts()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-black hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button 
                onClick={() => navigateToModal('add')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-gray-300">Loading products...</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">Total Products</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">Active</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">Low Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {products.filter(p => p.status === 'low_stock').length}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">Out of Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {products.filter(p => p.status === 'out_of_stock').length}
                  </p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Category: {filterCategory === "all" ? "All" : filterCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => setFilterCategory("all")} className="text-white hover:bg-gray-700">
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("mice")} className="text-white hover:bg-gray-700">
                Gaming Mice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("keyboards")} className="text-white hover:bg-gray-700">
                Keyboards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("headsets")} className="text-white hover:bg-gray-700">
                Headsets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("controllers")} className="text-white hover:bg-gray-700">
                Controllers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Status: {filterStatus === "all" ? "All" : filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-white hover:bg-gray-700">
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")} className="text-white hover:bg-gray-700">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("inactive")} className="text-white hover:bg-gray-700">
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("low_stock")} className="text-white hover:bg-gray-700">
                Low Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("out_of_stock")} className="text-white hover:bg-gray-700">
                Out of Stock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Products Table/Cards */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {filteredProducts.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-300 text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {products.length === 0 
                    ? "Get started by adding your first product."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {products.length === 0 && (
                  <Button 
                    onClick={() => navigateToModal('add')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image?.startsWith('http') 
                                ? product.image 
                                : `http://localhost:5000${product.image}`
                              }
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded border border-gray-600"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/80/80";
                              }}
                            />
                            <div>
                              <div className="text-white font-medium">{product.name}</div>
                              <div className="text-gray-400 text-sm">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`text-xs ${getCategoryColor(product.category)}`}>
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-green-400 font-medium">${product.price}</td>
                        <td className="py-4 px-4 text-white">{product.stock}</td>
                        <td className="py-4 px-4">
                          <button onClick={() => handleToggleStatus(product)}>
                            <Badge className={`text-xs ${getStatusColor(product.status)} hover:opacity-80`}>
                              {product.status}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem 
                                onClick={() => navigateToModal('view', product.id)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => navigateToModal('edit', product.id)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => navigateToModal('delete', product.id)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Components */}
        <AddProductModal 
          isOpen={currentModal.type === 'add'}
          onClose={closeModal}
          onSubmit={handleAddProduct}
        />

        <EditProductModal 
          isOpen={currentModal.type === 'edit'}
          onClose={closeModal}
          onSubmit={handleEditProduct}
          product={selectedProduct}
        />

        <ViewProductModal 
          isOpen={currentModal.type === 'view'}
          onClose={closeModal}
          product={selectedProduct}
        />

        <DeleteProductModal 
          isOpen={currentModal.type === 'delete'}
          onClose={closeModal}
          onConfirm={handleDeleteProduct}
          product={selectedProduct}
        />
      </div>
    </div>
  );
}
