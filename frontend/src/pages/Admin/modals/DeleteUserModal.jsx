import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, X, AlertTriangle, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DeleteUserModal({ isOpen, onClose, onConfirm, user }) {
  const navigate = useNavigate();
  const params = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // Navigation is handled by the parent component
    } catch (error) {
      console.error("Error deleting user:", error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    navigate("/admin/users");
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
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-lg border border-gray-700 shadow-2xl mx-2 sm:mx-0 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Delete User
              </h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              User ID: {user.id} | @{user.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
            disabled={isDeleting}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-400 font-semibold text-lg mb-2">
                    ⚠️ Permanent Action Warning
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    You are about to permanently delete this user account. This
                    action cannot be undone.
                  </p>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>
                      <strong>What will be deleted:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>User account and profile information</li>
                      <li>Login credentials and access permissions</li>
                      <li>Associated user data and preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">
                User to be deleted:
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {user.firstName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <p className="text-gray-500 text-xs">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                    <Badge
                      className={`text-xs ${getStatusColor(user.isActive)}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Warnings for Admin Users */}
            {user.role === "admin" && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-400 font-medium text-sm">
                      Admin Account Warning
                    </h4>
                    <p className="text-gray-300 text-sm mt-1">
                      You are about to delete an administrator account. Make
                      sure there are other admin accounts available to manage
                      the system.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="bg-gray-700/20 p-4 rounded-lg">
              <h4 className="text-gray-300 font-medium mb-3 text-sm">
                Account Details:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white ml-2">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2">
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white ml-2 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-3">
                To confirm deletion, please understand that this action is
                irreversible.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">
                  This will permanently delete the user account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-600 text-black hover:bg-gray-700 flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User Permanently
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
