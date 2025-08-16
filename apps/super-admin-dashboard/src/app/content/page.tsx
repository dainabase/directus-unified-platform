'use client';

import {
  Kanban,
  Button,
  Badge,
  Input,
  Select,
  Card,
  Icon,
  Avatar,
  DropdownMenu,
  Dialog,
  Form,
  Textarea
} from '../../../../packages/ui/src';
import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, User } from 'lucide-react';

// Mock data for content items
const initialContent = {
  draft: [
    { id: '1', title: 'New Product Launch Article', author: 'John Doe', category: 'Marketing', priority: 'high', dueDate: '2024-01-20' },
    { id: '2', title: 'API Documentation Update', author: 'Jane Smith', category: 'Technical', priority: 'medium', dueDate: '2024-01-22' },
    { id: '3', title: 'Customer Success Story', author: 'Bob Johnson', category: 'Case Study', priority: 'low', dueDate: '2024-01-25' },
  ],
  review: [
    { id: '4', title: 'Q4 Financial Report', author: 'Alice Brown', category: 'Finance', priority: 'high', dueDate: '2024-01-18' },
    { id: '5', title: 'Blog: AI Trends 2024', author: 'Charlie Wilson', category: 'Blog', priority: 'medium', dueDate: '2024-01-21' },
  ],
  approved: [
    { id: '6', title: 'Company Culture Page', author: 'Diana Prince', category: 'HR', priority: 'low', dueDate: '2024-01-19' },
    { id: '7', title: 'Security Best Practices', author: 'Edward Norton', category: 'Technical', priority: 'high', dueDate: '2024-01-17' },
  ],
  published: [
    { id: '8', title: 'Welcome to Our Platform', author: 'Frank Castle', category: 'Onboarding', priority: 'medium', dueDate: '2024-01-15' },
    { id: '9', title: 'Feature Announcement: Dark Mode', author: 'John Doe', category: 'Product', priority: 'low', dueDate: '2024-01-14' },
    { id: '10', title: 'Monthly Newsletter January', author: 'Jane Smith', category: 'Marketing', priority: 'medium', dueDate: '2024-01-01' },
  ],
};

const columns = [
  { id: 'draft', title: 'Draft', color: 'bg-gray-500' },
  { id: 'review', title: 'In Review', color: 'bg-yellow-500' },
  { id: 'approved', title: 'Approved', color: 'bg-blue-500' },
  { id: 'published', title: 'Published', color: 'bg-green-500' },
];

export default function ContentPage() {
  const [content, setContent] = useState(initialContent);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = Array.from(content[source.droppableId as keyof typeof content]);
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      
      setContent({
        ...content,
        [source.droppableId]: column,
      });
    } else {
      // Move between columns
      const sourceColumn = Array.from(content[source.droppableId as keyof typeof content]);
      const destColumn = Array.from(content[destination.droppableId as keyof typeof content]);
      const [removed] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, removed);
      
      setContent({
        ...content,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const renderCard = (item: any) => (
    <Card 
      className="p-4 cursor-move hover:shadow-md transition-shadow"
      onClick={() => setSelectedItem(item)}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium line-clamp-2">{item.title}</h4>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item>
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Icon name="Copy" className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Icon name="Archive" className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item className="text-destructive">
                <Icon name="Trash" className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getPriorityColor(item.priority)}>
            {item.priority}
          </Badge>
          <Badge variant="outline">
            {item.category}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{item.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{item.dueDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your content pipeline
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Content
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <Select.Trigger className="w-[180px]">
              <Select.Value placeholder="All Categories" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Categories</Select.Item>
              <Select.Item value="Marketing">Marketing</Select.Item>
              <Select.Item value="Technical">Technical</Select.Item>
              <Select.Item value="Blog">Blog</Select.Item>
              <Select.Item value="Case Study">Case Study</Select.Item>
              <Select.Item value="Product">Product</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="bg-muted/30 rounded-lg p-4">
        <Kanban
          columns={columns}
          items={content}
          onDragEnd={handleDragEnd}
          renderCard={renderCard}
        />
      </div>

      {/* Create Content Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <Dialog.Content className="sm:max-w-[600px]">
          <Dialog.Header>
            <Dialog.Title>Create New Content</Dialog.Title>
            <Dialog.Description>
              Add a new content item to your pipeline
            </Dialog.Description>
          </Dialog.Header>
          <Form onSubmit={(e) => {
            e.preventDefault();
            setIsCreateOpen(false);
          }}>
            <div className="space-y-4 py-4">
              <Form.Field name="title">
                <Form.Label>Title</Form.Label>
                <Input placeholder="Enter content title" />
              </Form.Field>
              <Form.Field name="description">
                <Form.Label>Description</Form.Label>
                <Textarea 
                  placeholder="Enter content description" 
                  rows={4}
                />
              </Form.Field>
              <div className="grid grid-cols-2 gap-4">
                <Form.Field name="category">
                  <Form.Label>Category</Form.Label>
                  <Select defaultValue="Blog">
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="Marketing">Marketing</Select.Item>
                      <Select.Item value="Technical">Technical</Select.Item>
                      <Select.Item value="Blog">Blog</Select.Item>
                      <Select.Item value="Case Study">Case Study</Select.Item>
                      <Select.Item value="Product">Product</Select.Item>
                    </Select.Content>
                  </Select>
                </Form.Field>
                <Form.Field name="priority">
                  <Form.Label>Priority</Form.Label>
                  <Select defaultValue="medium">
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="high">High</Select.Item>
                      <Select.Item value="medium">Medium</Select.Item>
                      <Select.Item value="low">Low</Select.Item>
                    </Select.Content>
                  </Select>
                </Form.Field>
              </div>
              <Form.Field name="dueDate">
                <Form.Label>Due Date</Form.Label>
                <Input type="date" />
              </Form.Field>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Content</Button>
            </Dialog.Footer>
          </Form>
        </Dialog.Content>
      </Dialog>

      {/* Content Detail Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <Dialog.Content className="sm:max-w-[600px]">
            <Dialog.Header>
              <Dialog.Title>{selectedItem.title}</Dialog.Title>
              <Dialog.Description>
                Content details and actions
              </Dialog.Description>
            </Dialog.Header>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Author</p>
                  <p className="text-sm">{selectedItem.author}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge variant={getPriorityColor(selectedItem.priority)}>
                    {selectedItem.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="text-sm">{selectedItem.dueDate}</p>
                </div>
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button>Edit Content</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </div>
  );
}
