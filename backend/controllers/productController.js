const Product = require('../models/Product');
const { Op } = require('sequelize'); // Don't forget to import Op for queries
const fs = require('fs');
const path = require('path');

const productController = {
  // Get all products with filtering and pagination
  getAllProducts: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        status, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (category && category !== 'all') {
        where.category = category;
      }

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.status(200).json({
        success: true,
        data: {
          products: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }
  },

  // Get single product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const productData = req.body;
      
      // Handle image uploads
      if (req.files && req.files.length > 0) {
        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        productData.image = imagePaths[0]; // Primary image
        productData.images = imagePaths; // All images
      }

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      
      // Clean up uploaded files if product creation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Failed to delete file:', err);
          });
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        // Delete old images if they exist
        if (product.images && product.images.length > 0) {
          product.images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            fs.unlink(fullPath, (err) => {
              if (err) console.error('Failed to delete old image:', err);
            });
          });
        }

        const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        updateData.image = imagePaths[0];
        updateData.images = imagePaths;
      }

      await product.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Delete associated images
      if (product.images && product.images.length > 0) {
        product.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          fs.unlink(fullPath, (err) => {
            if (err) console.error('Failed to delete image:', err);
          });
        });
      }

      await product.destroy();

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  },

  // Update product status
  updateProductStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await product.update({ status });

      res.status(200).json({
        success: true,
        message: 'Product status updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update product status',
        error: error.message
      });
    }
  },

  // Update product stock
  updateProductStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await product.update({ stock: parseInt(stock) });

      res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to update product stock',
        error: error.message
      });
    }
  }
};

module.exports = productController;
