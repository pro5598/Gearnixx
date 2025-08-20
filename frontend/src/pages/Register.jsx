import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2, UserPlus, Gamepad2 } from "lucide-react";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  // Form state - 6 fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Handle select change (for gender)
  const handleGenderChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    // Username validation
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (formData.username.trim().length > 30) {
      setError("Username must be no more than 30 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(formData.username.trim())) {
      setError("Username can only contain letters and numbers");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      setError("Please enter a valid email");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    // Check for lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    // Check for number
    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Gender validation
    if (!formData.gender) {
      setError("Please select your gender");
      return false;
    }
    if (!["male", "female", "other", "prefer-not-to-say"].includes(formData.gender)) {
      setError("Please select a valid gender option");
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
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
        },
      );

      console.log("Registration successful:", response.data);

      // Redirect to login page on success
      navigate("/auth/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
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
          
          <h2 className="text-2xl font-semibold mb-4">Join the Elite</h2>
          <p className="text-lg text-white/90 max-w-md mx-auto leading-relaxed mb-8">
            Create your account and unlock access to premium gaming gear. Join our community of champions and elevate your gaming experience.
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

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
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
                Join the Elite
              </CardTitle>
              <CardDescription className="text-slate-400">
                Create your gaming account and unlock premium gear
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-200 font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                               focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-200 font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                               focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-200 font-medium">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose your gamer tag"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                             focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>

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
                  />
                </div>

                {/* Gender Field */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-200 font-medium">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={handleGenderChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11 bg-slate-700/50 border-slate-600 text-white 
                                             focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="male" className="text-white hover:bg-slate-700">Male</SelectItem>
                      <SelectItem value="female" className="text-white hover:bg-slate-700">Female</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-slate-700">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say" className="text-white hover:bg-slate-700">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Password Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                                 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-12"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-11 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 
                                 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-slate-400 hover:text-white"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Gearnix
                    </>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm pt-4">
                  <span className="text-slate-400">Already have an account? </span>
                  <Link
                    to="/auth/login"
                    className="text-purple-400 hover:text-purple-300 font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Sign in here
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
