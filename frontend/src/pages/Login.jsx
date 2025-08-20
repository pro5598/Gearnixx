// pages/Login.jsx - Fixed to work with AuthContext
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Add this import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, LogIn, CheckCircle, Gamepad2 } from "lucide-react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use the AuthContext login function

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || null;

  // Check if there's a success message from registration
  const successMessage = location.state?.message;

  // Form state - only email and password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Form validation
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      console.log('🔄 Attempting login for:', formData.email);
      
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
      );

      console.log("✅ Login successful:", response.data);

      // Handle different response structures from your backend
      let token, user;
      
      if (response.data.data) {
        // If response has nested data object
        token = response.data.data.token;
        user = response.data.data.user;
      } else {
        // If response has direct token and user (more common)
        token = response.data.token;
        user = response.data.user;
      }

      if (token && user) {
        // ✅ CRITICAL: Use AuthContext login function instead of direct localStorage
        login(user, token);
        
        console.log('🔄 User authenticated via AuthContext, redirecting...');

        // Redirect based on original destination or user role
        if (from) {
          console.log(`🔄 Redirecting to original destination: ${from}`);
          navigate(from, { replace: true });
        } else if (user.role === "admin") {
          console.log('🔄 Redirecting admin to dashboard');
          navigate("/admin/dashboard", {
            state: { message: "Welcome admin!" },
            replace: true
          });
        } else {
          console.log('🔄 Redirecting user to dashboard');
          navigate("/user/dashboard", {
            state: { message: "Welcome user!" },
            replace: true
          });
        }
      } else {
        throw new Error('Invalid response format: missing token or user data');
      }

    } catch (error) {
      console.error("❌ Login error:", error);

      // Handle different error scenarios
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (error.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.message?.includes('Network Error')) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Branding/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative z-10 text-center text-white px-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Gamepad2 className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4">GEARNIX</h1>
          <div className="w-16 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
          
          <h2 className="text-2xl font-semibold mb-4">Level Up Your Gaming</h2>
          <p className="text-lg text-white/90 max-w-md mx-auto leading-relaxed mb-8">
            Premium gaming accessories designed for champions. Join thousands of gamers who trust Gearnix for their setup.
          </p>
          
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-white/80">Gamers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-white/80">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">GEARNIX</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-2"></div>
          </div>

          <Card className="w-full shadow-2xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to your gaming account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success message from registration */}
              {successMessage && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                             focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                               focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-12"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-slate-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700 text-white font-semibold 
                           shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center text-sm pt-4">
                  <span className="text-slate-400">Don't have an account yet? </span>
                  <Link
                    to="/auth/register"
                    className="text-purple-400 hover:text-purple-300 font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
