// models/OrderItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders', // Reference actual table name (lowercase)
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products', // Reference actual table name (capital P based on your existing table)
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productImage: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
    indexes: [] // Disable automatic indexes to avoid parsing errors
  });

  return OrderItem;
};
