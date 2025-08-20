import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Edit,
  Save,
  X,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userAPI } from "../../../services/userAPI"; // Import your user API

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://github.com/shadcn.png"
  );
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    gender: "",
  });

  // Fetch current user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching user data from backend...");

      // Fetch fresh user data from backend using the profile endpoint
      const response = await userAPI.getCurrentUser();

      if (response.success) {
        const freshUserData = response.data.user;
        console.log("✅ Fresh user data received:", freshUserData);

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(freshUserData));

        setUser(freshUserData);

        // Update form data with available fields
        setFormData({
          firstName: freshUserData.firstName || "",
          lastName: freshUserData.lastName || "",
          username: freshUserData.username || "",
          email: freshUserData.email || "",
          gender: freshUserData.gender || "",
        });

        // Load profile image if exists
        if (freshUserData.profileImage) {
          setProfileImage(freshUserData.profileImage);
        } else {
          setProfileImage("https://github.com/shadcn.png");
        }
      } else {
        throw new Error(response.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setError(error.message || "Failed to load user data");

      // Fallback to localStorage data if backend fails
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log("📦 Using localStorage fallback data");
          setUser(userData);
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            username: userData.username || "",
            email: userData.email || "",
            gender: userData.gender || "",
          });

          if (userData.profileImage) {
            setProfileImage(userData.profileImage);
          }
        }
      } catch (fallbackError) {
        console.error(
          "❌ Fallback to localStorage also failed:",
          fallbackError
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for user updates from admin panel
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log(
        "🔔 User update event received from admin, refreshing data..."
      );
      fetchUserData();
    };

    // Listen for custom events (when user is updated by admin)
    window.addEventListener("userUpdated", handleUserUpdate);

    // Listen for localStorage changes (cross-tab)
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        console.log("🔔 localStorage user data changed");
        fetchUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      console.log("💾 Saving user profile data...", formData);

      // Use the profile update endpoint instead of admin user management
      const response = await userAPI.updateProfile(formData);

      if (response.success) {
        console.log("✅ Profile updated successfully");

        // Update localStorage with the response data
        const updatedUser = {
          ...user,
          ...response.data.user,
          profileImage: profileImage, // Keep the profile image
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);

        // Refresh data to ensure we have the latest from backend
        await fetchUserData();
      } else {
        throw new Error(response.message || "Failed to save profile data");
      }
    } catch (error) {
      console.error("❌ Error saving profile data:", error);
      setError(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        gender: user.gender || "",
      });

      // Reset profile image to original
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      } else {
        setProfileImage("https://github.com/shadcn.png");
      }
    }
    setIsEditing(false);
    setError(null);
    setSuccessMessage("");
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-white">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-center h-32 flex-col">
            <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
            <span className="text-red-400 text-center">{error}</span>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="mt-4 border-red-600 text-red-400 hover:bg-red-900/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              My Profile
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Manage your personal information and account settings
            </p>
            {error && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">{successMessage}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-gray-600 text-black hover:bg-gray-700"
              disabled={loading || saving}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-600"
                  onError={(e) => {
                    e.target.src = "https://github.com/shadcn.png";
                  }}
                />
                {isEditing && (
                  <Button
                    size="sm"
                    onClick={handleCameraClick}
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700 shadow-lg border-2 border-gray-800"
                    title="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <h3 className="text-xl font-semibold text-white mb-1">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-gray-400 mb-2">@{formData.username}</p>
              <p className="text-sm text-gray-500">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>

              {/* Show user role and status */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 text-sm">Role:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user?.role === "admin"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {user?.role || "user"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 text-sm">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user?.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {user?.lastLogin && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-sm">Last Login:</span>
                    <span className="text-gray-300 text-xs">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-gray-300 text-sm font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-gray-300 text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-300 text-sm font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-gray-300 text-sm font-medium"
                >
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem
                      value="male"
                      className="text-white hover:bg-gray-700"
                    >
                      Male
                    </SelectItem>
                    <SelectItem
                      value="female"
                      className="text-white hover:bg-gray-700"
                    >
                      Female
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-white hover:bg-gray-700"
                    >
                      Other
                    </SelectItem>
                    <SelectItem
                      value="prefer-not-to-say"
                      className="text-white hover:bg-gray-700"
                    >
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info about what users can and cannot change */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium text-sm mb-2">
                  Profile Information
                </h4>
                <div className="text-blue-300 text-sm space-y-1">
                  <p>✅ You can update: Name, Username, Email, and Gender</p>
                  <p>
                    ℹ️ Role and account status are managed by administrators
                  </p>
                  <p>
                    🔒 For security reasons, password changes require email
                    verification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
