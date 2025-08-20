// services/reviewAPI.js - Complete API service with all review functionality
const API_BASE_URL = 'http://localhost:5000/api';

export const reviewAPI = {
  // Submit a new review
  submitReview: async (reviewData) => {
    const token = localStorage.getItem('token');
    
    console.log('📝 Submitting review:', reviewData);
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    console.log('📡 Review API response status:', response.status);
    
    const responseData = await response.json();
    console.log('📦 Review API response data:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to submit review');
    }
    
    return responseData;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const token = localStorage.getItem('token');
    
    console.log('📝 Updating review:', reviewId, reviewData);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    console.log('📡 Update review response status:', response.status);
    
    const responseData = await response.json();
    console.log('📦 Update review response data:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update review');
    }
    
    return responseData;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const token = localStorage.getItem('token');
    
    console.log('🗑️ Deleting review:', reviewId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Delete review response status:', response.status);
    
    const responseData = await response.json();
    console.log('📦 Delete review response data:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to delete review');
    }
    
    return responseData;
  },

  // Get user's reviews
  getUserReviews: async () => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Fetching user reviews...');
    
    const response = await fetch(`${API_BASE_URL}/reviews/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Get user reviews response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Get user reviews error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user reviews');
    }
    
    const responseData = await response.json();
    console.log('📦 User reviews fetched:', responseData.reviews?.length || 0);
    
    return responseData;
  },

  // Get reviews for a product
  getProductReviews: async (productId, page = 1, limit = 10) => {
    console.log('🔄 Fetching product reviews for:', productId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Get product reviews response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Get product reviews error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch product reviews');
    }
    
    const responseData = await response.json();
    console.log('📦 Product reviews fetched:', responseData.reviews?.length || 0);
    
    return responseData;
  },

  // Get review statistics for a product
  getProductReviewStats: async (productId) => {
    console.log('📊 Fetching review stats for product:', productId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch review statistics');
    }
    
    return response.json();
  },

  // Check if user can review a product
  checkReviewEligibility: async (productId, orderId) => {
    const token = localStorage.getItem('token');
    
    console.log('🔍 Checking review eligibility:', { productId, orderId });
    
    const response = await fetch(`${API_BASE_URL}/reviews/check-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, orderId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check review eligibility');
    }
    
    return response.json();
  },

  // ADMIN FUNCTIONS

  // Get all reviews (admin only)
  getAllReviews: async (page = 1, limit = 50) => {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Admin fetching all reviews...');
    
    const response = await fetch(`${API_BASE_URL}/reviews/admin/all?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Admin get all reviews response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Admin get all reviews error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch all reviews');
    }
    
    const responseData = await response.json();
    console.log('📦 Admin reviews fetched:', responseData.reviews?.length || 0);
    
    return responseData;
  },

  // Delete review (admin only)
  adminDeleteReview: async (reviewId) => {
    const token = localStorage.getItem('token');
    
    console.log('🗑️ Admin deleting review:', reviewId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Admin delete review response status:', response.status);
    
    const responseData = await response.json();
    console.log('📦 Admin delete review response data:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to delete review');
    }
    
    return responseData;
  },

  // Get review analytics (admin only)
  getReviewAnalytics: async () => {
    const token = localStorage.getItem('token');
    
    console.log('📊 Admin fetching review analytics...');
    
    const response = await fetch(`${API_BASE_URL}/reviews/admin/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch review analytics');
    }
    
    return response.json();
  }
};
