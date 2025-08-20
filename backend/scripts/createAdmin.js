require('dotenv').config();

const { sequelize } = require('../viable/db');
const User = require('../models/User');

(async () => {
  try {
    await sequelize.sync();
    
    // Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin123@gmail.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123";
    console.log(ADMIN_EMAIL,ADMIN_PASSWORD)
    
    // Check if admin already exists
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log("Admin already exists:", ADMIN_EMAIL);
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      gender: "other",
      role: "admin",
      isActive: true
    });
    
    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
})();
