// routes/adminOrders.js - Complete fixed version with proper ID handling
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../viable/authMiddleware');
const { Order, OrderItem, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all orders (admin only) - FIXED with better error handling
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📡 Admin fetching orders with params:', { status, search, page, limit });

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    let userWhereClause = {};
    if (search) {
      userWhereClause = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'productId', 'quantity', 'price', 'productName', 'productImage']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          where: search ? userWhereClause : undefined,
          required: search ? true : false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    console.log(`✅ Found ${orders.length} orders out of ${count} total`);

    // Transform data to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order.orderNumber, // Frontend display ID
      originalId: order.id,   // Database ID for API calls
      orderNumber: order.orderNumber,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      phone: order.customerDetails?.phone || 'N/A',
      total: parseFloat(order.total || 0),
      subtotal: parseFloat(order.subtotal || 0),
      shipping: parseFloat(order.shipping || 0),
      tax: parseFloat(order.tax || 0),
      status: order.status || 'pending',
      items: (order.items || []).map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.productImage || "/api/placeholder/80/80"
      })),
      date: order.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      paymentMethod: order.paymentDetails?.method || 'Bank Transfer',
      shippingAddress: {
        name: `${order.customerDetails?.firstName || ''} ${order.customerDetails?.lastName || ''}`.trim(),
        street: order.customerDetails?.address || "N/A",
        city: order.customerDetails?.city || "N/A",
        state: order.customerDetails?.state || "N/A",
        zipCode: order.customerDetails?.zipCode || "N/A",
        country: "USA"
      },
      trackingNumber: order.trackingNumber || null,
      notes: order.notes || '',
      estimatedDelivery: order.estimatedDelivery,
      deliveredDate: order.deliveredDate
    }));

    res.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get single order by ID (admin only) - FIXED with flexible ID matching
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Admin fetching order with ID:', id);

    // Try to find order by both orderNumber AND database id
    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { orderNumber: id },
          { id: parseInt(id) || 0 }
        ]
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'productId', 'quantity', 'price', 'productName', 'productImage']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!order) {
      console.log('❌ Order not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', order.orderNumber, 'Database ID:', order.id);

    // Transform data
    const transformedOrder = {
      id: order.orderNumber,
      originalId: order.id,
      orderNumber: order.orderNumber,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      phone: order.customerDetails?.phone || 'N/A',
      total: parseFloat(order.total || 0),
      subtotal: parseFloat(order.subtotal || 0),
      shipping: parseFloat(order.shipping || 0),
      tax: parseFloat(order.tax || 0),
      status: order.status || 'pending',
      items: (order.items || []).map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
        image: item.productImage || "/api/placeholder/80/80"
      })),
      date: order.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      paymentMethod: order.paymentDetails?.method || 'Bank Transfer',
      shippingAddress: {
        name: `${order.customerDetails?.firstName || ''} ${order.customerDetails?.lastName || ''}`.trim(),
        street: order.customerDetails?.address || "N/A",
        city: order.customerDetails?.city || "N/A",
        state: order.customerDetails?.state || "N/A",
        zipCode: order.customerDetails?.zipCode || "N/A",
        country: "USA"
      },
      trackingNumber: order.trackingNumber || null,
      notes: order.notes || '',
      estimatedDelivery: order.estimatedDelivery,
      deliveredDate: order.deliveredDate
    };

    res.json({
      success: true,
      order: transformedOrder
    });

  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Update order status (admin only) - FIXED with comprehensive ID handling
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    console.log('🔄 Admin updating order status:');
    console.log('📝 Order ID:', id);
    console.log('📝 New status:', status);
    console.log('📝 Tracking number:', trackingNumber);
    console.log('📝 Notes:', notes);
    
    // Try to find order by both orderNumber AND database id with flexible matching
    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { orderNumber: id },
          { orderNumber: String(id) },
          { id: parseInt(id) || 0 },
          { id: String(id) }
        ]
      }
    });
    
    if (!order) {
      console.log('❌ Order not found with ID:', id);
      console.log('📋 Available orders in DB:', await Order.findAll({
        attributes: ['id', 'orderNumber'],
        limit: 5
      }));
      
      return res.status(404).json({
        success: false,
        message: `Order not found with ID: ${id}`
      });
    }
    
    console.log('✅ Found order:', order.orderNumber, 'Database ID:', order.id);
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update order
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (notes !== undefined) updateData.notes = notes || '';
    if (status === 'delivered') updateData.deliveredDate = new Date();
    
    console.log('📝 Updating with data:', updateData);
    
    await order.update(updateData);
    
    console.log('✅ Order status updated successfully');
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order.orderNumber,
        originalId: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        deliveredDate: order.deliveredDate
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

module.exports = router;
