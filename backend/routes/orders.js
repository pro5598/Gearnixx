// routes/orders.js - UPDATED VERSION
const express = require('express');
const router = express.Router();

// FIXED: Import the specific function you need from the authMiddleware object
const { authenticateToken } = require('../viable/authMiddleware');
const { 
  createOrder, 
  getUserOrders,
  // Add the new admin functions
  getAllOrdersForAdmin,
  getOrderStats,
  getRecentOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Verify functions before using them
if (typeof authenticateToken !== 'function') {
  throw new Error('authenticateToken is not a function');
}
if (typeof createOrder !== 'function') {
  throw new Error('createOrder is not a function');
}
if (typeof getUserOrders !== 'function') {
  throw new Error('getUserOrders is not a function');
}

// Verify new admin functions
if (typeof getAllOrdersForAdmin !== 'function') {
  throw new Error('getAllOrdersForAdmin is not a function');
}
if (typeof getOrderStats !== 'function') {
  throw new Error('getOrderStats is not a function');
}
if (typeof getRecentOrders !== 'function') {
  throw new Error('getRecentOrders is not a function');
}
if (typeof getOrderById !== 'function') {
  throw new Error('getOrderById is not a function');
}
if (typeof updateOrderStatus !== 'function') {
  throw new Error('updateOrderStatus is not a function');
}

console.log('✅ All handlers verified as functions');

// User routes (existing)
router.post('/', authenticateToken, createOrder);
router.get('/user', authenticateToken, getUserOrders); // Changed from '/' to '/user' to avoid conflicts

// Admin routes (new) - Place these BEFORE the generic routes to avoid conflicts
router.get('/admin/stats', authenticateToken, adminOnly, getOrderStats);
router.get('/admin/recent', authenticateToken, adminOnly, getRecentOrders);
router.get('/admin/all', authenticateToken, adminOnly, getAllOrdersForAdmin);

// Single order routes (should be last to avoid route conflicts)
router.get('/:id', authenticateToken, adminOnly, getOrderById);
router.patch('/:id/status', authenticateToken, adminOnly, updateOrderStatus);

module.exports = router;
