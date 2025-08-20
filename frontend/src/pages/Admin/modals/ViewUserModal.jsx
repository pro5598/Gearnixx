import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Eye,
  Edit,
  Shield,
  Trash2,
  User,
  Mail,
  Calendar,
  ShoppingCart,
  DollarSign,
  UserCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ViewUserModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const params = useParams();

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "user":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getRoleIcon = (role) => {
    return role === "admin" ? (
      <Crown className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const handleClose = () => {
    navigate("/admin/users");
  };

  const handleEdit = () => {
    navigate(`/admin/users/${params.id}/edit`);
  };

  const handleChangeRole = () => {
    navigate(`/admin/users/${params.id}/change-role`);
  };

  const handleDelete = () => {
    navigate(`/admin/users/${params.id}/delete`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                User Details
              </h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              User ID: {user.id} | @{user.username}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEdit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white hidden sm:flex"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={handleChangeRole}
              size="sm"
              variant="outline"
              className="border-gray-600 text-black hover:bg-gray-700 hidden sm:flex"
            >
              <Shield className="h-4 w-4 mr-1" />
              Role
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* User Overview - UPDATED */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl sm:text-2xl font-bold">
                  {user.firstName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-gray-500 text-sm">@{user.username}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    className={`text-xs flex items-center gap-1 ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(user.isActive)}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information - UPDATED */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <Label className="text-gray-400 text-sm">
                          Full Name
                        </Label>
                        <p className="text-white">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UserCheck className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <Label className="text-gray-400 text-sm">
                          Username
                        </Label>
                        <p className="text-white">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <Label className="text-gray-400 text-sm">Email</Label>
                        <p className="text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <Label className="text-gray-400 text-sm">Gender</Label>
                        <p className="text-white capitalize">
                          {user.gender === "prefer-not-to-say"
                            ? "Prefer not to say"
                            : user.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <Label className="text-gray-400 text-sm">
                          Join Date
                        </Label>
                        <p className="text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information - UPDATED */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Role</Label>
                      <div className="mt-1">
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">
                        Account Status
                      </Label>
                      <div className="mt-1">
                        <Badge className={`${getStatusColor(user.isActive)}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <Label className="text-gray-400 text-sm">
                            Last Login
                          </Label>
                          <p className="text-white">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString()
                              : "Never logged in"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <Label className="text-gray-400 text-sm">
                            Account Created
                          </Label>
                          <p className="text-white">
                            {new Date(user.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats - UPDATED (simplified since backend doesn't have order data) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30 text-center">
                <p className="text-blue-400 text-2xl font-bold">
                  {user.role === "admin" ? "∞" : "0"}
                </p>
                <p className="text-gray-300 text-sm">Access Level</p>
              </div>
              <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30 text-center">
                <p className="text-green-400 text-2xl font-bold">
                  {user.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-gray-300 text-sm">Status</p>
              </div>
              <div className="bg-purple-600/20 p-4 rounded-lg border border-purple-500/30 text-center">
                <p className="text-purple-400 text-2xl font-bold">
                  {user.lastLogin ? "Recent" : "New"}
                </p>
                <p className="text-gray-300 text-sm">Activity</p>
              </div>
              <div className="bg-yellow-600/20 p-4 rounded-lg border border-yellow-500/30 text-center">
                <p className="text-yellow-400 text-2xl font-bold">
                  {Math.floor(
                    (new Date() - new Date(user.createdAt)) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
                <p className="text-gray-300 text-sm">Days Active</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-700">
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
              <Button
                onClick={handleChangeRole}
                variant="outline"
                className="border-gray-600 text-black hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-900/20 flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
