'use client';

import {
  DataGrid,
  Button,
  Badge,
  Input,
  Select,
  DropdownMenu,
  Dialog,
  Form,
  Card,
  Icon,
  Avatar,
  Checkbox
} from '../../../../packages/ui/src';
import { useState } from 'react';
import { MoreHorizontal, Plus, Search, Filter, Download, UserPlus } from 'lucide-react';

// Mock data for users
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-14', avatar: 'JS' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2024-01-10', avatar: 'BJ' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-15', avatar: 'AB' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-13', avatar: 'CW' },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-15', avatar: 'DP' },
  { id: 7, name: 'Edward Norton', email: 'edward@example.com', role: 'Viewer', status: 'Suspended', lastLogin: '2024-01-01', avatar: 'EN' },
  { id: 8, name: 'Frank Castle', email: 'frank@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-14', avatar: 'FC' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: 'select',
      header: () => (
        <Checkbox
          checked={selectedUsers.length === filteredUsers.length}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedUsers(filteredUsers.map(u => u.id));
            } else {
              setSelectedUsers([]);
            }
          }}
        />
      ),
      cell: (user: any) => (
        <Checkbox
          checked={selectedUsers.includes(user.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
        />
      ),
      width: 50,
    },
    {
      key: 'user',
      header: 'User',
      cell: (user: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            fallback={user.avatar}
            className="h-8 w-8"
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user: any) => (
        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: any) => (
        <Badge
          variant={
            user.status === 'Active' ? 'success' :
            user.status === 'Inactive' ? 'secondary' :
            'destructive'
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      cell: (user: any) => (
        <span className="text-sm text-muted-foreground">{user.lastLogin}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (user: any) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item>
              <Icon name="Edit" className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Icon name="Shield" className="mr-2 h-4 w-4" />
              Change Permissions
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Icon name="Clock" className="mr-2 h-4 w-4" />
              View Activity
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="text-destructive">
              <Icon name="Trash" className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
      width: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <Select.Trigger className="w-[150px]">
              <Select.Value placeholder="All Roles" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Roles</Select.Item>
              <Select.Item value="Admin">Admin</Select.Item>
              <Select.Item value="Editor">Editor</Select.Item>
              <Select.Item value="Viewer">Viewer</Select.Item>
            </Select.Content>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <Select.Trigger className="w-[150px]">
              <Select.Value placeholder="All Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="Active">Active</Select.Item>
              <Select.Item value="Inactive">Inactive</Select.Item>
              <Select.Item value="Suspended">Suspended</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-2 p-2 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedUsers.length} users selected
            </span>
            <Button variant="outline" size="sm">
              <Icon name="Mail" className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="Shield" className="h-4 w-4 mr-2" />
              Change Role
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Icon name="Trash" className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </Card>

      {/* Users DataGrid */}
      <Card>
        <DataGrid
          data={filteredUsers}
          columns={columns}
          pageSize={10}
          className="border-0"
        />
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <Dialog.Content className="sm:max-w-[500px]">
          <Dialog.Header>
            <Dialog.Title>Create New User</Dialog.Title>
            <Dialog.Description>
              Add a new user to your organization
            </Dialog.Description>
          </Dialog.Header>
          <Form onSubmit={(e) => {
            e.preventDefault();
            setIsCreateUserOpen(false);
          }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Form.Field name="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Input placeholder="John" />
                </Form.Field>
                <Form.Field name="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Input placeholder="Doe" />
                </Form.Field>
              </div>
              <Form.Field name="email">
                <Form.Label>Email</Form.Label>
                <Input type="email" placeholder="john@example.com" />
              </Form.Field>
              <Form.Field name="role">
                <Form.Label>Role</Form.Label>
                <Select defaultValue="Editor">
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="Admin">Admin</Select.Item>
                    <Select.Item value="Editor">Editor</Select.Item>
                    <Select.Item value="Viewer">Viewer</Select.Item>
                  </Select.Content>
                </Select>
              </Form.Field>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </Dialog.Footer>
          </Form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
