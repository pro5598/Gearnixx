// models/Order.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Reference actual table name (lowercase)
        key: 'id'
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'processing',
      validate: {
        isIn: {
          args: [['processing', 'shipped', 'delivered', 'cancelled']],
          msg: 'Status must be one of: processing, shipped, delivered, cancelled'
        }
      }
    },
    customerDetails: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    paymentDetails: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    estimatedDelivery: {
      type: DataTypes.DATE
    },
    deliveredDate: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [] // Disable automatic indexes to avoid parsing errors
  });

  return Order;
};
