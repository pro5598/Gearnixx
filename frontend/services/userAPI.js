import api from "./api";

export const userAPI = {
  // ===== USER PROFILE ENDPOINTS (for logged-in users) =====

  // Get current logged-in user data
  getCurrentUser: () => {
    return api.get("/auth/profile");
  },

  // Update current user profile (self-service)
  updateProfile: (userData) => {
    if (!userData) {
      return Promise.reject({
        success: false,
        message: "User data is required",
      });
    }
    return api.put("/auth/profile", userData);
  },

  // Change password (NEW)
  changePassword: (passwordData) => {
    if (!passwordData) {
      return Promise.reject({
        success: false,
        message: "Password data is required",
      });
    }
    if (!passwordData.currentPassword) {
      return Promise.reject({
        success: false,
        message: "Current password is required",
      });
    }
    if (!passwordData.newPassword) {
      return Promise.reject({
        success: false,
        message: "New password is required",
      });
    }
    return api.put("/auth/change-password", passwordData);
  },

  // Request password reset
  requestPasswordReset: (email) => {
    if (!email) {
      return Promise.reject({ success: false, message: "Email is required" });
    }
    return api.post("/auth/request-password-reset", { email });
  },

  // Reset password with token
  resetPassword: (token, newPassword) => {
    if (!token) {
      return Promise.reject({
        success: false,
        message: "Reset token is required",
      });
    }
    if (!newPassword) {
      return Promise.reject({
        success: false,
        message: "New password is required",
      });
    }
    return api.post("/auth/reset-password", { token, newPassword });
  },

  // Upload profile image
  uploadProfileImage: (imageFile) => {
    if (!imageFile) {
      return Promise.reject({
        success: false,
        message: "Image file is required",
      });
    }

    const formData = new FormData();
    formData.append("profileImage", imageFile);

    return api.post("/auth/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // ===== ADMIN USER MANAGEMENT ENDPOINTS =====

  // Get admin user statistics (for admin dashboard)
  getAdminUserStats: () => {
    return api.get("/users/admin-stats");
  },

  // Get user statistics (for user management page)
  getUserStats: () => {
    return api.get("/users/stats");
  },

  // Get all users with pagination and filtering (ADMIN ONLY)
  getAllUsers: (params = {}) => {
    return api.get("/users", { params });
  },

  // Get single user by ID (ADMIN ONLY)
  getUser: (id) => {
    if (!id) {
      return Promise.reject({ success: false, message: "User ID is required" });
    }
    return api.get(`/users/${id}`);
  },

  // Create new user (ADMIN ONLY)
  createUser: (userData) => {
    if (!userData) {
      return Promise.reject({
        success: false,
        message: "User data is required",
      });
    }
    return api.post("/users", userData);
  },

  // Update user (ADMIN ONLY)
  updateUser: (id, userData) => {
    if (!id) {
      return Promise.reject({ success: false, message: "User ID is required" });
    }
    if (!userData) {
      return Promise.reject({
        success: false,
        message: "User data is required",
      });
    }
    return api.put(`/users/${id}`, userData);
  },

  // Delete user (ADMIN ONLY)
  deleteUser: (id) => {
    if (!id) {
      return Promise.reject({ success: false, message: "User ID is required" });
    }
    return api.delete(`/users/${id}`);
  },

  // Update user status - activate/deactivate (ADMIN ONLY)
  updateUserStatus: (id, isActive) => {
    if (!id) {
      return Promise.reject({ success: false, message: "User ID is required" });
    }
    if (typeof isActive !== "boolean") {
      return Promise.reject({
        success: false,
        message: "Status must be boolean",
      });
    }
    return api.patch(`/users/${id}/status`, { isActive });
  },

  // Update user role (ADMIN ONLY)
  updateUserRole: (id, role) => {
    if (!id) {
      return Promise.reject({ success: false, message: "User ID is required" });
    }
    if (!role) {
      return Promise.reject({ success: false, message: "Role is required" });
    }
    if (!["user", "admin"].includes(role)) {
      return Promise.reject({
        success: false,
        message: "Invalid role. Must be user or admin",
      });
    }
    return api.patch(`/users/${id}/role`, { role });
  },

  // ===== BULK OPERATIONS (ADMIN ONLY) =====

  // Bulk update user status
  bulkUpdateStatus: (userIds, isActive) => {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return Promise.reject({
        success: false,
        message: "User IDs array is required",
      });
    }
    if (typeof isActive !== "boolean") {
      return Promise.reject({
        success: false,
        message: "Status must be boolean",
      });
    }
    return api.patch("/users/bulk/status", { userIds, isActive });
  },

  // Bulk delete users
  bulkDeleteUsers: (userIds) => {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return Promise.reject({
        success: false,
        message: "User IDs array is required",
      });
    }
    return api.delete("/users/bulk", { data: { userIds } });
  },

  // ===== SEARCH AND FILTERING =====

  // Search users by name, email, or username
  searchUsers: (searchTerm, params = {}) => {
    if (!searchTerm) {
      return Promise.reject({
        success: false,
        message: "Search term is required",
      });
    }
    return api.get("/users", {
      params: {
        search: searchTerm,
        ...params,
      },
    });
  },

  // Get users by role
  getUsersByRole: (role, params = {}) => {
    if (!role) {
      return Promise.reject({ success: false, message: "Role is required" });
    }
    return api.get("/users", {
      params: {
        role,
        ...params,
      },
    });
  },

  // Get users by status
  getUsersByStatus: (status, params = {}) => {
    if (!status) {
      return Promise.reject({ success: false, message: "Status is required" });
    }
    return api.get("/users", {
      params: {
        status,
        ...params,
      },
    });
  },

  // ===== ADVANCED ANALYTICS (ADMIN ONLY) =====

  // Get user growth analytics
  getUserGrowthAnalytics: (period = "month") => {
    return api.get("/users/analytics/growth", { params: { period } });
  },

  // Get user activity analytics
  getUserActivityAnalytics: () => {
    return api.get("/users/analytics/activity");
  },

  // Export users data
  exportUsers: (format = "csv", params = {}) => {
    return api.get("/users/export", {
      params: { format, ...params },
      responseType: "blob",
    });
  },

  // ===== UTILITY FUNCTIONS =====

  // Validate password strength
  validatePasswordStrength: (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const strength = Object.values(checks).filter(Boolean).length;

    return {
      checks,
      strength,
      isValid: strength >= 4, // At least 4 out of 5 requirements
      score: strength / 5,
      text:
        strength <= 2
          ? "Weak"
          : strength <= 3
          ? "Fair"
          : strength <= 4
          ? "Good"
          : "Strong",
    };
  },

  // Check if username is available
  checkUsernameAvailability: (username) => {
    if (!username) {
      return Promise.reject({
        success: false,
        message: "Username is required",
      });
    }
    return api.get("/auth/check-username", { params: { username } });
  },

  // Check if email is available
  checkEmailAvailability: (email) => {
    if (!email) {
      return Promise.reject({ success: false, message: "Email is required" });
    }
    return api.get("/auth/check-email", { params: { email } });
  },
};

// Export individual methods for easier importing
export const {
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  uploadProfileImage,
  getAdminUserStats,
  getUserStats,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  searchUsers,
  getUsersByRole,
  getUsersByStatus,
  validatePasswordStrength,
} = userAPI;

export default userAPI;
