import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, X, User, Crown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ChangeRoleModal({ isOpen, onClose, onConfirm, user }) {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedRole, setSelectedRole] = useState(user?.role || "user");
  const [isChanging, setIsChanging] = useState(false);

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

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-5 w-5" />;
      case "user":
        return <User className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case "admin":
        return "Full system access with all permissions including user management";
      case "user":
        return "Standard user access with shopping and profile management";
      default:
        return "Standard access level";
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleConfirmChange = async () => {
    if (selectedRole === user.role) {
      handleClose();
      return;
    }

    setIsChanging(true);
    try {
      await onConfirm(selectedRole);
      // Don't navigate here - let the parent component handle it
    } catch (error) {
      console.error("Error changing role:", error);
      // You might want to show an error toast here
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setSelectedRole(user?.role || "user");
    navigate("/admin/users");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !user) return null;

  const roles = ["user", "admin"];
  const hasChanges = selectedRole !== user.role;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-lg border border-gray-700 shadow-2xl mx-2 sm:mx-0 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Change User Role
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
            disabled={isChanging}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
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
                    <span className="text-gray-400 text-sm">Current role:</span>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <h3 className="text-white font-semibold mb-4">
                  Select New Role
                </h3>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left ${
                        selectedRole === role
                          ? "border-purple-500 bg-purple-600/20"
                          : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                      }`}
                      disabled={isChanging}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${getRoleColor(role)}`}
                          >
                            {getRoleIcon(role)}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize flex items-center gap-2">
                              {role}
                              {user.role === role && (
                                <span className="text-xs text-blue-400">
                                  (Current)
                                </span>
                              )}
                              {selectedRole === role &&
                                selectedRole !== user.role && (
                                  <span className="text-xs text-purple-400">
                                    (Selected)
                                  </span>
                                )}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {getRoleDescription(role)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(role)}>{role}</Badge>
                          {selectedRole === role && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning Messages */}
              {hasChanges && (
                <div className="space-y-3">
                  {/* Warning for giving Admin Role */}
                  {selectedRole === "admin" && user.role !== "admin" && (
                    <div className="bg-red-900/20 border border-red-500/30 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Crown className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-red-400 font-medium text-sm">
                            Admin Role Warning
                          </h4>
                          <p className="text-gray-300 text-sm mt-1">
                            Granting admin role will give this user full system
                            access including:
                          </p>
                          <ul className="text-gray-300 text-xs mt-2 space-y-1">
                            <li>• Manage all users and their roles</li>
                            <li>• Access admin dashboard and analytics</li>
                            <li>• Modify system settings and products</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning for removing Admin Role */}
                  {selectedRole === "user" && user.role === "admin" && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-yellow-400 font-medium text-sm">
                            Remove Admin Access
                          </h4>
                          <p className="text-gray-300 text-sm mt-1">
                            Changing this admin to user role will immediately
                            remove all administrative privileges.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirmation Required */}
                  <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">
                        Role changes take effect immediately. Click "Confirm
                        Change" to proceed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-600 text-black hover:bg-gray-700 flex-1"
              disabled={isChanging}
            >
              Cancel
            </Button>
            {hasChanges && (
              <Button
                onClick={handleConfirmChange}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                disabled={isChanging}
              >
                {isChanging ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Confirm Change to {selectedRole}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
