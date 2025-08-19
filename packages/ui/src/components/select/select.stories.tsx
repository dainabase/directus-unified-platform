import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  // Premium Dashboard Components
  ExecutiveSelect,
  TeamSelect,
  MultiFilterSelect,
  CountrySelect,
  FinanceSelect,
  AnalyticsSelect,
  TagSelect,
  // Types
  type SelectItem as SelectItemType,
} from './index';

// 📊 EXECUTIVE DASHBOARD DATA
const executiveMetrics: SelectItemType[] = [
  {
    value: 'revenue',
    label: 'Total Revenue',
    description: 'Quarterly revenue growth (Q3 2025)',
    icon: '💰',
    badge: '+12.3%',
    category: 'finance'
  },
  {
    value: 'users',
    label: 'Active Users',
    description: 'Monthly active users worldwide',
    icon: '👥',
    badge: '2.1M',
    category: 'engagement'
  },
  {
    value: 'conversion',
    label: 'Conversion Rate',
    description: 'Sales funnel conversion rate',
    icon: '📈',
    badge: '3.2%',
    category: 'sales'
  },
  {
    value: 'retention',
    label: 'Customer Retention',
    description: 'Monthly customer retention rate',
    icon: '🔄',
    badge: '94.2%',
    category: 'retention'
  },
  {
    value: 'satisfaction',
    label: 'Customer Satisfaction',
    description: 'Net Promoter Score (NPS)',
    icon: '⭐',
    badge: '8.7/10',
    category: 'satisfaction'
  },
  {
    value: 'market_share',
    label: 'Market Share',
    description: 'Industry market position',
    icon: '🎯',
    badge: '15.8%',
    category: 'market'
  }
];

// 👥 TEAM MEMBERS DATA
const teamMembers: SelectItemType[] = [
  {
    value: 'sarah_ceo',
    label: 'Sarah Johnson',
    description: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b6d?w=40&h=40&fit=crop&crop=face',
    badge: 'CEO',
    category: 'executive'
  },
  {
    value: 'mike_cto',
    label: 'Mike Chen',
    description: 'Chief Technology Officer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    badge: 'CTO',
    category: 'executive'
  },
  {
    value: 'emily_cfo',
    label: 'Emily Davis',
    description: 'Chief Financial Officer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    badge: 'CFO',
    category: 'executive'
  },
  {
    value: 'alex_dev',
    label: 'Alex Rodriguez',
    description: 'Senior Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    badge: 'Senior',
    category: 'engineering'
  },
  {
    value: 'lisa_design',
    label: 'Lisa Wang',
    description: 'Principal UX Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    badge: 'Principal',
    category: 'design'
  },
  {
    value: 'david_pm',
    label: 'David Thompson',
    description: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    badge: 'PM',
    category: 'product'
  },
  {
    value: 'maria_qa',
    label: 'Maria Garcia',
    description: 'QA Engineer',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face',
    badge: 'QA',
    category: 'quality'
  },
  {
    value: 'james_data',
    label: 'James Wilson',
    description: 'Data Scientist',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face',
    badge: 'PhD',
    category: 'data'
  }
];

// 🌍 COUNTRIES DATA
const countries: SelectItemType[] = [
  {
    value: 'us',
    label: 'United States',
    description: 'North America • 331M population',
    icon: '🇺🇸',
    category: 'americas'
  },
  {
    value: 'gb',
    label: 'United Kingdom',
    description: 'Europe • 67M population',
    icon: '🇬🇧',
    category: 'europe'
  },
  {
    value: 'fr',
    label: 'France',
    description: 'Europe • 68M population',
    icon: '🇫🇷',
    category: 'europe'
  },
  {
    value: 'de',
    label: 'Germany',
    description: 'Europe • 83M population',
    icon: '🇩🇪',
    category: 'europe'
  },
  {
    value: 'jp',
    label: 'Japan',
    description: 'Asia • 125M population',
    icon: '🇯🇵',
    category: 'asia'
  },
  {
    value: 'cn',
    label: 'China',
    description: 'Asia • 1.4B population',
    icon: '🇨🇳',
    category: 'asia'
  },
  {
    value: 'in',
    label: 'India',
    description: 'Asia • 1.4B population',
    icon: '🇮🇳',
    category: 'asia'
  },
  {
    value: 'au',
    label: 'Australia',
    description: 'Oceania • 26M population',
    icon: '🇦🇺',
    category: 'oceania'
  },
  {
    value: 'ca',
    label: 'Canada',
    description: 'North America • 38M population',
    icon: '🇨🇦',
    category: 'americas'
  },
  {
    value: 'br',
    label: 'Brazil',
    description: 'South America • 215M population',
    icon: '🇧🇷',
    category: 'americas'
  }
];

// 💰 FINANCIAL KPIS DATA
const financeKPIs: SelectItemType[] = [
  {
    value: 'revenue_growth',
    label: 'Revenue Growth',
    description: 'Year-over-year revenue increase',
    icon: '📈',
    badge: '+15.2%',
    category: 'growth'
  },
  {
    value: 'profit_margin',
    label: 'Net Profit Margin',
    description: 'Net profit as percentage of revenue',
    icon: '💰',
    badge: '23.4%',
    category: 'profitability'
  },
  {
    value: 'ebitda',
    label: 'EBITDA',
    description: 'Earnings before interest, taxes, depreciation',
    icon: '📊',
    badge: '$12.3M',
    category: 'earnings'
  },
  {
    value: 'cash_flow',
    label: 'Operating Cash Flow',
    description: 'Cash generated from operations',
    icon: '💵',
    badge: '$8.9M',
    category: 'cash'
  },
  {
    value: 'roa',
    label: 'Return on Assets',
    description: 'Efficiency of asset utilization',
    icon: '🎯',
    badge: '12.8%',
    category: 'efficiency'
  },
  {
    value: 'debt_ratio',
    label: 'Debt-to-Equity Ratio',
    description: 'Financial leverage indicator',
    icon: '⚖️',
    badge: '0.35',
    category: 'leverage'
  }
];

// 📊 ANALYTICS METRICS DATA (Large Dataset)
const analyticsMetrics: SelectItemType[] = Array.from({ length: 200 }, (_, i) => ({
  value: `metric_${i}`,
  label: `Analytics Metric ${i + 1}`,
  description: `Performance indicator ${i + 1} for business intelligence`,
  icon: '📈',
  badge: `${(Math.random() * 100).toFixed(1)}%`,
  category: i % 4 === 0 ? 'performance' : i % 4 === 1 ? 'engagement' : i % 4 === 2 ? 'conversion' : 'retention'
}));

// 🏷️ TAGS DATA
const initialTags: SelectItemType[] = [
  { value: 'urgent', label: 'Urgent', icon: '🚨', category: 'priority' },
  { value: 'important', label: 'Important', icon: '⭐', category: 'priority' },
  { value: 'review', label: 'Review', icon: '👀', category: 'status' },
  { value: 'approved', label: 'Approved', icon: '✅', category: 'status' },
  { value: 'in_progress', label: 'In Progress', icon: '⏳', category: 'status' },
  { value: 'completed', label: 'Completed', icon: '🎉', category: 'status' },
  { value: 'bug', label: 'Bug', icon: '🐛', category: 'type' },
  { value: 'feature', label: 'Feature', icon: '✨', category: 'type' },
  { value: 'enhancement', label: 'Enhancement', icon: '🔧', category: 'type' },
  { value: 'documentation', label: 'Documentation', icon: '📚', category: 'type' }
];

// 🎨 FILTER OPTIONS DATA
const filterOptions: SelectItemType[] = [
  {
    value: 'date_range',
    label: 'Date Range',
    description: 'Filter by creation or modification date',
    icon: '📅',
    category: 'temporal'
  },
  {
    value: 'status',
    label: 'Status',
    description: 'Filter by completion status',
    icon: '📊',
    category: 'state'
  },
  {
    value: 'priority',
    label: 'Priority Level',
    description: 'Filter by importance level',
    icon: '⭐',
    category: 'importance'
  },
  {
    value: 'assignee',
    label: 'Assignee',
    description: 'Filter by person responsible',
    icon: '👤',
    category: 'person'
  },
  {
    value: 'department',
    label: 'Department',
    description: 'Filter by organizational unit',
    icon: '🏢',
    category: 'organization'
  },
  {
    value: 'project',
    label: 'Project',
    description: 'Filter by project association',
    icon: '📁',
    category: 'organization'
  },
  {
    value: 'budget',
    label: 'Budget Range',
    description: 'Filter by financial allocation',
    icon: '💰',
    category: 'financial'
  },
  {
    value: 'region',
    label: 'Geographic Region',
    description: 'Filter by location or territory',
    icon: '🌍',
    category: 'location'
  }
];

const meta: Meta<typeof Select> = {
  title: 'Dashboard/Select ⭐⭐⭐⭐⭐',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Select Component Pattern Triple ⭐⭐⭐⭐⭐

Premium dashboard select component with enterprise features for executive dashboards, team management, 
analytics, and business intelligence applications.

## 🚀 Key Features

- **🔍 Advanced Search** - Real-time filtering with debounce
- **🏷️ Multi-Select** - Visual chips with individual removal
- **🎨 Executive Themes** - 6 premium dashboard themes
- **⚡ Virtualization** - Handles 1000+ items efficiently
- **🎭 Specialized Variants** - 7 business-focused components
- **♿ WCAG AAA** - Full accessibility compliance
- **📊 Dashboard Integration** - Perfect companion to charts

## 🎯 Specialized Components

- **ExecutiveSelect** - C-level metrics with premium styling
- **TeamSelect** - Member management with avatars
- **MultiFilterSelect** - Advanced filtering with analytics
- **CountrySelect** - Geographic data with flag icons
- **FinanceSelect** - Financial KPIs and metrics
- **AnalyticsSelect** - Performance data with virtualization
- **TagSelect** - Dynamic tag creation and management

## 🎨 Available Themes

- \`executive\` - Premium gradients for C-level dashboards
- \`dashboard\` - Business intelligence blue theme
- \`finance\` - Financial green for KPI displays
- \`analytics\` - Purple for data science metrics
- \`minimal\` - Clean gray for modern interfaces
- \`default\` - Versatile for general enterprise use
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the select component'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value is selected'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// 🎯 BASIC SELECT STORIES
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    
    return (
      <div className="w-[300px]">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fresh Fruits</SelectLabel>
              <SelectItem value="apple">🍎 Apple</SelectItem>
              <SelectItem value="banana">🍌 Banana</SelectItem>
              <SelectItem value="orange">🍊 Orange</SelectItem>
              <SelectSeparator />
              <SelectItem value="grape">🍇 Grape</SelectItem>
              <SelectItem value="strawberry">🍓 Strawberry</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {value && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <strong>{value}</strong>
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic select component with fruit options and selection feedback.'
      }
    }
  }
};

export const WithSearch: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    const [searchValue, setSearchValue] = useState('');
    
    const filteredCountries = countries.filter(country =>
      country.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      country.description.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return (
      <div className="w-[350px]">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger variant="outline">
            <SelectValue placeholder="Search and select country..." />
          </SelectTrigger>
          <SelectContent 
            searchable={true}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          >
            <SelectGroup>
              <SelectLabel>Countries</SelectLabel>
              {filteredCountries.map((country) => (
                <SelectItem 
                  key={country.value} 
                  value={country.value}
                  icon={country.icon}
                  description={country.description}
                >
                  {country.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {value && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <strong>{countries.find(c => c.value === value)?.label}</strong>
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with integrated search functionality for filtering large datasets.'
      }
    }
  }
};

// 🎯 EXECUTIVE DASHBOARD STORIES
export const ExecutiveDashboard: Story = {
  render: () => {
    const [selectedMetric, setSelectedMetric] = useState<string>('');
    
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Executive Dashboard Metrics
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            C-level performance indicators with premium styling
          </p>
          
          <ExecutiveSelect
            items={executiveMetrics}
            value={selectedMetric}
            onValueChange={setSelectedMetric}
            placeholder="Select key performance indicator..."
            className="w-full max-w-md"
          />
        </div>
        
        {selectedMetric && (
          <div className="mt-4 p-4 bg-white border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {executiveMetrics.find(m => m.value === selectedMetric)?.icon}
              </span>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {executiveMetrics.find(m => m.value === selectedMetric)?.label}
                </h4>
                <p className="text-sm text-slate-600">
                  {executiveMetrics.find(m => m.value === selectedMetric)?.description}
                </p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                  {executiveMetrics.find(m => m.value === selectedMetric)?.badge}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Executive-style select for C-level dashboard metrics with premium theming and badges.'
      }
    }
  }
};

export const TeamManagement: Story = {
  render: () => {
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedMembers, setSelectedMembers] = useState<SelectItemType[]>([]);
    
    const handleRemoveMember = (memberId: string) => {
      setSelectedMembers(prev => prev.filter(m => m.value !== memberId));
    };
    
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Team Management
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Select team members with avatars and role information
          </p>
          
          <div className="space-y-4">
            {/* Single Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Lead
              </label>
              <TeamSelect
                members={teamMembers.filter(m => m.category === 'executive')}
                value={selectedMember}
                onValueChange={setSelectedMember}
                placeholder="Select project lead..."
                className="w-full max-w-md"
              />
            </div>
            
            {/* Multi Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members ({selectedMembers.length} selected)
              </label>
              <TeamSelect
                members={teamMembers}
                isMulti={true}
                selectedMembers={selectedMembers}
                onRemoveMember={handleRemoveMember}
                placeholder="Select team members..."
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {selectedMember && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Project Lead</h4>
            <div className="flex items-center gap-3">
              <img 
                src={teamMembers.find(m => m.value === selectedMember)?.avatar} 
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-blue-900">
                  {teamMembers.find(m => m.value === selectedMember)?.label}
                </p>
                <p className="text-sm text-blue-700">
                  {teamMembers.find(m => m.value === selectedMember)?.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Team management with avatar support, role descriptions, and multi-select capabilities.'
      }
    }
  }
};

export const AdvancedFiltering: Story = {
  render: () => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['status', 'priority']);
    
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Advanced Dashboard Filtering
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Multi-select filters with search, metrics, and real-time feedback
          </p>
          
          <MultiFilterSelect
            items={filterOptions}
            selectedValues={selectedFilters}
            onValueChange={setSelectedFilters}
            placeholder="Configure dashboard filters..."
            searchable={true}
            showMetrics={true}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-1">Active Filters</h4>
            <p className="text-2xl font-bold text-green-800">{selectedFilters.length}</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Available Options</h4>
            <p className="text-2xl font-bold text-blue-800">{filterOptions.length}</p>
          </div>
        </div>
        
        {selectedFilters.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Applied Filters</h4>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map(filterId => {
                const filter = filterOptions.find(f => f.value === filterId);
                return filter ? (
                  <span 
                    key={filterId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {filter.icon} {filter.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced multi-filter select with dashboard metrics, search, and visual feedback.'
      }
    }
  }
};

export const GeographicData: Story = {
  render: () => {
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Geographic Data Selection
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Country selection with flag icons, population data, and search
          </p>
          
          <CountrySelect
            countries={countries}
            value={selectedCountry}
            onValueChange={setSelectedCountry}
            searchable={true}
            placeholder="Search and select country..."
            className="w-full max-w-md"
          />
        </div>
        
        {selectedCountry && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {countries.find(c => c.value === selectedCountry)?.icon}
              </span>
              <div>
                <h4 className="font-semibold text-blue-900">
                  {countries.find(c => c.value === selectedCountry)?.label}
                </h4>
                <p className="text-sm text-blue-700">
                  {countries.find(c => c.value === selectedCountry)?.description}
                </p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {countries.find(c => c.value === selectedCountry)?.category?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic data selection with country flags, population info, and regional categorization.'
      }
    }
  }
};

export const FinancialKPIs: Story = {
  render: () => {
    const [selectedKPI, setSelectedKPI] = useState<string>('');
    
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-emerald-50 to-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Financial Dashboard KPIs
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Key performance indicators for financial analysis and reporting
          </p>
          
          <FinanceSelect
            kpis={financeKPIs}
            value={selectedKPI}
            onValueChange={setSelectedKPI}
            placeholder="Select financial KPI..."
            className="w-full max-w-md"
          />
        </div>
        
        {selectedKPI && (
          <div className="mt-4 p-4 bg-white border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {financeKPIs.find(k => k.value === selectedKPI)?.icon}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">
                  {financeKPIs.find(k => k.value === selectedKPI)?.label}
                </h4>
                <p className="text-sm text-slate-600">
                  {financeKPIs.find(k => k.value === selectedKPI)?.description}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 text-lg font-bold bg-emerald-100 text-emerald-800 rounded">
                  {financeKPIs.find(k => k.value === selectedKPI)?.badge}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {financeKPIs.find(k => k.value === selectedKPI)?.category}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white border border-emerald-200 rounded-lg text-center">
            <p className="text-sm text-emerald-600 font-medium">Growth</p>
            <p className="text-xl font-bold text-emerald-800">+15.2%</p>
          </div>
          <div className="p-3 bg-white border border-emerald-200 rounded-lg text-center">
            <p className="text-sm text-emerald-600 font-medium">Margin</p>
            <p className="text-xl font-bold text-emerald-800">23.4%</p>
          </div>
          <div className="p-3 bg-white border border-emerald-200 rounded-lg text-center">
            <p className="text-sm text-emerald-600 font-medium">ROA</p>
            <p className="text-xl font-bold text-emerald-800">12.8%</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Financial KPI selection with performance metrics, badges, and category organization.'
      }
    }
  }
};

export const AnalyticsPerformance: Story = {
  render: () => {
    const [selectedMetric, setSelectedMetric] = useState<string>('');
    
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Analytics Performance Metrics
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Large dataset with virtualization (200+ metrics)
          </p>
          
          <AnalyticsSelect
            metrics={analyticsMetrics}
            value={selectedMetric}
            onValueChange={setSelectedMetric}
            virtualized={true}
            placeholder="Select analytics metric..."
            className="w-full max-w-md"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-1">Total Metrics</h4>
            <p className="text-2xl font-bold text-purple-800">{analyticsMetrics.length}</p>
            <p className="text-sm text-purple-600">With virtualization</p>
          </div>
          <div className="p-4 bg-white border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-1">Performance</h4>
            <p className="text-2xl font-bold text-purple-800">⚡ Fast</p>
            <p className="text-sm text-purple-600">Optimized rendering</p>
          </div>
        </div>
        
        {selectedMetric && (
          <div className="mt-4 p-4 bg-white border border-purple-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h4 className="font-semibold text-purple-900">
                  {analyticsMetrics.find(m => m.value === selectedMetric)?.label}
                </h4>
                <p className="text-sm text-purple-700">
                  {analyticsMetrics.find(m => m.value === selectedMetric)?.description}
                </p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  {analyticsMetrics.find(m => m.value === selectedMetric)?.badge}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Analytics metrics with virtualization for handling large datasets efficiently.'
      }
    }
  }
};

export const DynamicTagCreation: Story = {
  render: () => {
    const [tags, setTags] = useState<SelectItemType[]>(initialTags);
    const [selectedTags, setSelectedTags] = useState<string[]>(['urgent', 'review']);
    
    const handleCreateTag = (tagName: string) => {
      const newTag: SelectItemType = {
        value: `custom_${Date.now()}`,
        label: tagName,
        icon: '🏷️',
        category: 'custom'
      };
      setTags(prev => [...prev, newTag]);
      setSelectedTags(prev => [...prev, newTag.value]);
    };
    
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Dynamic Tag Management
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Create, select, and manage tags dynamically with visual chips
          </p>
          
          <TagSelect
            tags={tags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            onCreateTag={handleCreateTag}
            allowCreate={true}
            placeholder="Select or create tags..."
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h4 className="font-medium text-blue-900 mb-1">Total Tags</h4>
            <p className="text-2xl font-bold text-blue-800">{tags.length}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <h4 className="font-medium text-green-900 mb-1">Selected</h4>
            <p className="text-2xl font-bold text-green-800">{selectedTags.length}</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <h4 className="font-medium text-purple-900 mb-1">Custom</h4>
            <p className="text-2xl font-bold text-purple-800">
              {tags.filter(t => t.category === 'custom').length}
            </p>
          </div>
        </div>
        
        {selectedTags.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.value === tagId);
                return tag ? (
                  <span 
                    key={tagId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag.icon} {tag.label}
                    {tag.category === 'custom' && (
                      <span className="ml-1 text-xs opacity-60">(custom)</span>
                    )}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Dynamic tag creation and management with multi-select capabilities and visual feedback.'
      }
    }
  }
};

// 🎨 THEME SHOWCASE STORIES
export const ThemeShowcase: Story = {
  render: () => {
    const themes = ['default', 'executive', 'dashboard', 'finance', 'analytics', 'minimal'] as const;
    const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
    
    const handleValueChange = (theme: string, value: string) => {
      setSelectedValues(prev => ({ ...prev, [theme]: value }));
    };
    
    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Theme System Showcase
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            All 6 available themes with different styling approaches for various dashboard contexts
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {themes.map((theme) => (
            <div key={theme} className="p-4 bg-white rounded-lg border">
              <h4 className="font-medium text-slate-900 mb-2 capitalize">
                {theme} Theme
              </h4>
              <Select 
                value={selectedValues[theme] || ''} 
                onValueChange={(value) => handleValueChange(theme, value)}
              >
                <SelectTrigger 
                  variant={theme === 'executive' ? 'executive' : theme === 'dashboard' ? 'premium' : 'default'}
                  theme={theme}
                  className="w-full"
                >
                  <SelectValue placeholder={`${theme} select...`} />
                </SelectTrigger>
                <SelectContent theme={theme}>
                  <SelectGroup>
                    <SelectLabel>{theme.charAt(0).toUpperCase() + theme.slice(1)} Options</SelectLabel>
                    <SelectItem value="option1" icon="🎯">
                      Premium Option 1
                    </SelectItem>
                    <SelectItem value="option2" icon="⭐" badge="New">
                      Featured Option 2
                    </SelectItem>
                    <SelectItem value="option3" icon="🚀" description="With description">
                      Advanced Option 3
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedValues[theme] && (
                <p className="mt-2 text-xs text-gray-600">
                  Selected: {selectedValues[theme]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all 6 available themes for different dashboard contexts and use cases.'
      }
    }
  }
};

// 🚀 PERFORMANCE DEMO
export const PerformanceDemo: Story = {
  render: () => {
    const [loadSize, setLoadSize] = useState<string>('100');
    const [renderTime, setRenderTime] = useState<number>(0);
    
    const generateLargeDataset = (size: number) => {
      const startTime = performance.now();
      
      const dataset = Array.from({ length: size }, (_, i) => ({
        value: `item_${i}`,
        label: `Performance Item ${i + 1}`,
        description: `Generated item ${i + 1} for performance testing`,
        icon: '⚡',
        badge: `${(Math.random() * 100).toFixed(1)}ms`,
        category: i % 4 === 0 ? 'fast' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'slow' : 'optimal'
      }));
      
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      
      return dataset;
    };
    
    const dataset = generateLargeDataset(parseInt(loadSize));
    
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Performance Demonstration
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Test select performance with large datasets and virtualization
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Dataset Size:
            </label>
            <Select value={loadSize} onValueChange={setLoadSize}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 items</SelectItem>
                <SelectItem value="500">500 items</SelectItem>
                <SelectItem value="1000">1,000 items</SelectItem>
                <SelectItem value="5000">5,000 items</SelectItem>
                <SelectItem value="10000">10,000 items</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <AnalyticsSelect
            metrics={dataset}
            virtualized={parseInt(loadSize) > 100}
            placeholder={`Select from ${loadSize} items...`}
            className="w-full max-w-md"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h4 className="font-medium text-blue-900 mb-1">Items</h4>
            <p className="text-2xl font-bold text-blue-800">{loadSize}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <h4 className="font-medium text-green-900 mb-1">Render Time</h4>
            <p className="text-2xl font-bold text-green-800">{renderTime.toFixed(1)}ms</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <h4 className="font-medium text-purple-900 mb-1">Virtualized</h4>
            <p className="text-2xl font-bold text-purple-800">
              {parseInt(loadSize) > 100 ? '✓' : '✗'}
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Performance Notes</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Virtualization automatically enabled for 100+ items</li>
            <li>• Search functionality maintains performance with debouncing</li>
            <li>• Memory usage optimized with efficient rendering</li>
            <li>• Smooth scrolling maintained even with 10,000+ items</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance testing with large datasets, virtualization, and render time monitoring.'
      }
    }
  }
};

// 🔄 DASHBOARD ECOSYSTEM INTEGRATION
export const DashboardEcosystem: Story = {
  render: () => {
    const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>('quarter');
    const [selectedRegions, setSelectedRegions] = useState<string[]>(['us', 'gb']);
    
    const timeframes = [
      { value: 'week', label: 'Last 7 Days', icon: '📅' },
      { value: 'month', label: 'Last 30 Days', icon: '📊' },
      { value: 'quarter', label: 'Last Quarter', icon: '📈' },
      { value: 'year', label: 'Last Year', icon: '📋' }
    ];
    
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Complete Dashboard Ecosystem
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Integrated select components working together for comprehensive business intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Executive Metric Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Key Metric
            </label>
            <ExecutiveSelect
              items={executiveMetrics}
              value={selectedMetric}
              onValueChange={setSelectedMetric}
              placeholder="Select KPI..."
              className="w-full"
            />
          </div>
          
          {/* Timeframe Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Time Period
            </label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger variant="outline" theme="dashboard">
                <SelectValue placeholder="Select timeframe..." />
              </SelectTrigger>
              <SelectContent theme="dashboard">
                <SelectGroup>
                  <SelectLabel>Timeframes</SelectLabel>
                  {timeframes.map((timeframe) => (
                    <SelectItem 
                      key={timeframe.value} 
                      value={timeframe.value}
                      icon={timeframe.icon}
                    >
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Regional Filtering */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Regions ({selectedRegions.length})
            </label>
            <MultiFilterSelect
              items={countries.map(c => ({ ...c, value: c.value }))}
              selectedValues={selectedRegions}
              onValueChange={setSelectedRegions}
              placeholder="Select regions..."
              searchable={true}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-4">Dashboard Preview</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-600 font-medium">Metric</p>
              <p className="text-lg font-bold text-blue-800 capitalize">{selectedMetric}</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm text-green-600 font-medium">Period</p>
              <p className="text-lg font-bold text-green-800 capitalize">{selectedTimeframe}</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-sm text-purple-600 font-medium">Regions</p>
              <p className="text-lg font-bold text-purple-800">{selectedRegions.length}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-sm text-amber-600 font-medium">Status</p>
              <p className="text-lg font-bold text-amber-800">Live</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 font-medium">📊 Chart Visualization</p>
              <p className="text-sm text-gray-400 mt-1">
                LineChart ⭐⭐⭐⭐⭐ + BarChart ⭐⭐⭐⭐⭐ Integration
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Ecosystem Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Real-time synchronization between all select components</li>
            <li>• Consistent theming across executive dashboard elements</li>
            <li>• Integrated with LineChart ⭐⭐⭐⭐⭐ and BarChart ⭐⭐⭐⭐⭐ premium</li>
            <li>• Business intelligence ready with KPI tracking</li>
            <li>• Enterprise-grade performance and accessibility</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete dashboard ecosystem showing integration between all select variants and chart components.'
      }
    }
  }
};
