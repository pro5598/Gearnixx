const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
let sequelize, User;

describe('User Model', () => {
  beforeAll(async () => {
    // Set up in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', { logging: false });

    // Define User model (simplified for testing)
    User = sequelize.define('User', {
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
    });

    // Add password hashing hook
    User.beforeCreate(async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    });

    // Add comparePassword method
    User.prototype.comparePassword = async function (candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    // Sync the model
    await sequelize.sync();
  });

  afterAll(async () => {
    // Close the database connection
    await sequelize.close();
  });

  test('Password should be hashed when user is created', async () => {
    const plainPassword = 'password123';
    
    // Create user
    const user = await User.create({ 
      email: 'test@example.com', 
      password: plainPassword 
    });
    
    // Check that password is hashed (not equal to plain text)
    expect(user.password).not.toBe(plainPassword);
    
    // Check that comparison works
    const isMatch = await user.comparePassword(plainPassword);
    expect(isMatch).toBe(true);
  });

  test('Password comparison returns false for wrong password', async () => {
    const plainPassword = 'mypassword';
    
    // Create user
    const user = await User.create({ 
      email: 'test2@example.com', 
      password: plainPassword 
    });
    
    // Check wrong password
    const isMatch = await user.comparePassword('wrongpassword');
    expect(isMatch).toBe(false);
  });
});