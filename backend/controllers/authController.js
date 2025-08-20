const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
require("dotenv").config();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
const register = async (req, res) => {
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

    const { firstName, lastName, username, email, password, gender } = req.body;

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
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

// Login user
const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    // Return user data (excluding password)
    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const { password, ...userData } = req.user.toJSON();

    res.status(200).json({
      success: true,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
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

    const updateData = req.body;
    const userId = req.user.id;

    // Find current user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for email/username conflicts if they're being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await User.findByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(409).json({
          success: false,
          message: "Email is already taken",
        });
      }
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await User.findByUsername(updateData.username);
      if (existingUsername && existingUsername.id !== userId) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Only allow certain fields to be updated by the user themselves
    const allowedFields = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      username: updateData.username,
      email: updateData.email,
      gender: updateData.gender,
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    // Update user
    await user.update(allowedFields);

    // Update last login to current time
    await user.update({ lastLogin: new Date() });

    // Return updated user data (excluding password)
    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

// ADD THIS NEW FUNCTION - Change Password
const changePassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log(`🔄 User ${userId} attempting to change password`);

    // Find current user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      console.log(`❌ Invalid current password for user ${userId}`);
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      console.log(`❌ New password same as current for user ${userId}`);
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Update password (the User model should hash it automatically)
    await user.update({ password: newPassword });

    console.log(`✅ Password changed successfully for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message:
        "Logout successful. Please remove token from client-side storage.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

// UPDATED MODULE EXPORTS - ADD changePassword
module.exports = {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  changePassword, // ADD THIS LINE
};
