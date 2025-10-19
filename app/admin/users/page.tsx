'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  Truck, 
  Building2, 
  Package,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'brewer' | 'driver' | 'restaurant_manager' | 'admin' | 'pending'
  status: 'pending' | 'active' | 'suspended'
  assigned_by: string | null
  assigned_at: string | null
  admin_notes: string | null
  created_at: string
  last_sign_in_at: string | null
  assigned_by_email: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('admin_user_management')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string, notes?: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role,
          status: 'active',
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', userId)
      
      if (error) throw error
      
      // Refresh users list
      fetchUsers()
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const suspendUser = async (userId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'suspended' })
        .eq('id', userId)
      
      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error suspending user:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'brewer': return <Package className="h-4 w-4" />
      case 'driver': return <Truck className="h-4 w-4" />
      case 'restaurant_manager': return <Building2 className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="pending">Pending Approval</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.full_name || 'No name'}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Joined:</span>
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  {user.last_sign_in_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Sign In:</span>
                      <span>{new Date(user.last_sign_in_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {user.assigned_by_email && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assigned By:</span>
                      <span>{user.assigned_by_email}</span>
                    </div>
                  )}
                </div>

                {user.status === 'pending' && (
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-700 font-medium">Awaiting Role Assignment</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Assign Role
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => suspendUser(user.id)}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                )}

                {user.status === 'active' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Edit Role
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => suspendUser(user.id)}
                    >
                      Suspend
                    </Button>
                  </div>
                )}

                {user.status === 'suspended' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Reactivate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Assignment Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Assign Role</CardTitle>
                <CardDescription>
                  Assign a role to {selectedUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Role
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      defaultValue={selectedUser.role}
                    >
                      <option value="brewer">Brewer</option>
                      <option value="driver">Driver</option>
                      <option value="restaurant_manager">Restaurant Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Add notes about this user..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        const roleSelect = document.querySelector('select') as HTMLSelectElement
                        const notesTextarea = document.querySelector('textarea') as HTMLTextAreaElement
                        updateUserRole(selectedUser.id, roleSelect.value, notesTextarea.value)
                      }}
                      className="flex-1"
                    >
                      Assign Role
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
