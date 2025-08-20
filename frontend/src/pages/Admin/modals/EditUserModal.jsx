import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Edit } from "lucide-react";
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

export default function EditUserModal({ isOpen, onClose, onSubmit, user }) {
  const navigate = useNavigate();
  const params = useParams();
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    gender: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        role: user.role || 'user',
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(editForm);
      // Navigation is handled in the parent component after successful update
    } catch (error) {
      console.error('Error updating user:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      gender: '',
      role: 'user'
    });
    onClose();
  };

  // Handle browser back button
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
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit User</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              User ID: {user.id} | {user.firstName} {user.lastName}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  First Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-purple-500"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  Last Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-purple-500"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  Username <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-purple-500"
                  placeholder="johndoe"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
  type="email"
  value={editForm.email}
  disabled
  className="cursor-not-allowed opacity-60 bg-gray-700/50 border-gray-600 text-white"
/>

              </div>
            </div>

            {/* Gender and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  Gender <span className="text-red-400">*</span>
                </Label>
                <Select 
                  value={editForm.gender} 
                  onValueChange={(value) => setEditForm({...editForm, gender: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-purple-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="male" className="text-white hover:bg-gray-700">Male</SelectItem>
                    <SelectItem value="female" className="text-white hover:bg-gray-700">Female</SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-700">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Role</Label>
                <Select 
                  value={editForm.role} 
                  onValueChange={(value) => setEditForm({...editForm, role: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="user" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Status Display */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <Label className="text-gray-300 text-sm font-medium mb-2 block">Current Status</Label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${editForm.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm">
                  {editForm.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Status can be changed from the main user list
              </p>
            </div>

            {/* User Info */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <Label className="text-gray-300 text-sm font-medium mb-2 block">Account Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Login:</span>
                  <span className="text-white ml-2">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
                disabled={isLoading}
              >
                {isLoading ? (
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="border-gray-600 text-black hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-700/20 rounded">
              <p className="flex items-center gap-2">
                <span className="text-red-400">*</span>
                Required fields
              </p>
              <p className="mt-1">
                Note: Password cannot be changed from this form. Users must reset their password through the login page.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
