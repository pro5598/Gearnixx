// BrowseProducts.jsx - Complete implementation with working wishlist
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext"; // Wishlist context
import { productAPI } from "../../../services/api";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart, // Heart icon for wishlist
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  Eye,
  ArrowUpDown,
  Plus,
  AlertTriangle,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BrowseProducts() {
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItemsCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist } = useWishlist(); // Wishlist functions
  
  const [cartNotification, setCartNotification] = useState(null);
  const [wishlistNotification, setWishlistNotification] = useState(null); // Wishlist notifications

  // All your existing state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // All your existing categories and brands
  const [categories, setCategories] = useState([
    { id: "all", name: "All Products", count: 0, icon: "🎮" },
    { id: "mice", name: "Gaming Mice", count: 0, icon: "🖱️" },
    { id: "keyboards", name: "Keyboards", count: 0, icon: "⌨️" },
    { id: "headsets", name: "Headsets", count: 0, icon: "🎧" },
    { id: "controllers", name: "Controllers", count: 0, icon: "🎮" }
  ]);

  const brands = [
    { id: "gearnix", name: "Gearnix", count: 0 },
    { id: "razer", name: "Razer", count: 0 },
    { id: "logitech", name: "Logitech", count: 0 },
    { id: "corsair", name: "Corsair", count: 0 },
    { id: "steelseries", name: "SteelSeries", count: 0 }
  ];

  // Wishlist notification handler
  const showWishlistNotification = (message, type = 'success') => {
    setWishlistNotification({ message, type });
    setTimeout(() => setWishlistNotification(null), 3000);
  };

  // Your existing cart notification handler
  const showCartNotification = (message, type = 'success') => {
    setCartNotification({ message, type });
    setTimeout(() => setCartNotification(null), 3000);
  };

  // Your existing add to cart handler
  const handleAddToCart = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      showCartNotification(`${product.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showCartNotification('Failed to add item to cart', 'error');
    }
  };

  // Wishlist toggle handler
  const handleToggleWishlist = (product) => {
    try {
      const wasAdded = toggleWishlist(product);
      if (wasAdded) {
        showWishlistNotification(`${product.name} added to wishlist!`, 'success');
      } else {
        showWishlistNotification(`${product.name} removed from wishlist`, 'info');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showWishlistNotification('Failed to update wishlist', 'error');
    }
  };

  // All your existing functions (fetchProducts, updateCategoryCounts, etc.)
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || '',
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: 'active',
        ...filters
      };

      console.log('🔍 Fetching products for customers:', params);
      const response = await productAPI.getProducts(params);
      console.log('🔍 API Response:', response);
      
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
      
      const activeProducts = productsArray.filter(product => 
        product.status === 'active' && product.stock > 0
      );
      
      console.log('✅ Setting products for customers:', activeProducts.length);
      setProducts(activeProducts);
      updateCategoryCounts(activeProducts);
      
    } catch (err) {
      console.error('❌ Fetch products error:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  const updateCategoryCounts = (productList) => {
    const categoryCounts = {
      all: productList.length,
      mice: productList.filter(p => p.category === 'mice').length,
      keyboards: productList.filter(p => p.category === 'keyboards').length,
      headsets: productList.filter(p => p.category === 'headsets').length,
      controllers: productList.filter(p => p.category === 'controllers').length
    };

    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: categoryCounts[cat.id] || 0
    })));
  };

  // All your existing useEffect hooks
  useEffect(() => {
    console.log('🚀 Initial products fetch for customers');
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, fetchProducts]);

  // All your existing filter and sort logic
  const filteredProducts = products.filter(product => {
    if (!product) return false;
    
    const productName = product.name || '';
    const productDescription = product.description || '';
    const productBrand = product.brand || '';
    const productPrice = product.price || 0;
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const isActive = product.status === 'active' && product.stock > 0;
    
    return matchesSearch && matchesCategory && matchesPrice && isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  // All your existing helper functions
  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 500]);
    setSearchTerm("");
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId?.toLowerCase());
    return brand ? brand.name : brandId || 'Unknown';
  };

  const getProductFeatures = (product) => {
    if (product.features) {
      if (typeof product.features === 'string') {
        return product.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
      if (Array.isArray(product.features)) {
        return product.features;
      }
    }
    
    const features = [];
    if (product.brand && product.brand !== 'Gearnix') features.push(product.brand);
    if (product.connectivity && product.connectivity !== 'N/A') features.push(product.connectivity);
    if (product.weight && product.weight !== 'N/A') features.push(product.weight);
    
    return features.slice(0, 3);
  };

  return (
    <>
      {/* Wishlist Notification */}
      {wishlistNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            wishlistNotification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : wishlistNotification.type === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {wishlistNotification.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {wishlistNotification.type === 'info' && <Heart className="h-5 w-5" />}
            {wishlistNotification.type === 'error' && <AlertTriangle className="h-5 w-5" />}
            <span className="font-medium">{wishlistNotification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Your existing header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Gaming Gear Collection
                </h1>
                <p className="text-gray-300 text-lg mb-4">
                  Discover premium gaming accessories designed for champions
                </p>
              </div>
              
              {getCartItemsCount() > 0 && (
                <Button
                  onClick={() => navigate('/user/cart')}
                  className="bg-purple-600 hover:bg-purple-700 text-white relative"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({getCartItemsCount()})
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white">30-day returns</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white">Expert support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your existing error display and controls */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
              <Button
                onClick={() => fetchProducts()}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Your existing search and controls section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search gaming gear, brands, features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white font-medium text-sm">
                    {loading ? 'Loading...' : `${sortedProducts.length} Products Found`}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {selectedCategory !== "all" && `in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 h-9"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Your existing sort and view controls */}
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 h-9 min-w-[140px] justify-between"
                    >
                      <div className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Sort: </span>
                        <span className="truncate">
                          {sortBy === "price-low" ? "Price ↑" : 
                           sortBy === "price-high" ? "Price ↓" :
                           sortBy === "rating" ? "Rating" :
                           sortBy === "newest" ? "Newest" : "Featured"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700 w-48">
                    <DropdownMenuItem onClick={() => setSortBy("featured")} className="text-white hover:bg-gray-700">
                      Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-low")} className="text-white hover:bg-gray-700">
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-high")} className="text-white hover:bg-gray-700">
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("rating")} className="text-white hover:bg-gray-700">
                      Highest Rated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("newest")} className="text-white hover:bg-gray-700">
                      Newest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex bg-gray-700/50 rounded-lg border border-gray-600 p-1 h-9">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-7 w-8 p-0 ${
                      viewMode === "grid" 
                        ? "bg-purple-600 text-white hover:bg-purple-700" 
                        : "text-gray-400 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-7 w-8 p-0 ${
                      viewMode === "list" 
                        ? "bg-purple-600 text-white hover:bg-purple-700" 
                        : "text-gray-400 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Your existing active filters section */}
          {(selectedCategory !== "all" || searchTerm) && (
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-700/50">
                <span className="text-gray-400 text-sm font-medium">Active filters:</span>
                
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white text-xs h-6"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Your existing sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid - WITH WISHLIST FUNCTIONALITY */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <span className="ml-4 text-gray-300 text-lg">Loading amazing products...</span>
              </div>
            )}

            {!loading && sortedProducts.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                  <p className="text-gray-400 mb-6">
                    {products.length === 0 
                      ? "No products are currently available. Check back soon!"
                      : "We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
                    }
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : !loading && (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {sortedProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group cursor-pointer overflow-hidden h-full flex flex-col"
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image?.startsWith('http') 
                            ? product.image 
                            : `http://localhost:5000${product.image}`
                          }
                          alt={product.name}
                          className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          onClick={() => openProductModal(product)}
                          onError={(e) => {
                            e.target.src = "/api/placeholder/400/300";
                          }}
                        />
                        
                        <div className="absolute top-3 right-3 flex gap-2">
                          {/* WISHLIST HEART BUTTON - THIS IS THE KEY FUNCTIONALITY */}
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className={`h-8 w-8 p-0 shadow-lg transition-all duration-200 ${
                              isInWishlist(product.id)
                                ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/50 shadow-lg"
                                : "bg-white/90 hover:bg-white text-gray-800"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(product);
                            }}
                          >
                            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProductModal(product);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                              Out of Stock
                            </div>
                          </div>
                        )}

                        {product.stock > 0 && product.stock <= 10 && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-yellow-600 text-white text-xs">
                              Only {product.stock} left!
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Rest of your existing product card content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-400 ml-2">
                              {product.rating || 0} ({product.reviews || 0})
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                            {getBrandName(product.brand)}
                          </Badge>
                        </div>
                        
                        <h3 
                          className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors line-clamp-2 flex-1 cursor-pointer"
                          onClick={() => openProductModal(product)}
                        >
                          {product.name}
                        </h3>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {getProductFeatures(product).slice(0, 3).map((feature, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-gray-700/50 text-gray-300 border-gray-600"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-xl font-bold text-green-400">
                            ${product.price}
                          </span>
                        </div>

                        {/* Your existing cart buttons */}
                        {product.stock <= 0 ? (
                          <Button 
                            disabled 
                            className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Out of Stock
                          </Button>
                        ) : isInCart(product.id) ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/user/cart');
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              View Cart
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product, 1);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Your existing modal with wishlist button */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
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

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative">
                  <img
                    src={selectedProduct.image?.startsWith('http') 
                      ? selectedProduct.image 
                      : `http://localhost:5000${selectedProduct.image}`
                    }
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />
                  {/* WISHLIST BUTTON IN MODAL */}
                  <Button 
                    size="sm" 
                    className={`absolute top-4 right-4 h-10 w-10 p-0 shadow-lg transition-all duration-200 ${
                      isInWishlist(selectedProduct.id)
                        ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/50 shadow-lg"
                        : "bg-white/90 hover:bg-white text-gray-800"
                    }`}
                    onClick={() => handleToggleWishlist(selectedProduct)}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(selectedProduct.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Rest of your existing modal content */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {getBrandName(selectedProduct.brand)}
                      </Badge>
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

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {getProductFeatures(selectedProduct).map((feature, index) => (
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

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Product Details</h4>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Category:</span>
                          <span className="text-white capitalize">{selectedProduct.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Brand:</span>
                          <span className="text-white">{getBrandName(selectedProduct.brand)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Stock:</span>
                          <span className={`font-medium ${selectedProduct.stock > 10 ? 'text-green-400' : selectedProduct.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of stock'}
                          </span>
                        </div>
                        {selectedProduct.weight && selectedProduct.weight !== 'N/A' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Weight:</span>
                            <span className="text-white">{selectedProduct.weight}</span>
                          </div>
                        )}
                        {selectedProduct.connectivity && selectedProduct.connectivity !== 'N/A' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Connectivity:</span>
                            <span className="text-white">{selectedProduct.connectivity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl font-bold text-green-400">
                        ${selectedProduct.price}
                      </span>
                    </div>

                    {/* Your existing modal cart buttons */}
                    <div className="flex gap-4">
                      {selectedProduct.stock <= 0 ? (
                        <Button 
                          disabled 
                          className="flex-1 py-3 text-lg font-semibold bg-gray-600 text-gray-400 cursor-not-allowed"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Out of Stock
                        </Button>
                      ) : isInCart(selectedProduct.id) ? (
                        <div className="flex gap-4 w-full">
                          <Button
                            onClick={() => {
                              closeProductModal();
                              navigate('/user/cart');
                            }}
                            className="flex-1 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            View Cart
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(selectedProduct, 1)}
                            variant="outline"
                            className="px-6 py-3 border-purple-500 text-purple-400 hover:bg-purple-500/10"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleAddToCart(selectedProduct, 1)}
                          className="flex-1 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                    
                    {selectedProduct.stock <= 0 && (
                      <p className="text-red-400 text-sm mt-2">
                        This item is currently out of stock. Check back later!
                      </p>
                    )}
                    
                    {selectedProduct.stock > 0 && selectedProduct.stock <= 10 && (
                      <p className="text-yellow-400 text-sm mt-2">
                        ⚡ Only {selectedProduct.stock} left in stock!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your existing cart notification */}
      {cartNotification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          cartNotification.type === 'success' 
            ? 'bg-green-800/90 border-green-500 text-green-100' 
            : 'bg-red-800/90 border-red-500 text-red-100'
        } backdrop-blur-sm animate-in slide-in-from-right-5`}>
          <div className="flex items-center gap-2">
            {cartNotification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{cartNotification.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
