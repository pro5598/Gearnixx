import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  MoreHorizontal,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the modal components
import AddUserModal from "../Admin/modals/AddUserModal";
import EditUserModal from "../Admin/modals/EditUserModal";
import ViewUserModal from "../Admin/modals/ViewUserModal";
import DeleteUserModal from "../Admin/modals/DeleteUserModal";
import ChangeRoleModal from "../Admin/modals/ChangeRoleModal";

// Import the API
import { userAPI } from "../../../services/userAPI";

export default function ManageUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  // Backend state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch users from backend
  const fetchUsers = async (
    page = 1,
    search = searchTerm,
    role = filterRole
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        search: search || undefined,
        role: role !== "all" ? role : undefined,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      const response = await userAPI.getAllUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm, filterRole);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole]);

  // Determine which modal should be open based on current route
  const getCurrentModal = () => {
    const path = location.pathname;
    const userId = params.id ? parseInt(params.id) : null;

    if (path === "/admin/users/add") {
      return { type: "add", user: null };
    } else if (path.includes("/edit") && userId) {
      const user = users.find((u) => u.id === userId);
      return { type: "edit", user };
    } else if (path.includes("/view") && userId) {
      const user = users.find((u) => u.id === userId);
      return { type: "view", user };
    } else if (path.includes("/delete") && userId) {
      const user = users.find((u) => u.id === userId);
      return { type: "delete", user };
    } else if (path.includes("/change-role") && userId) {
      const user = users.find((u) => u.id === userId);
      return { type: "changeRole", user };
    }

    return { type: null, user: null };
  };

  const currentModal = getCurrentModal();

  // Update selected user when route changes
  useEffect(() => {
    if (currentModal.user) {
      setSelectedUser(currentModal.user);
    } else if (params.id && !currentModal.user) {
      // If we have an ID but no user in current data, fetch it
      const fetchUser = async () => {
        try {
          const response = await userAPI.getUser(params.id);
          if (response.success) {
            setSelectedUser(response.data.user);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          navigate("/admin/users"); // Redirect if user not found
        }
      };
      fetchUser();
    } else {
      setSelectedUser(null);
    }
  }, [location.pathname, params.id, users]);

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

  const getStatusColor = (status) => {
    return status
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  // Navigation helpers
  const navigateToModal = (type, userId = null) => {
    const basePath = "/admin/users";
    switch (type) {
      case "add":
        navigate(`${basePath}/add`);
        break;
      case "edit":
        navigate(`${basePath}/${userId}/edit`);
        break;
      case "view":
        navigate(`${basePath}/${userId}/view`);
        break;
      case "delete":
        navigate(`${basePath}/${userId}/delete`);
        break;
      case "changeRole":
        navigate(`${basePath}/${userId}/change-role`);
        break;
      default:
        navigate("/admin/users");
    }
  };

  const closeModal = () => {
    navigate("/admin/users");
  };

  // CRUD operations with backend
  const handleAddUser = async (newUserForm) => {
    try {
      const response = await userAPI.createUser(newUserForm);
      if (response.success) {
        closeModal();
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // You might want to show an error toast here
      alert(error.message || "Failed to create user");
    }
  };

  const handleEditUser = async (editForm) => {
    try {
      const response = await userAPI.updateUser(selectedUser.id, editForm);
      if (response.success) {
        closeModal();
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await userAPI.deleteUser(selectedUser.id);
      if (response.success) {
        closeModal();
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.message || "Failed to delete user");
    }
  };

  const handleChangeRole = async (newRole) => {
    try {
      const response = await userAPI.updateUserRole(selectedUser.id, newRole);
      if (response.success) {
        closeModal();
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.message || "Failed to update user role");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const response = await userAPI.updateUserStatus(user.id, newStatus);
      if (response.success) {
        fetchUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert(error.message || "Failed to update user status");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, searchTerm, filterRole);
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => fetchUsers()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header - Responsive */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                Manage Users
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Manage user accounts and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">
                    Total Users
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 self-end sm:self-auto" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">
                    Active Users
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">
                    Inactive Users
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {stats.inactiveUsers}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                  <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-400 text-xs font-medium">Admins</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {stats.adminUsers}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600/20 rounded-lg flex items-center justify-center self-end sm:self-auto">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter - Responsive */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 text-sm sm:text-base"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600 w-full sm:w-auto justify-between sm:justify-center"
                size="sm"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="sm:hidden">Filter</span>
                  <span className="hidden sm:inline">
                    Role: {filterRole === "all" ? "All" : filterRole}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 w-56">
              <DropdownMenuItem
                onClick={() => setFilterRole("all")}
                className="text-white hover:bg-gray-700"
              >
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterRole("admin")}
                className="text-white hover:bg-gray-700"
              >
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterRole("user")}
                className="text-white hover:bg-gray-700"
              >
                User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Users Table/Cards - Responsive */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Users ({pagination.totalUsers})
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Join Date
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.firstName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="cursor-pointer"
                        >
                          <Badge
                            className={`text-xs ${getStatusColor(
                              user.isActive
                            )} hover:opacity-80 transition-opacity`}
                          >
                            {user.isActive ? "active" : "inactive"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-white">{user.username}</td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem
                              onClick={() => navigateToModal("view", user.id)}
                              className="text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigateToModal("edit", user.id)}
                              className="text-white hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigateToModal("changeRole", user.id)
                              }
                              className="text-white hover:bg-gray-700"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigateToModal("delete", user.id)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {users.map((user) => (
                <Card
                  key={user.id}
                  className="bg-gray-700/30 border-gray-600/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {user.firstName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm sm:text-base truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              {user.email}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4 text-white" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="bg-gray-800 border-gray-700"
                              align="end"
                            >
                              <DropdownMenuItem
                                onClick={() => navigateToModal("view", user.id)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigateToModal("edit", user.id)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigateToModal("changeRole", user.id)
                                }
                                className="text-white hover:bg-gray-700"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigateToModal("delete", user.id)
                                }
                                className="text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Role:</span>
                            <Badge
                              className={`ml-1 text-xs ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="cursor-pointer ml-1"
                            >
                              <Badge
                                className={`text-xs ${getStatusColor(
                                  user.isActive
                                )} hover:opacity-80 transition-opacity`}
                              >
                                {user.isActive ? "active" : "inactive"}
                              </Badge>
                            </button>
                          </div>
                          <div>
                            <span className="text-gray-400">Username:</span>
                            <span className="text-white ml-1">
                              {user.username}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Joined:</span>
                            <span className="text-white ml-1">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.totalUsers} total users)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Components - Responsive by default */}
        <AddUserModal
          isOpen={currentModal.type === "add"}
          onClose={closeModal}
          onSubmit={handleAddUser}
        />

        <EditUserModal
          isOpen={currentModal.type === "edit"}
          onClose={closeModal}
          onSubmit={handleEditUser}
          user={selectedUser}
        />

        <ViewUserModal
          isOpen={currentModal.type === "view"}
          onClose={closeModal}
          user={selectedUser}
        />

        <DeleteUserModal
          isOpen={currentModal.type === "delete"}
          onClose={closeModal}
          onConfirm={handleDeleteUser}
          user={selectedUser}
        />

        <ChangeRoleModal
          isOpen={currentModal.type === "changeRole"}
          onClose={closeModal}
          onConfirm={handleChangeRole}
          user={selectedUser}
        />
      </div>
    </div>
  );
}
