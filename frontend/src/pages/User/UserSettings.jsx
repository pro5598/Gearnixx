import { useState } from "react";
import {
  Settings,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Key,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userAPI } from "../../../services/userAPI"; // Import the API

export default function UserSettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validation
    if (!passwordForm.currentPassword) {
      setMessage({ type: "error", text: "Current password is required" });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters long",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setMessage({
        type: "error",
        text: "New password must be different from current password",
      });
      return;
    }

    // Check password strength requirements
    const passwordChecks = {
      length: passwordForm.newPassword.length >= 8,
      lowercase: /[a-z]/.test(passwordForm.newPassword),
      uppercase: /[A-Z]/.test(passwordForm.newPassword),
      numbers: /\d/.test(passwordForm.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
    };

    const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
    if (passedChecks < 4) {
      setMessage({
        type: "error",
        text: "Password must meet at least 4 out of 5 requirements",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Attempting to change password...");

      const response = await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      console.log("✅ Password change response:", response);

      if (response.success) {
        // Reset form on success
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setMessage({
          type: "success",
          text: "Password updated successfully! Please use your new password for future logins.",
        });

        // Clear success message after 5 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to update password",
        });
      }
    } catch (error) {
      console.error("❌ Password change error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2) return { strength, text: "Weak", color: "text-red-400" };
    if (strength <= 3)
      return { strength, text: "Fair", color: "text-yellow-400" };
    if (strength <= 4)
      return { strength, text: "Good", color: "text-blue-400" };
    return { strength, text: "Strong", color: "text-green-400" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20 mb-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Settings className="h-10 w-10" />
              Account Settings
            </h1>
            <p className="text-gray-300 text-lg">
              Manage your account security and preferences
            </p>
          </div>
        </div>

        {/* Main Content - Centered Layout */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl space-y-8">
            {/* Password Change Section - Centered */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-white flex items-center justify-center gap-3 text-2xl">
                  <Lock className="h-6 w-6" />
                  Change Password
                </CardTitle>
                <p className="text-gray-400 text-base mt-2">
                  Update your password to keep your account secure
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Message Display */}
                  {message.text && (
                    <div
                      className={`p-4 rounded-lg border flex items-center gap-3 ${
                        message.type === "success"
                          ? "bg-green-900/20 border-green-500/30 text-green-400"
                          : "bg-red-900/20 border-red-500/30 text-red-400"
                      }`}
                    >
                      {message.type === "success" ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">
                        {message.text}
                      </span>
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-gray-300 text-base font-medium"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 pr-12 h-12 text-base"
                        placeholder="Enter your current password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-gray-300 text-base font-medium"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 pr-12 h-12 text-base"
                        placeholder="Enter your new password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium">
                            Password strength:
                          </span>
                          <span
                            className={`font-semibold ${passwordStrength.color}`}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              passwordStrength.strength <= 2
                                ? "bg-gradient-to-r from-red-500 to-red-400"
                                : passwordStrength.strength <= 3
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                : passwordStrength.strength <= 4
                                ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                : "bg-gradient-to-r from-green-500 to-green-400"
                            }`}
                            style={{
                              width: `${
                                (passwordStrength.strength / 5) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-300 text-base font-medium"
                    >
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 pr-12 h-12 text-base"
                        placeholder="Confirm your new password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/50">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Password Requirements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            passwordForm.newPassword.length >= 8
                              ? "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">
                          8+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            /[a-z]/.test(passwordForm.newPassword)
                              ? "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">
                          Lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            /[A-Z]/.test(passwordForm.newPassword)
                              ? "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">
                          Uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            /\d/.test(passwordForm.newPassword)
                              ? "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">Number</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(
                              passwordForm.newPassword
                            )
                              ? "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">
                          Special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Updating Password...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="h-5 w-5" />
                        Update Password
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Tips - Centered */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-white flex items-center justify-center gap-2 text-xl">
                  <Shield className="h-5 w-5" />
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">
                      Use a unique password that you don't use for other
                      accounts
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">
                      Consider using a password manager to generate strong
                      passwords
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">
                      Never share your password with anyone or suspicious
                      websites
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">
                      Change your password if you suspect it has been
                      compromised
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
