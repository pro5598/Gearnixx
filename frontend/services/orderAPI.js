// services/orderAPI.js
const API_BASE_URL = 'http://localhost:5000/api'; 

export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    const token = localStorage.getItem('token');
    
    console.log('🚀 Creating order with data:', orderData);
    console.log('🔑 Using token:', token ? 'Token present' : 'No token');
    console.log('📡 API URL:', `${API_BASE_URL}/orders`);
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    const result = await response.json();
    console.log('✅ Order created successfully:', result);
    return result;
  },

  // Get user orders (existing function - updated endpoint)
  getUserOrders: async () => {
    const token = localStorage.getItem('token');
    
    console.log('📡 Fetching user orders from:', `${API_BASE_URL}/orders/user`);
    
    const response = await fetch(`${API_BASE_URL}/orders/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user orders');
    }
    
    return response.json();
  },

  // NEW: Get all orders for admin with pagination and filtering
  getAllOrdersForAdmin: async (params = {}) => {
    const token = localStorage.getItem('token');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `${API_BASE_URL}/orders/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('📡 Admin fetching all orders from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Admin API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    
    const result = await response.json();
    console.log('✅ Admin orders fetched successfully:', result);
    return result;
  },

  // NEW: Get order statistics for admin dashboard
  getOrderStats: async () => {
    const token = localStorage.getItem('token');
    
    console.log('📊 Fetching order stats from:', `${API_BASE_URL}/orders/admin/stats`);
    
    const response = await fetch(`${API_BASE_URL}/orders/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Stats API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch order statistics');
    }
    
    const result = await response.json();
    console.log('📊 Order stats fetched successfully:', result);
    return result;
  },

  // NEW: Get recent orders for admin dashboard
  getRecentOrders: async (limit = 10) => {
    const token = localStorage.getItem('token');
    
    const url = `${API_BASE_URL}/orders/admin/recent?limit=${limit}`;
    console.log('📋 Fetching recent orders from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Recent orders API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch recent orders');
    }
    
    const result = await response.json();
    console.log('📋 Recent orders fetched successfully:', result);
    return result;
  },

  // NEW: Get single order by ID
  getOrderById: async (id) => {
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    const token = localStorage.getItem('token');
    
    console.log('🔍 Fetching order by ID from:', `${API_BASE_URL}/orders/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Get order API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch order');
    }
    
    const result = await response.json();
    console.log('🔍 Order fetched successfully:', result);
    return result;
  },

  // NEW: Update order status (admin only)
  updateOrderStatus: async (id, status) => {
    if (!id) {
      throw new Error('Order ID is required');
    }
    if (!status) {
      throw new Error('Status is required');
    }
    
    const token = localStorage.getItem('token');
    
    console.log('🔄 Updating order status:', { id, status });
    console.log('📡 API URL:', `${API_BASE_URL}/orders/${id}/status`);
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Update status API Error:', errorData);
      throw new Error(errorData.message || 'Failed to update order status');
    }
    
    const result = await response.json();
    console.log('✅ Order status updated successfully:', result);
    return result;
  },

  // Alias functions for backwards compatibility and admin dashboard
  getOrders: function(params = {}) {
    // For admin dashboard, use the admin endpoint
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      console.log('🔧 Admin detected, using admin orders endpoint');
      return this.getAllOrdersForAdmin(params);
    } else {
      console.log('👤 Regular user, using user orders endpoint');
      return this.getUserOrders();
    }
  },

  // Additional utility functions
  searchOrders: async (searchTerm, params = {}) => {
    if (!searchTerm) {
      throw new Error('Search term is required');
    }
    
    return this.getAllOrdersForAdmin({
      ...params,
      search: searchTerm
    });
  },

  getOrdersByStatus: async (status, params = {}) => {
    if (!status) {
      throw new Error('Status is required');
    }
    
    return this.getAllOrdersForAdmin({
      ...params,
      status: status
    });
  },

  getOrdersByDateRange: async (startDate, endDate, params = {}) => {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    return this.getAllOrdersForAdmin({
      ...params,
      startDate: startDate,
      endDate: endDate
    });
  },

  // Cancel order
  cancelOrder: async (id) => {
    return this.updateOrderStatus(id, 'cancelled');
  },

  // Mark order as shipped
  shipOrder: async (id) => {
    return this.updateOrderStatus(id, 'shipped');
  },

  // Mark order as delivered
  deliverOrder: async (id) => {
    return this.updateOrderStatus(id, 'delivered');
  }
};

// Export individual functions for easier importing
export const {
  createOrder,
  getUserOrders,
  getAllOrdersForAdmin,
  getOrderStats,
  getRecentOrders,
  getOrderById,
  updateOrderStatus,
  searchOrders,
  getOrdersByStatus,
  getOrdersByDateRange
} = orderAPI;

export default orderAPI;
