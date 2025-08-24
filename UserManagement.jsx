import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, Users, Shield, ChevronDown, ChevronRight, 
  Building2, UserCheck, Mail, Lock, MoreVertical, Search,
  AlertCircle, CheckCircle, XCircle, User
} from 'lucide-react';

const UserManagement = ({ config, isDarkMode, user: currentUser, token, apiUrl }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/users/managed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const organized = organizeUserHierarchy(response.data.users);
      setUsers(organized);
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeUserHierarchy = (users) => {
    const parents = users.filter(u => !u.parentAccountId);
    const children = users.filter(u => u.parentAccountId);
    
    return parents.map(parent => ({
      ...parent,
      subUsers: children.filter(child => 
        child.parentAccountId === parent._id
      )
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchUsers();
        setShowCreateModal(false);
        showNotification('User created successfully', 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const updateUserModules = async (userId, modules) => {
    try {
      const response = await axios.put(
        `${apiUrl}/api/users/${userId}/modules`,
        { modules },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        fetchUsers();
        showNotification('User permissions updated', 'success');
      }
    } catch (error) {
      showNotification('Failed to update permissions', 'error');
    }
  };

  const canCreateUsers = () => {
    return ['system_admin', 'customer', 'foreign_partner'].includes(currentUser?.role);
  };

  const getAvailableRoles = () => {
    const roleMap = {
      system_admin: ['conship_employee', 'customer', 'foreign_partner'],
      customer: ['customer_user'],
      foreign_partner: ['foreign_partner_user']
    };
    return roleMap[currentUser?.role] || [];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      system_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      conship_employee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      customer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      foreign_partner: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      customer_user: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      foreign_partner_user: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle /> : <XCircle />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            User Management
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage users and their permissions across your organization
          </p>
        </div>
        
        {canCreateUsers() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={users.reduce((acc, u) => acc + 1 + (u.subUsers?.length || 0), 0)}
          icon={Users}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Organizations"
          value={users.filter(u => ['customer', 'foreign_partner'].includes(u.role)).length}
          icon={Building2}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Employees"
          value={users.filter(u => u.role === 'conship_employee').length}
          icon={UserCheck}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Active Users"
          value={users.filter(u => u.active).length}
          icon={Shield}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                : 'bg-white border-gray-300 focus:ring-blue-500'
            }`}
          />
        </div>
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
              : 'bg-white border-gray-300 focus:ring-blue-500'
          }`}
        >
          <option value="all">All Roles</option>
          <option value="system_admin">System Admin</option>
          <option value="conship_employee">Conship Employee</option>
          <option value="customer">Customer</option>
          <option value="foreign_partner">Foreign Partner</option>
        </select>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <UserCard
            key={user._id}
            user={user}
            expanded={expandedUsers.has(user._id)}
            onToggle={() => {
              const newExpanded = new Set(expandedUsers);
              if (newExpanded.has(user._id)) {
                newExpanded.delete(user._id);
              } else {
                newExpanded.add(user._id);
              }
              setExpandedUsers(newExpanded);
            }}
            onEdit={() => setSelectedUser(user)}
            isDarkMode={isDarkMode}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        ))}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createUser}
          availableRoles={getAvailableRoles()}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={updateUserModules}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, isDarkMode }) => (
  <div className={`p-4 rounded-lg ${
    isDarkMode ? 'bg-gray-800' : 'bg-white'
  }`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <p className={`text-2xl font-bold mt-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <Icon className={`w-6 h-6 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
      </div>
    </div>
  </div>
);

// User Card Component
const UserCard = ({ user, expanded, onToggle, onEdit, isDarkMode, getRoleBadgeColor }) => {
  const hasSubUsers = user.subUsers && user.subUsers.length > 0;
  
  return (
    <div className={`rounded-lg border shadow-sm ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasSubUsers && (
              <button 
                onClick={onToggle} 
                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                {expanded 
                  ? <ChevronDown className="w-5 h-5" /> 
                  : <ChevronRight className="w-5 h-5" />
                }
              </button>
            )}
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode 
                ? 'bg-blue-900/30 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasSubUsers && (
              <span className={`text-sm px-2 py-1 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user.subUsers.length} sub-users
              </span>
            )}
            
            <span className={`text-sm px-2 py-1 rounded-full ${
              user.active
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
            
            <button
              onClick={onEdit}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Sub-users */}
        {expanded && hasSubUsers && (
          <div className="mt-4 ml-12 space-y-2">
            {user.subUsers.map(subUser => (
              <SubUserCard
                key={subUser._id}
                subUser={subUser}
                isDarkMode={isDarkMode}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-user Card Component
const SubUserCard = ({ subUser, isDarkMode, onEdit }) => (
  <div className={`p-3 rounded-lg flex items-center justify-between ${
    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isDarkMode 
          ? 'bg-blue-900/30 text-blue-400' 
          : 'bg-blue-100 text-blue-600'
      }`}>
        <User className="w-4 h-4" />
      </div>
      <div>
        <p className={`font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {subUser.name}
        </p>
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {subUser.email}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
        Sub-user
      </span>
      <button
        onClick={() => onEdit(subUser)}
        className={`p-1 rounded ${
          isDarkMode 
            ? 'hover:bg-gray-600' 
            : 'hover:bg-gray-200'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Create User Modal
const CreateUserModal = ({ onClose, onCreate, availableRoles, isDarkMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: availableRoles[0] || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Create New User
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal (for module permissions)
const EditUserModal = ({ user, onClose, onUpdate, isDarkMode }) => {
  const allModules = [
    { id: 'quotes', name: 'Quotes', icon: '📊' },
    { id: 'tracking', name: 'Tracking', icon: '📍' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'partners', name: 'Partners', icon: '🤝' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const [selectedModules, setSelectedModules] = useState(
    user.modules ? user.modules.map(m => m.moduleId) : []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const modules = selectedModules.map(moduleId => ({
      moduleId,
      name: allModules.find(m => m.id === moduleId)?.name,
      permissions: ['read', 'write'] // You can customize this
    }));
    onUpdate(user._id, modules);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Edit User Permissions
        </h2>
        
        <div className="mb-4">
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.name}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {user.email}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Module Access
            </label>
            
            {allModules.map(module => (
              <label
                key={module.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  isDarkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModules([...selectedModules, module.id]);
                    } else {
                      setSelectedModules(selectedModules.filter(id => id !== module.id));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-lg">{module.icon}</span>
                <span className={`ml-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {module.name}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
