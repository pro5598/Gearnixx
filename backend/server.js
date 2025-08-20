// server.js
const app = require('./app');
const { testConnection, sequelize } = require('./viable/db');
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models with alter: true to update existing tables
    await sequelize.sync({ 
      force: false,     // Don't drop existing tables
      alter: true,      // Update existing tables to match models (fixes field length issues)
      logging: console.log // Show SQL commands being executed
    });
    console.log('✅ Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`📁 Uploads directory: ${__dirname}/uploads`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
