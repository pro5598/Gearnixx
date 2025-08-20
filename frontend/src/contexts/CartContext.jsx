import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Helper function to get the correct image URL for your Product model
const getProductImageUrl = (product) => {
  // Check different possible image field names - your Product model uses 'image'
  let imageUrl = product.image || product.image_url || product.imageUrl;
  
  if (!imageUrl || imageUrl === '/api/placeholder/80/80') {
    return "/api/placeholder/150/150";
  }
  
  // If it already starts with http, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it doesn't start with /, add it
  if (!imageUrl.startsWith('/')) {
    imageUrl = `/${imageUrl}`;
  }
  
  // Construct the full URL
  return `http://localhost:5000${imageUrl}`;
};

// Cart reducer to manage cart state
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: parseInt(action.payload.quantity || 0) }
            : item
        )
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading cart from localStorage...');
    
    try {
      const savedCart = localStorage.getItem('gearnix_cart');
      console.log('💾 Raw saved cart data:', savedCart);
      
      if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
        const parsedCart = JSON.parse(savedCart);
        console.log('📦 Parsed cart data:', parsedCart);
        
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Fix cart data to ensure proper number types
          const fixedCart = parsedCart.map(item => ({
            ...item,
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 0),
            stock: parseInt(item.stock || 0)
          }));
          
          console.log('✅ Loading cart with items:', fixedCart.length);
          dispatch({ type: 'LOAD_CART', payload: fixedCart });
        } else {
          console.log('📭 Cart is empty or invalid format');
        }
      } else {
        console.log('📭 No saved cart found');
      }
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('gearnix_cart');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length >= 0) { // Always save, even if empty
      console.log('💾 Saving cart to localStorage:', state.items.length, 'items');
      try {
        localStorage.setItem('gearnix_cart', JSON.stringify(state.items));
        console.log('✅ Cart saved successfully');
      } catch (error) {
        console.error('❌ Error saving cart to localStorage:', error);
      }
    }
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    console.log('🛒 Adding to cart:', product.name);
    
    // Transform product data to match cart item structure with proper image handling
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price || 0), // Ensure it's a number
      image: getProductImageUrl(product), // Use helper function for your Product model
      inStock: product.stock > 0,
      stock: parseInt(product.stock || 0), // Ensure stock is a number
      quantity: parseInt(quantity || 1), // Ensure quantity is a number
      // Additional product details for orders
      category: product.category,
      brand: product.brand || 'Gearnix',
      status: product.status || 'active'
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    console.log(`✅ Added ${product.name} to cart`);
  };

  const updateQuantity = (id, quantity) => {
    const parsedQuantity = parseInt(quantity || 0);
    
    if (parsedQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: parsedQuantity } });
  };

  const removeFromCart = (id) => {
    console.log('🗑️ Removing item from cart:', id);
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  const clearCart = () => {
    console.log('🧹 Clearing entire cart');
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    const total = state.items.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (price * quantity);
    }, 0);
    
    return total;
  };

  const getCartItemsCount = () => {
    const count = state.items.reduce((total, item) => {
      const quantity = parseInt(item.quantity || 0);
      return total + quantity;
    }, 0);
    
    return count;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getCartItem = (productId) => {
    return state.items.find(item => item.id === productId);
  };

  // Get cart items formatted for order creation
  const getCartItemsForOrder = () => {
    return state.items.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price || 0),
      quantity: parseInt(item.quantity || 0),
      image: item.image,
      category: item.category,
      brand: item.brand,
      status: item.status
    }));
  };

  // Validate cart items (check stock, active status)
  const validateCartItems = async () => {
    // This would typically make an API call to validate current stock levels
    // For now, we'll just check the stored stock values
    const invalidItems = state.items.filter(item => 
      !item.inStock || item.stock < item.quantity || item.status !== 'active'
    );
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  };

  // Update cart item stock status (useful for real-time updates)
  const updateItemStock = (productId, newStock, newStatus) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        id: productId,
        stock: parseInt(newStock || 0),
        inStock: newStock > 0,
        status: newStatus || 'active'
      }
    });
  };

  const value = {
    items: state.items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getCartItem,
    getCartItemsForOrder,
    validateCartItems,
    updateItemStock
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Export context for potential direct usage
export { CartContext };
