// Wishlist.jsx - Complete working wishlist page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star,
  Search,
  Grid3X3,
  List,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Image component with better error handling
const ProductImage = ({ src, alt, className, fallbackSrc = "/api/placeholder/300/250" }) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      console.log('🖼️ Image failed to load, using fallback:', src);
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('🖼️ Image loaded successfully:', imageSrc);
    setIsLoading(false);
  };

  // Process image URL
  const processImageUrl = (url) => {
    if (!url || url === '' || url === 'null') {
      return fallbackSrc;
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    
    if (url.startsWith('/api/placeholder/')) {
      return url;
    }
    
    return fallbackSrc;
  };

  // Update image source when prop changes
  useState(() => {
    const processedUrl = processImageUrl(src);
    setImageSrc(processedUrl);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={processImageUrl(src)}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);

  // Show loading while wishlist is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Loading your saved items...
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-300 text-lg">Loading wishlist...</span>
        </div>
      </div>
    );
  }

  const showCartNotification = (message, type = 'success') => {
    setCartNotification({ message, type });
    setTimeout(() => setCartNotification(null), 3000);
  };

  const handleAddToCart = (item) => {
    try {
      addToCart(item);
      showCartNotification(`${item.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showCartNotification('Failed to add item to cart', 'error');
    }
  };

  const moveAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => isInStock(item));
    let addedCount = 0;
    
    inStockItems.forEach(item => {
      try {
        addToCart(item);
        addedCount++;
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    });
    
    if (addedCount > 0) {
      showCartNotification(`${addedCount} items added to cart!`, 'success');
    } else {
      showCartNotification('No items could be added to cart', 'error');
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const getBadgeColor = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'sale':
        return 'bg-red-600';
      case 'new':
        return 'bg-blue-600';
      case 'best seller':
        return 'bg-green-600';
      case 'popular':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const filteredItems = wishlistItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isInStock = (item) => {
    return item.inStock !== false && (item.stock === undefined || item.stock > 0);
  };

  console.log('🔍 Current wishlist items:', wishlistItems);
  console.log('🔍 Filtered items:', filteredItems);

  if (wishlistItems.length === 0) {
    return (
      <>
        {cartNotification && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              cartNotification.type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {cartNotification.type === 'success' ? 
                <CheckCircle className="h-5 w-5" /> : 
                <AlertTriangle className="h-5 w-5" />
              }
              <span className="font-medium">{cartNotification.message}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Your saved gaming gear collection
            </p>
          </div>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
              <p className="text-gray-400 mb-6">
                Save your favorite gaming gear for later by clicking the heart icon on any product.
              </p>
              <Button 
                onClick={() => navigate("/user/products")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {cartNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            cartNotification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {cartNotification.type === 'success' ? 
              <CheckCircle className="h-5 w-5" /> : 
              <AlertTriangle className="h-5 w-5" />
            }
            <span className="font-medium">{cartNotification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            My Wishlist ({wishlistItems.length} items)
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Your saved gaming gear collection
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Move All to Cart */}
          <Button
            onClick={moveAllToCart}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!wishlistItems.some(item => isInStock(item))}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Cart
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group"
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* FIXED: Use ProductImage component with better handling */}
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
                  />
                  
                  {item.badge && (
                    <Badge className={`absolute top-3 left-3 ${getBadgeColor(item.badge)} text-white`}>
                      {item.badge}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      console.log('🗑️ Removing item from wishlist:', item.id, item.name);
                      removeFromWishlist(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {!isInStock(item) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < Math.floor(item.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-400 ml-2">
                        ({item.reviews || item.rating || 0})
                      </span>
                    </div>
                  </div>
                  
                  <h3 
                    className="text-lg sm:text-xl text-white font-semibold mb-3 group-hover:text-purple-300 transition-colors cursor-pointer"
                    onClick={() => openProductModal(item)}
                  >
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-green-400">
                        ${item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      disabled={!isInStock(item)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isInStock(item) ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-gray-700/50 hover:bg-gray-600/70 text-gray-200 hover:text-white border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
                      onClick={() => openProductModal(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && searchTerm && (
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
              <p className="text-gray-400">
                No wishlist items match your search term "{searchTerm}".
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-white">Product Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeProductModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative">
                  <ProductImage
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {selectedProduct.badge && (
                    <Badge className={`absolute top-4 left-4 ${getBadgeColor(selectedProduct.badge)} text-white`}>
                      {selectedProduct.badge}
                    </Badge>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedProduct.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-400 ml-2">
                          {selectedProduct.rating || 0} ({selectedProduct.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {selectedProduct.name}
                    </h3>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Features */}
                  {selectedProduct.features && Array.isArray(selectedProduct.features) && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.features.map((feature, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {selectedProduct.specifications && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Specifications</h4>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="space-y-3">
                          {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-gray-400 font-medium">{key}:</span>
                              <span className="text-white">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl font-bold text-green-400">
                        ${selectedProduct.price}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">
                          ${selectedProduct.originalPrice}
                        </span>
                      )}
                      {selectedProduct.originalPrice && (
                        <Badge className="bg-red-600 text-white font-medium">
                          Save ${(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        disabled={!isInStock(selectedProduct)}
                        className={`flex-1 py-3 text-lg font-semibold ${
                          isInStock(selectedProduct)
                            ? "bg-purple-600 hover:bg-purple-700 text-white" 
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          handleAddToCart(selectedProduct);
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {isInStock(selectedProduct) ? "Add to Cart" : "Out of Stock"}
                      </Button>

                      <Button
                        variant="ghost"
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
                        onClick={() => {
                          removeFromWishlist(selectedProduct.id);
                          closeProductModal();
                        }}
                      >
                        <Trash2 className="h-5 w-5 mr-2" />
                        Remove from Wishlist
                      </Button>
                    </div>
                    
                    {!isInStock(selectedProduct) && (
                      <p className="text-red-400 text-sm mt-2">
                        This item is currently out of stock. Check back later!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
