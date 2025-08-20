// services/adminOrderAPI.js
const API_BASE_URL = 'http://localhost:5000/api';

export const adminOrderAPI = {
  // Get all orders (admin only)
  getAllOrders: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    
    return response.json();
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, statusData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status');
    }
    
    return response.json();
  },

  // Get order by ID (admin only)
  getOrderById: async (orderId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch order');
    }
    
    return response.json();
  }
};
