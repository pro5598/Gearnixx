// controllers/orderController.js
const { Order, OrderItem, Product, User, sequelize } = require('../models');
const { Op } = require("sequelize");

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cartItems, customerDetails, paymentDetails, totals } = req.body;
    const userId = req.user?.id;
    
    // Validate user authentication
    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Validate required data
    if (!cartItems || cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    if (!customerDetails || !paymentDetails || !totals) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required order information'
      });
    }

    console.log('Creating order for user:', userId);
    console.log('Cart items:', cartItems);
    console.log('Totals:', totals);
    
    // Validate stock availability
    for (const item of cartItems) {
      const product = await Product.findByPk(item.id, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }
    
    // FIXED: Generate order number BEFORE creating the order
    const tempOrderNumber = `ORD-${new Date().getFullYear()}-${Date.now()}-${userId}`;
    
    console.log('Generated order number:', tempOrderNumber);
    
    // Create the main order WITH orderNumber
    const order = await Order.create({
      orderNumber: tempOrderNumber, // FIXED: Include orderNumber in initial creation
      userId,
      total: totals.total,
      subtotal: totals.subtotal,
      shipping: totals.shipping || 0,
      tax: totals.tax || 0,
      customerDetails,
      paymentDetails,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }, { transaction });
    
    console.log('Order created with ID:', order.id);
    
    // Generate final order number with actual ID
    const finalOrderNumber = `ORD-${new Date().getFullYear()}-${String(order.id).padStart(3, '0')}`;
    await order.update({ orderNumber: finalOrderNumber }, { transaction });
    
    console.log('Updated order number to:', finalOrderNumber);
    
    // Create order items and update product stock
    for (const item of cartItems) {
      console.log('Creating order item for:', item.name);
      
      await OrderItem.create({
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        productName: item.name,
        productImage: item.image
      }, { transaction });
      
      // Update product stock
      await Product.update(
        { 
          stock: sequelize.literal(`stock - ${item.quantity}`),
          sold: sequelize.literal(`sold + ${item.quantity}`)
        },
        { 
          where: { id: item.id },
          transaction 
        }
      );
    }
    
    await transaction.commit();
    
    console.log('✅ Order created successfully:', finalOrderNumber);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: finalOrderNumber,
        createdAt: order.createdAt,
        total: order.total
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('Fetching orders for user:', userId);
    
    const orders = await Order.findAll({
      where: { userId },
      include: [{
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'productId', 'quantity', 'price', 'productName', 'productImage']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    res.status(200).json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// ========== NEW ADMIN FUNCTIONS - ADD THESE ==========

// Get all orders for admin dashboard
const getAllOrdersForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100, // Get more orders for admin
      status,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    console.log('🔍 Admin fetching all orders with params:', {
      page, limit, status, userId, startDate, endDate
    });

    // Build where clause
    const whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with related data
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user', // Make sure this matches your association
          attributes: ['id', 'firstName', 'lastName', 'username', 'email'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items', // Make sure this matches your association
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    console.log(`📊 Found ${count} total orders, returning ${orders.length} for page ${page}`);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// Get order statistics for admin dashboard
const getOrderStats = async (req, res) => {
  try {
    console.log('📊 Calculating order statistics...');

    // Total orders
    const totalOrders = await Order.count();
    console.log(`Total orders: ${totalOrders}`);
    
    // Total revenue (sum of all order totals)
    const totalRevenueResult = await Order.sum('total');
    const totalRevenue = totalRevenueResult || 0;
    console.log(`Total revenue: $${totalRevenue}`);

    // Orders by status
    const processingOrders = await Order.count({ where: { status: 'processing' } });
    const shippedOrders = await Order.count({ where: { status: 'shipped' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    console.log('Order status counts:', {
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    });

    // This month's data
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const thisMonthOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    const thisMonthRevenueResult = await Order.sum('total', {
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });
    const thisMonthRevenue = thisMonthRevenueResult || 0;

    console.log(`This month: ${thisMonthOrders} orders, $${thisMonthRevenue} revenue`);

    // This week's data
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        }
      }
    });

    const thisWeekRevenueResult = await Order.sum('total', {
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        }
      }
    });
    const thisWeekRevenue = thisWeekRevenueResult || 0;

    // Today's data
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfDay
        }
      }
    });

    const todayRevenueResult = await Order.sum('total', {
      where: {
        createdAt: {
          [Op.gte]: startOfDay
        }
      }
    });
    const todayRevenue = todayRevenueResult || 0;

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statsData = {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      ordersByStatus: {
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      thisMonth: {
        orders: thisMonthOrders,
        revenue: parseFloat(thisMonthRevenue)
      },
      thisWeek: {
        orders: thisWeekOrders,
        revenue: parseFloat(thisWeekRevenue)
      },
      today: {
        orders: todayOrders,
        revenue: parseFloat(todayRevenue)
      }
    };

    console.log('📊 Final stats:', statsData);

    res.status(200).json({
      success: true,
      data: statsData,
    });
  } catch (error) {
    console.error("❌ Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message
    });
  }
};

// Get recent orders for dashboard
const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    console.log(`🔍 Fetching ${limit} recent orders...`);

    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    console.log(`📋 Found ${orders.length} recent orders`);

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("❌ Get recent orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent orders",
      error: error.message
    });
  }
};

// Get single order by ID (for admin)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image', 'price']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status and delivery date if delivered
    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredDate = new Date();
    }

    await order.update(updateData);

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order }
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,  
      message: "Error updating order status",
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  // Add the new admin functions
  getAllOrdersForAdmin,
  getOrderStats,
  getRecentOrders,
  getOrderById,
  updateOrderStatus
};
