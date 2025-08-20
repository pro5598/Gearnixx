// models/index.js - Fixed version with corrected table check
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5, 
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      indexes: false // Disable automatic index creation
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

testConnection();

// Import models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Review = require('./Review')(sequelize);

// Set up associations
try {
  // User associations
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  
  // Product associations
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
  
  // Order associations
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
  Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
  
  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  OrderItem.hasOne(Review, { foreignKey: 'orderItemId', as: 'review' });
  
  // Review associations
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  Review.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
  
  console.log('✅ Model associations established successfully.');
} catch (error) {
  console.error('❌ Error setting up associations:', error);
}

// FIXED: Enable sync to create the reviews table
if (process.env.NODE_ENV === 'development') {
  console.log('⚠️  Auto-sync disabled to avoid index parsing errors.');
  console.log('💡 Tables should already exist from previous syncs.');
  
  const syncDatabase = async () => {
    try {
      // FIXED: Corrected way to check if reviews table exists
      const results = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews'",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('🔍 Table check results:', results);
      
      if (results.length === 0) {
        console.log('📝 Reviews table not found, creating it...');
        
        // Create the reviews table directly with SQL
        await sequelize.query(`
          CREATE TABLE reviews (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES "Products"(id) ON DELETE CASCADE,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title VARCHAR(255),
            comment TEXT,
            recommend BOOLEAN,
            is_verified_purchase BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, product_id, order_id, order_item_id)
          );
        `);
        
        console.log('✅ Reviews table created successfully');
      } else {
        console.log('✅ Reviews table already exists');
      }
    } catch (error) {
      console.error('❌ Error checking/creating reviews table:', error);
      
      // Fallback: Try using Sequelize sync
      try {
        console.log('🔄 Trying fallback sync method...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized with fallback method');
      } catch (syncError) {
        console.error('❌ Fallback sync also failed:', syncError);
      }
    }
  };
  
  // Run sync after models are loaded
  setTimeout(syncDatabase, 1000);
}

module.exports = {
  sequelize,
  Sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review
};
