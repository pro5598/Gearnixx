// routes/reviews.js - Complete review routes with admin functionality
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../viable/authMiddleware');
const { Review, Product, User, Order, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// Middleware to check admin role
const checkAdminRole = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// POST /api/reviews - Submit a new review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, orderId, orderItemId, rating, title, comment, recommend } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Submitting review:', { 
      userId, productId, orderId, orderItemId, rating, title 
    });
    
    // Validate required fields
    if (!productId || !orderId || !orderItemId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Order ID, Order Item ID, and rating are required'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if order belongs to user and is delivered
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: userId,
        status: 'delivered'
      },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { id: orderItemId, productId: productId }
      }]
    });
    
    if (!order) {
      console.log('❌ Order not found or not eligible for review');
      return res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for review. Only delivered orders can be reviewed.'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        userId,
        productId,
        orderId,
        orderItemId
      }
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product for this order'
      });
    }
    
    // Create review
    const review = await Review.create({
      userId,
      productId,
      orderId,
      orderItemId,
      rating,
      title: title || null,
      comment: comment || null,
      recommend: recommend !== null ? recommend : null,
      isVerifiedPurchase: true
    });
    
    // Update product average rating
    await updateProductRating(productId);
    
    console.log('✅ Review created successfully:', review.id);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend,
        createdAt: review.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, recommend } = req.body;
    const userId = req.user.id;
    
    console.log('📝 Updating review:', id, { rating, title });
    
    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Find review by ID and user
    const review = await Review.findOne({
      where: { id, userId }
    });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to update it'
      });
    }
    
    const oldRating = review.rating;
    
    // Update review
    await review.update({
      rating: rating || review.rating,
      title: title !== undefined ? title : review.title,
      comment: comment !== undefined ? comment : review.comment,
      recommend: recommend !== undefined ? recommend : review.recommend
    });
    
    // Update product average rating if rating changed
    if (rating && rating !== oldRating) {
      await updateProductRating(review.productId);
    }
    
    console.log('✅ Review updated successfully');
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend,
        updatedAt: review.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ Deleting review:', id);
    
    // Find review by ID and user
    const review = await Review.findOne({
      where: { id, userId }
    });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }
    
    const productId = review.productId;
    
    // Delete review
    await review.destroy();
    
    // Update product average rating
    await updateProductRating(productId);
    
    console.log('✅ Review deleted successfully');
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// GET /api/reviews/user - Get user's reviews
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Fetching reviews for user:', userId);
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    console.log('✅ Found', reviews.length, 'reviews for user');
    
    // Process image URLs properly
    const processedReviews = reviews.map(review => {
      let imageUrl = review.product.image;
      
      if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
        imageUrl = '/api/placeholder/80/80';
      } else if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      
      return {
        id: review.id,
        productId: review.productId,
        productName: review.product.name,
        productImage: imageUrl,
        orderId: review.orderId,
        orderNumber: review.order.orderNumber,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    });
    
    res.json({
      success: true,
      reviews: processedReviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Fetching reviews for product:', productId);
    
    // Determine sort order
    let orderClause;
    switch (sortBy) {
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      case 'rating-high':
        orderClause = [['rating', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating-low':
        orderClause = [['rating', 'ASC'], ['createdAt', 'DESC']];
        break;
      default: // newest
        orderClause = [['createdAt', 'DESC']];
    }
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset
    });
    
    console.log('✅ Found', reviews.length, 'reviews for product');
    
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend,
        isVerifiedPurchase: review.isVerifiedPurchase,
        userName: `${review.user.firstName} ${review.user.lastName}`,
        createdAt: review.createdAt
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// GET /api/reviews/product/:productId/stats - Get review statistics for a product
router.get('/product/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('📊 Fetching review stats for product:', productId);
    
    const stats = await Review.findOne({
      where: { productId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 4 THEN 1 END')), 'fourStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 3 THEN 1 END')), 'threeStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 2 THEN 1 END')), 'twoStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 1 THEN 1 END')), 'oneStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN recommend = true THEN 1 END')), 'recommendations']
      ]
    });
    
    const totalReviews = parseInt(stats.getDataValue('totalReviews')) || 0;
    const averageRating = totalReviews > 0 ? parseFloat(stats.getDataValue('averageRating')).toFixed(1) : 0;
    
    res.json({
      success: true,
      stats: {
        totalReviews,
        averageRating: parseFloat(averageRating),
        ratingDistribution: {
          5: parseInt(stats.getDataValue('fiveStars')) || 0,
          4: parseInt(stats.getDataValue('fourStars')) || 0,
          3: parseInt(stats.getDataValue('threeStars')) || 0,
          2: parseInt(stats.getDataValue('twoStars')) || 0,
          1: parseInt(stats.getDataValue('oneStars')) || 0
        },
        recommendations: parseInt(stats.getDataValue('recommendations')) || 0,
        recommendationPercentage: totalReviews > 0 
          ? Math.round((parseInt(stats.getDataValue('recommendations')) / totalReviews) * 100) 
          : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics',
      error: error.message
    });
  }
});

// POST /api/reviews/check-eligibility - Check if user can review a product
router.post('/check-eligibility', authenticateToken, async (req, res) => {
  try {
    const { productId, orderId } = req.body;
    const userId = req.user.id;
    
    console.log('🔍 Checking review eligibility:', { userId, productId, orderId });
    
    if (!productId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Order ID are required'
      });
    }
    
    // Check if order is delivered and belongs to user
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        userId: userId,
        status: 'delivered'
      },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { productId: productId }
      }]
    });
    
    if (!order) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'Order not found, not delivered, or does not contain this product'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        userId,
        productId,
        orderId
      }
    });
    
    if (existingReview) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'You have already reviewed this product for this order',
        existingReview: {
          id: existingReview.id,
          rating: existingReview.rating,
          title: existingReview.title
        }
      });
    }
    
    res.json({
      success: true,
      eligible: true,
      message: 'You can review this product'
    });
    
  } catch (error) {
    console.error('❌ Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message
    });
  }
});

// ADMIN ROUTES

// GET /api/reviews/admin/all - Get all reviews (admin only)
router.get('/admin/all', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Admin fetching all reviews');
    
    // Determine sort order
    let orderClause;
    switch (sortBy) {
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      case 'rating-high':
        orderClause = [['rating', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating-low':
        orderClause = [['rating', 'ASC'], ['createdAt', 'DESC']];
        break;
      default: // newest
        orderClause = [['createdAt', 'DESC']];
    }
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset
    });
    
    console.log('✅ Admin found', reviews.length, 'total reviews');
    
    // Process image URLs properly
    const processedReviews = reviews.map(review => {
      let imageUrl = review.product.image;
      
      if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
        imageUrl = '/api/placeholder/80/80';
      } else if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      
      return {
        id: review.id,
        productId: review.productId,
        productName: review.product.name,
        productImage: imageUrl,
        userId: review.userId,
        userFirstName: review.user.firstName,
        userLastName: review.user.lastName,
        userName: `${review.user.firstName} ${review.user.lastName}`,
        userEmail: review.user.email,
        orderId: review.orderId,
        orderNumber: review.order.orderNumber,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    });
    
    res.json({
      success: true,
      reviews: processedReviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching all reviews (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// DELETE /api/reviews/admin/:id - Delete any review (admin only)
router.delete('/admin/:id', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Admin deleting review:', id);
    
    // Find review by ID
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    const productId = review.productId;
    
    // Delete review
    await review.destroy();
    
    // Update product average rating
    await updateProductRating(productId);
    
    console.log('✅ Admin deleted review successfully');
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting review (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// GET /api/reviews/admin/analytics - Get review analytics (admin only)
router.get('/admin/analytics', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    console.log('📊 Admin fetching review analytics');
    
    // Overall review statistics
    const overallStats = await Review.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 5 THEN 1 END')), 'fiveStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 4 THEN 1 END')), 'fourStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 3 THEN 1 END')), 'threeStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 2 THEN 1 END')), 'twoStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN rating = 1 THEN 1 END')), 'oneStars'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN recommend = true THEN 1 END')), 'recommendations']
      ]
    });
    
    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviews = await Review.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    
    // Top rated products
    const topRatedProducts = await Review.findAll({
      attributes: [
        'productId',
        [sequelize.fn('AVG', sequelize.col('Review.rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('Review.id')), 'reviewCount']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name']
      }],
      group: ['productId', 'product.id', 'product.name'],
      having: sequelize.literal('COUNT("Review"."id") >= 5'), // At least 5 reviews
      order: [[sequelize.fn('AVG', sequelize.col('Review.rating')), 'DESC']],
      limit: 10
    });
    
    const totalReviews = parseInt(overallStats.getDataValue('totalReviews')) || 0;
    const averageRating = totalReviews > 0 ? parseFloat(overallStats.getDataValue('averageRating')).toFixed(1) : 0;
    
    res.json({
      success: true,
      analytics: {
        overview: {
          totalReviews,
          averageRating: parseFloat(averageRating),
          recentReviews: recentReviews,
          ratingDistribution: {
            5: parseInt(overallStats.getDataValue('fiveStars')) || 0,
            4: parseInt(overallStats.getDataValue('fourStars')) || 0,
            3: parseInt(overallStats.getDataValue('threeStars')) || 0,
            2: parseInt(overallStats.getDataValue('twoStars')) || 0,
            1: parseInt(overallStats.getDataValue('oneStars')) || 0
          },
          recommendations: parseInt(overallStats.getDataValue('recommendations')) || 0,
          recommendationPercentage: totalReviews > 0 
            ? Math.round((parseInt(overallStats.getDataValue('recommendations')) / totalReviews) * 100) 
            : 0
        },
        topRatedProducts: topRatedProducts.map(product => ({
          productId: product.productId,
          productName: product.product.name,
          averageRating: parseFloat(product.getDataValue('averageRating')).toFixed(1),
          reviewCount: parseInt(product.getDataValue('reviewCount'))
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching review analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review analytics',
      error: error.message
    });
  }
});

// Helper function to update product average rating
async function updateProductRating(productId) {
  try {
    const result = await Review.findOne({
      where: { productId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
      ]
    });
    
    const averageRating = parseFloat(result.getDataValue('averageRating')) || 0;
    const reviewCount = parseInt(result.getDataValue('reviewCount')) || 0;
    
    await Product.update(
      { 
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: reviewCount
      },
      { where: { id: productId } }
    );
    
    console.log(`✅ Updated product ${productId} rating: ${averageRating} (${reviewCount} reviews)`);
  } catch (error) {
    console.error('❌ Error updating product rating:', error);
  }
}

module.exports = router;
