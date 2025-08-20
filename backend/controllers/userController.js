const { validationResult } = require("express-validator");
const User = require("../models/User");
const { Op } = require("sequelize");

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role && role !== "all") {
      whereClause.role = role;
    }

    if (status && status !== "all") {
      whereClause.isActive = status === "active";
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, username, email, password, gender, role } =
      req.body;

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      gender,
      role: role || "user",
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for email/username conflicts if they're being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await User.findByEmail(updateData.email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already taken",
        });
      }
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await User.findByUsername(updateData.username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Update user
    await user.update(updateData);

    // Return updated user data (excluding password)
    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ isActive });

    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ role });

    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    });
  }
};

// Get user statistics (for user management page)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });
    const adminUsers = await User.count({ where: { role: "admin" } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
    });
  }
};

// Get admin user statistics (for admin dashboard)
const getAdminUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });
    const adminUsers = await User.count({ where: { role: "admin" } });
    const regularUsers = await User.count({ where: { role: "user" } });

    // Get users registered this month
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Get users registered today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
        },
      },
    });

    // Get users registered this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const newUsersThisWeek = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        regularUsers,
        newUsersThisMonth,
        newUsersToday,
        newUsersThisWeek,
      },
    });
  } catch (error) {
    console.error("Get admin user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getUserStats,
  getAdminUserStats,
};
