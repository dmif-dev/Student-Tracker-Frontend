
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Shield, UserCog } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'staff';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export default function UserSettingsPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@dmif.org',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-03-21 10:30 AM'
    },
    {
      id: '2',
      name: 'Dr. Smith',
      email: 'smith@dmif.org',
      role: 'mentor',
      status: 'active',
      lastLogin: '2024-03-21 09:15 AM'
    },
    {
      id: '3',
      name: 'Prof. Johnson',
      email: 'johnson@dmif.org',
      role: 'mentor',
      status: 'active',
      lastLogin: '2024-03-20 04:45 PM'
    },
    {
      id: '4',
      name: 'Staff Member',
      email: 'staff@dmif.org',
      role: 'staff',
      status: 'inactive',
      lastLogin: '2024-03-15 11:20 AM'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      mentor: 'bg-orange-100 text-orange-700',
      staff: 'bg-green-100 text-green-700'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">User Management</h2>
        <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
          <Plus size={18} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Shield size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
