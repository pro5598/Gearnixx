const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  getUserStats,
  getAdminUserStats, // NEW: Import admin user stats
} = require("../controllers/userController");

const { authenticateToken } = require("../viable/authMiddleware");

// Validation rules
const createUserValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .isAlphanumeric()
    .withMessage("Username must be 3-30 alphanumeric characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("gender")
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Invalid gender selection"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

const updateUserValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .isAlphanumeric()
    .withMessage("Username must be 3-30 alphanumeric characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Invalid gender selection"),
];

// Admin middleware (you'll need to create this)
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Routes
// NEW: Admin stats route (place BEFORE general stats to avoid conflicts)
router.get("/admin-stats", authenticateToken, adminOnly, getAdminUserStats);
router.get("/stats", authenticateToken, adminOnly, getUserStats);
router.get("/", authenticateToken, adminOnly, getAllUsers);
router.get("/:id", authenticateToken, adminOnly, getUserById);
router.post(
  "/",
  authenticateToken,
  adminOnly,
  createUserValidation,
  createUser
);
router.put(
  "/:id",
  authenticateToken,
  adminOnly,
  updateUserValidation,
  updateUser
);
router.delete("/:id", authenticateToken, adminOnly, deleteUser);
router.patch("/:id/status", authenticateToken, adminOnly, updateUserStatus);
router.patch("/:id/role", authenticateToken, adminOnly, updateUserRole);

module.exports = router;
