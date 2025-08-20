import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, User } from "lucide-react";
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

export default function AddUserModal({ isOpen, onClose, onSubmit }) {
  const navigate = useNavigate();
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    phone: "",
    address: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newUserForm);
    // Reset form after successful submission
    setNewUserForm({
      name: "",
      email: "",
      role: "user",
      status: "active",
      phone: "",
      address: ""
    });
    // Navigate back to users page
    navigate('/admin/users');
  };

  const handleClose = () => {
    // Reset form when closing
    setNewUserForm({
      name: "",
      email: "",
      role: "user",
      status: "active",
      phone: "",
      address: ""
    });
    // Navigate back to users page
    navigate('/admin/users');
  };

  // Handle browser back button
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Add New User</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Name</Label>
                <Input
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Phone</Label>
                <Input
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Role</Label>
                <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm({...newUserForm, role: value})}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="user" className="text-white hover:bg-gray-700">User</SelectItem>
                    <SelectItem value="moderator" className="text-white hover:bg-gray-700">Moderator</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-sm font-medium">Address</Label>
              <Input
                value={newUserForm.address}
                onChange={(e) => setNewUserForm({...newUserForm, address: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
                placeholder="123 Main St, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-sm font-medium">Status</Label>
              <Select value={newUserForm.status} onValueChange={(value) => setNewUserForm({...newUserForm, status: value})}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="active" className="text-white hover:bg-gray-700">Active</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-gray-700">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
