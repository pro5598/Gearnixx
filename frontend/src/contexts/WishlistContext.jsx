// contexts/WishlistContext.jsx - Complete working wishlist context
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // Track if data is loaded

  // Load wishlist from localStorage on app start
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('gamestore_wishlist');
      console.log('🔄 Loading wishlist from localStorage:', savedWishlist);
      
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        console.log('✅ Wishlist loaded:', parsedWishlist);
        setWishlistItems(parsedWishlist);
      }
    } catch (error) {
      console.error('❌ Error loading wishlist from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('gamestore_wishlist');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        console.log('💾 Saving wishlist to localStorage:', wishlistItems);
        localStorage.setItem('gamestore_wishlist', JSON.stringify(wishlistItems));
      } catch (error) {
        console.error('❌ Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      // Check if product already exists
      if (prev.some(item => item.id === product.id)) {
        console.log('ℹ️ Product already in wishlist:', product.name);
        return prev;
      }
      
      // Process image URL when adding to wishlist
      const processedProduct = {
        ...product,
        // Ensure image URL is properly formatted
        image: product.image?.startsWith('http') 
          ? product.image 
          : product.image?.startsWith('/uploads/')
          ? `http://localhost:5000${product.image}`
          : product.image || "/api/placeholder/300/250",
        dateAdded: new Date().toISOString(),
        // Ensure essential fields are present
        price: product.price || 0,
        name: product.name || 'Unknown Product',
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        stock: product.stock || 0,
        inStock: product.stock > 0,
        brand: product.brand || 'Unknown'
      };
      
      console.log('✅ Adding to wishlist with processed image:', {
        name: processedProduct.name,
        originalImage: product.image,
        processedImage: processedProduct.image
      });
      
      const newWishlist = [...prev, processedProduct];
      return newWishlist;
    });
  };

  const removeFromWishlist = (productId) => {
    console.log('🗑️ Removing from wishlist:', productId);
    setWishlistItems(prev => {
      const newWishlist = prev.filter(item => item.id !== productId);
      console.log('✅ Wishlist after removal:', newWishlist);
      return newWishlist;
    });
  };

  const isInWishlist = (productId) => {
    const inWishlist = wishlistItems.some(item => item.id === productId);
    return inWishlist;
  };

  const clearWishlist = () => {
    console.log('🧹 Clearing wishlist');
    setWishlistItems([]);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false; // Removed
    } else {
      addToWishlist(product);
      return true; // Added
    }
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    toggleWishlist,
    isLoaded // Export loading state
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
