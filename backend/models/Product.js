// models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../viable/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name is required'
      },
      len: {
        args: [1, 200],
        msg: 'Product name must be between 1 and 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product description is required'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative'
      }
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['mice', 'keyboards', 'headsets', 'controllers']],
        msg: 'Category must be one of: mice, keyboards, headsets, controllers'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Stock cannot be negative'
      }
    }
  },
  sold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Sold quantity cannot be negative'
      }
    }
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Rating cannot be less than 0'
      },
      max: {
        args: [5],
        msg: 'Rating cannot be more than 5'
      }
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'out_of_stock', 'low_stock']],
        msg: 'Status must be one of: active, inactive, out_of_stock, low_stock'
      }
    }
  },
  features: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    defaultValue: 'Gearnix'
  },
  weight: {
    type: DataTypes.STRING(50),
    defaultValue: 'N/A'
  },
  connectivity: {
    type: DataTypes.STRING(200),
    defaultValue: 'N/A'
  },
  image: {
    type: DataTypes.TEXT,
    defaultValue: '/api/placeholder/80/80'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (product) => {
      if (product.stock === 0) {
        product.status = 'out_of_stock';
      } else if (product.stock <= 10) {
        product.status = 'low_stock';
      } else {
        product.status = 'active';
      }
    },
    beforeUpdate: (product) => {
      if (product.stock === 0) {
        product.status = 'out_of_stock';
      } else if (product.stock <= 10) {
        product.status = 'low_stock';
      } else if (product.status === 'out_of_stock' || product.status === 'low_stock') {
        product.status = 'active';
      }
    }
  }
});

module.exports = Product;
