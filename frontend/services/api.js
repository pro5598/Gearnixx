import axios from 'axios';

// Use the correct environment variable based on your build tool
// For Vite: import.meta.env.VITE_API_URL
// For Create React App: process.env.REACT_APP_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response.data;
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || { 
      success: false, 
      message: error.message || 'Network error occurred' 
    });
  }
);

// Product API functions
export const productAPI = {
  // Get all products with enhanced filtering
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },

  // Get single product
  getProduct: (id) => {
    if (!id) {
      return Promise.reject({ success: false, message: 'Product ID is required' });
    }
    return api.get(`/products/${id}`);
  },

  // Create product with images
  createProduct: (productData) => {
    if (!productData) {
      return Promise.reject({ success: false, message: 'Product data is required' });
    }

    const formData = new FormData();
    
    // Append product data
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Handle multiple files
        const files = Array.isArray(productData[key]) ? productData[key] : Array.from(productData[key]);
        files.forEach(file => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (productData[key] !== null && productData[key] !== undefined && productData[key] !== '') {
        formData.append(key, productData[key]);
      }
    });

    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Extended timeout for file uploads
    });
  },

  // Update product with images  
  updateProduct: (id, productData) => {
    if (!id) {
      return Promise.reject({ success: false, message: 'Product ID is required' });
    }
    if (!productData) {
      return Promise.reject({ success: false, message: 'Product data is required' });
    }

    const formData = new FormData();
    
    // Append product data
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Handle multiple files
        const files = Array.isArray(productData[key]) ? productData[key] : Array.from(productData[key]);
        files.forEach(file => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (productData[key] !== null && productData[key] !== undefined && productData[key] !== '') {
        formData.append(key, productData[key]);
      }
    });

    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Extended timeout for file uploads
    });
  },

  // Delete product
  deleteProduct: (id) => {
    if (!id) {
      return Promise.reject({ success: false, message: 'Product ID is required' });
    }
    return api.delete(`/products/${id}`);
  },

  // Update product status
  updateProductStatus: (id, status) => {
    if (!id) {
      return Promise.reject({ success: false, message: 'Product ID is required' });
    }
    if (!status) {
      return Promise.reject({ success: false, message: 'Status is required' });
    }
    return api.patch(`/products/${id}/status`, { status });
  },

  // Update product stock
  updateProductStock: (id, stock) => {
    if (!id) {
      return Promise.reject({ success: false, message: 'Product ID is required' });
    }
    if (stock === null || stock === undefined) {
      return Promise.reject({ success: false, message: 'Stock quantity is required' });
    }
    return api.patch(`/products/${id}/stock`, { stock: parseInt(stock) });
  },

  // Bulk operations (additional useful methods)
  bulkUpdateStatus: (productIds, status) => {
    return api.patch('/products/bulk/status', { productIds, status });
  },

  bulkDelete: (productIds) => {
    return api.delete('/products/bulk', { data: { productIds } });
  }
};

// Export individual methods for easier testing
export const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductStock
} = productAPI;

export default api;
