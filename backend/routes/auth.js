const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const authController = require("../controllers/authController.js");
const { authenticateToken } = require("../viable/authMiddleware");
const { registerValidation, loginValidation } = require("../viable/validators");

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // allow more profile updates than auth attempts
  message: {
    success: false,
    message: "Too many profile update attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ADD THIS: Rate limiting for password changes
const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 password changes per 15 minutes
  message: {
    success: false,
    message: "Too many password change attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation for profile updates
const updateProfileValidation = [
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

// ADD THIS: Validation for password change
const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
];

// Public routes
router.post(
  "/register",
  authLimiter,
  registerValidation,
  authController.register,
);
router.post("/login", authLimiter, loginValidation, authController.login);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", profileUpdateLimiter, authenticateToken, updateProfileValidation, authController.updateProfile);
router.put("/change-password", passwordChangeLimiter, authenticateToken, changePasswordValidation, authController.changePassword); // ADD THIS LINE
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;
