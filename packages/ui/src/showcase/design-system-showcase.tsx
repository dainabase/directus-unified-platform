/**
 * Design System Showcase - Interactive Component Library
 * 
 * Professional Apple-style showcase for the complete Dainabase Design System
 * featuring 132 enterprise-grade components with live interactive examples.
 * 
 * Features:
 * - Apple-inspired design language with sophisticated color palette
 * - 8 categorized sections with real component demonstrations
 * - Fully interactive examples (modals, toasts, forms, tables)
 * - Responsive sidebar navigation with component counts
 * - Live testing environment for buttons, inputs, and controls
 * - Production-ready showcase for enterprise evaluation
 * - Comprehensive coverage of all design system capabilities
 */

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Play, 
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  Info,
  Eye,
  Home,
  Grid,
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Bell,
  Image,
  Monitor,
  Copy,
  Volume2,
  VolumeX
} from 'lucide-react';

// Import actual design system components
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { Switch } from '../components/switch';
import { Progress } from '../components/progress';
import { Slider } from '../components/slider';
import { Select } from '../components/select';
import { Table } from '../components/table';
import { Avatar } from '../components/avatar';
import { Dialog } from '../components/dialog';
import { Toast } from '../components/toast';
import { cn } from '../lib/utils';

// =================== APPLE-STYLE DESIGN TOKENS ===================
const designTokens = {
  colors: {
    // Palette Apple : sobriété et élégance
    primary: '#007AFF',      // Bleu Apple signature
    secondary: '#34C759',    // Vert Apple
    accent: '#FF9500',       // Orange Apple
    destructive: '#FF3B30',  // Rouge Apple
    warning: '#FFCC00',      // Jaune Apple
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F7',
      200: '#E5E5EA',
      300: '#D1D1D6',
      400: '#8E8E93',
      500: '#636366',
      600: '#48484A',
      700: '#3A3A3C',
      800: '#2C2C2E',
      900: '#1C1C1E'
    }
  }
};

// =================== CUSTOM COMPONENTS FOR SHOWCASE ===================

// Apple-style Select component for showcase
const ShowcaseSelect = ({ options = [], value, onChange, placeholder = "Sélectionner...", ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className="relative" {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#D1D1D6] rounded-xl text-left text-[#1C1C1E] hover:border-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all duration-200"
      >
        <span className={selectedOption ? 'text-[#1C1C1E]' : 'text-[#8E8E93]'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronRight className={cn(
          "w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform",
          isOpen && "rotate-90"
        )} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5EA] rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Apple-style Switch for showcase
const ShowcaseSwitch = ({ checked, onChange, ...props }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange?.(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2",
      checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
    )}
    {...props}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);

// Apple-style Slider for showcase
const ShowcaseSlider = ({ value = 50, onChange, min = 0, max = 100, ...props }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="relative w-full h-6 flex items-center" {...props}>
      <div className="w-full h-2 bg-[#E5E5EA] rounded-full">
        <div 
          className="h-2 bg-[#007AFF] rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div 
        className="absolute w-5 h-5 bg-white border-2 border-[#007AFF] rounded-full shadow-md cursor-pointer transform -translate-x-1/2 hover:scale-110 transition-transform"
        style={{ left: `${percentage}%` }}
        onMouseDown={(e) => {
          const handleMouseMove = (e) => {
            const rect = e.target.closest('.relative').getBoundingClientRect();
            const newValue = min + ((e.clientX - rect.left) / rect.width) * (max - min);
            onChange?.(Math.min(max, Math.max(min, Math.round(newValue))));
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
};

// Apple-style Progress for showcase
const ShowcaseProgress = ({ value = 0, className = '', ...props }) => (
  <div className={cn("w-full bg-[#E5E5EA] rounded-full h-2", className)} {...props}>
    <div 
      className="bg-[#007AFF] h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Apple-style Table for showcase
const ShowcaseTable = ({ data = [], columns = [] }) => (
  <div className="overflow-hidden rounded-xl border border-[#E5E5EA]">
    <table className="w-full">
      <thead className="bg-[#F5F5F7]">
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="px-4 py-3 text-left text-sm font-medium text-[#8E8E93]">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-[#E5E5EA]">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-[#FAFAFA]">
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="px-4 py-3 text-sm text-[#1C1C1E]">
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Apple-style Avatar for showcase
const ShowcaseAvatar = ({ src, alt, size = 'md', fallback, ...props }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(sizes[size], "rounded-full object-cover border-2 border-[#E5E5EA]")}
        {...props}
      />
    );
  }
  
  return (
    <div 
      className={cn(
        sizes[size], 
        "rounded-full bg-[#007AFF] text-white flex items-center justify-center font-medium"
      )}
      {...props}
    >
      {fallback}
    </div>
  );
};

// Apple-style Modal for showcase
const ShowcaseModal = ({ isOpen, onClose, title, children, ...props }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1C1C1E]">{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
};

// Apple-style Toast for showcase
const ShowcaseToast = ({ message, type = 'info', visible, onClose }) => {
  const types = {
    info: { bg: 'bg-[#007AFF]', icon: Info },
    success: { bg: 'bg-[#34C759]', icon: Check },
    warning: { bg: 'bg-[#FFCC00]', icon: AlertCircle },
    error: { bg: 'bg-[#FF3B30]', icon: X }
  };
  
  const { bg, icon: IconComponent } = types[type];
  
  if (!visible) return null;
  
  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 transform transition-all duration-300",
      bg
    )}>
      <IconComponent className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// =================== MAIN SHOWCASE COMPONENT ===================
const DesignSystemShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('buttons');
  const [sliderValue, setSliderValue] = useState(50);
  const [switchStates, setSwitchStates] = useState({
    notifications: true,
    sync: false,
    autoSave: true
  });
  const [selectValue, setSelectValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState('info');
  
  // Categories avec toutes les fonctionnalités
  const categories = [
    { id: 'buttons', name: 'Buttons & Actions', icon: Play, count: 25 },
    { id: 'forms', name: 'Forms & Inputs', icon: Edit, count: 18 },
    { id: 'data', name: 'Data Display', icon: BarChart3, count: 12 },
    { id: 'navigation', name: 'Navigation', icon: Grid, count: 8 },
    { id: 'feedback', name: 'Feedback', icon: Bell, count: 10 },
    { id: 'media', name: 'Media & Content', icon: Image, count: 15 },
    { id: 'layout', name: 'Layout & Structure', icon: Monitor, count: 20 },
    { id: 'advanced', name: 'Advanced Components', icon: Settings, count: 24 }
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const tableData = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
  ];

  const showToast = (type) => {
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Fonction pour rendre le contenu selon la catégorie
  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'buttons':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1C1C1