// 🎨 ADVANCED COMPONENTS SECTION - Enterprise-Grade Components
// DataGrid, Calendar, Chart, ColorPicker, CommandPalette, Timeline, and more

import React, { useState, useCallback, useEffect } from 'react';
import {
  DataGrid,
  DataGridAdvanced,
  Calendar,
  Chart,
  ColorPicker,
  CommandPalette,
  ErrorBoundary,
  Timeline,
  TextAnimations,
  Button,
  Badge,
  Card,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Slider,
  Label,
  Input,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertDescription,
  toast,
} from '../../src';

export const AdvancedSection = () => {
  // States for interactive demos
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [commandOpen, setCommandOpen] = useState(false);
  const [gridView, setGridView] = useState('standard');
  const [chartType, setChartType] = useState('bar');
  const [errorTrigger, setErrorTrigger] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(true);

  // Sample data for DataGrid
  const sampleData = [
    { id: 1, name: 'Enterprise Cloud Platform', status: 'Active', revenue: 2500000, growth: 32, region: 'North America', priority: 'High' },
    { id: 2, name: 'AI Analytics Suite', status: 'Beta', revenue: 1800000, growth: 128, region: 'Europe', priority: 'Critical' },
    { id: 3, name: 'Security Operations Center', status: 'Active', revenue: 3200000, growth: 15, region: 'Asia Pacific', priority: 'Medium' },
    { id: 4, name: 'Quantum Computing Lab', status: 'Research', revenue: 500000, growth: 450, region: 'Global', priority: 'High' },
    { id: 5, name: 'IoT Management System', status: 'Active', revenue: 2100000, growth: 67, region: 'Europe', priority: 'Low' },
    { id: 6, name: 'Blockchain Services', status: 'Beta', revenue: 900000, growth: 210, region: 'North America', priority: 'High' },
    { id: 7, name: 'Edge Computing Network', status: 'Active', revenue: 1600000, growth: 89, region: 'Asia Pacific', priority: 'Critical' },
    { id: 8, name: 'ML Operations Platform', status: 'Active', revenue: 2800000, growth: 56, region: 'Global', priority: 'High' },
  ];

  // Chart data
  const chartData = {
    bar: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue (M)',
        data: [12, 19, 15, 25],
        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
      }]
    },
    line: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Growth %',
        data: [65, 78, 90, 81, 92, 105],
        borderColor: '#3B82F6',
        tension: 0.4,
      }]
    },
    pie: {
      labels: ['Product A', 'Product B', 'Product C', 'Product D'],
      datasets: [{
        data: [30, 25, 20, 25],
        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
      }]
    }
  };

  // Timeline events
  const timelineEvents = [
    { id: 1, title: 'Project Kickoff', date: '2025-01-15', status: 'completed', description: 'Initial planning and team assembly' },
    { id: 2, title: 'Phase 1 Development', date: '2025-02-01', status: 'completed', description: 'Core infrastructure setup' },
    { id: 3, title: 'Alpha Release', date: '2025-03-15', status: 'completed', description: 'Internal testing phase' },
    { id: 4, title: 'Beta Launch', date: '2025-05-01', status: 'in-progress', description: 'Public beta testing' },
    { id: 5, title: 'Production Release', date: '2025-06-15', status: 'upcoming', description: 'Full production deployment' },
    { id: 6, title: 'Scale Phase', date: '2025-08-01', status: 'upcoming', description: 'Global expansion' },
  ];

  // Command palette commands
  const commands = [
    { id: 'new-project', label: 'Create New Project', icon: '➕', shortcut: '⌘N' },
    { id: 'search', label: 'Search Everything', icon: '🔍', shortcut: '⌘K' },
    { id: 'deploy', label: 'Deploy to Production', icon: '🚀', shortcut: '⌘D' },
    { id: 'analytics', label: 'Open Analytics', icon: '📊', shortcut: '⌘A' },
    { id: 'settings', label: 'System Settings', icon: '⚙️', shortcut: '⌘,' },
    { id: 'help', label: 'Help & Documentation', icon: '📚', shortcut: '⌘?' },
  ];

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
          Advanced Components
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Enterprise-grade components for complex applications. Data visualization, advanced grids, 
          calendars, color systems, command interfaces, error handling, and animated experiences.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">9</div>
            <div className="text-sm text-gray-500">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">25+</div>
            <div className="text-sm text-gray-500">Variants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">∞</div>
            <div className="text-sm text-gray-500">Possibilities</div>
          </div>
        </div>
      </div>

      {/* DataGrid Section */}
      <Card className="p-8 border-2 border-purple-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">📊 DataGrid Components</h3>
          <p className="text-gray-600">Powerful data tables with sorting, filtering, and advanced features</p>
        </div>

        <Tabs defaultValue="standard" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="standard">Standard Grid</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Grid</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">Standard DataGrid</Badge>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">Export CSV</Button>
                <Button size="sm" variant="outline">Print</Button>
                <Button size="sm">Add Row</Button>
              </div>
            </div>
            
            <DataGrid 
              data={sampleData}
              columns={[
                { key: 'name', label: 'Project Name', sortable: true },
                { key: 'status', label: 'Status', sortable: true, 
                  render: (value) => (
                    <Badge variant={value === 'Active' ? 'success' : value === 'Beta' ? 'warning' : 'secondary'}>
                      {value}
                    </Badge>
                  )
                },
                { key: 'revenue', label: 'Revenue', sortable: true, 
                  render: (value) => `$${(value / 1000000).toFixed(1)}M`
                },
                { key: 'growth', label: 'Growth %', sortable: true,
                  render: (value) => (
                    <span className={value > 50 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      +{value}%
                    </span>
                  )
                },
                { key: 'region', label: 'Region' },
                { key: 'priority', label: 'Priority',
                  render: (value) => (
                    <Badge variant={
                      value === 'Critical' ? 'destructive' : 
                      value === 'High' ? 'default' : 
                      value === 'Medium' ? 'secondary' : 'outline'
                    }>
                      {value}
                    </Badge>
                  )
                },
              ]}
              pageSize={5}
              enableSearch
              enablePagination
              enableSelection
              onRowClick={(row) => toast.success(`Selected: ${row.name}`)}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="default">Advanced DataGrid with AI Features</Badge>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <span className="mr-2">🤖</span> AI Insights
                </Button>
                <Button size="sm" variant="outline">Bulk Actions</Button>
                <Button size="sm">Configure</Button>
              </div>
            </div>
            
            <DataGridAdvanced
              data={sampleData}
              columns={[
                { key: 'name', label: 'Project Name', editable: true, width: 200 },
                { key: 'status', label: 'Status', filterable: true, width: 120 },
                { key: 'revenue', label: 'Revenue', aggregation: 'sum', width: 150 },
                { key: 'growth', label: 'Growth %', aggregation: 'average', width: 100 },
                { key: 'region', label: 'Region', groupable: true, width: 150 },
                { key: 'priority', label: 'Priority', filterable: true, width: 100 },
              ]}
              enableGrouping
              enableColumnResize
              enableRowReorder
              enableExport
              enableVirtualization
              enableAIAssist
              aiPrompt="Analyze revenue trends and suggest optimizations"
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Calendar & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card className="p-6 border-2 border-blue-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">📅 Calendar Component</h3>
            <p className="text-sm text-gray-600">Full-featured calendar with events</p>
          </div>
          
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            events={[
              { date: '2025-08-20', title: 'Product Launch', color: 'blue' },
              { date: '2025-08-22', title: 'Team Meeting', color: 'green' },
              { date: '2025-08-25', title: 'Conference', color: 'purple' },
              { date: '2025-08-28', title: 'Sprint Review', color: 'orange' },
            ]}
            enableMonthView
            enableWeekView
            enableDayView
            enableEventCreation
            onEventClick={(event) => toast.info(`Event: ${event.title}`)}
          />
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-6 border-2 border-emerald-100">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">📈 Chart Component</h3>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600">Interactive data visualization</p>
          </div>
          
          <Chart
            type={chartType}
            data={chartData[chartType]}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Business Metrics' },
              },
              animation: { duration: 1000 },
            }}
            height={300}
          />
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" onClick={() => setChartType('bar')}>
              Bar View
            </Button>
            <Button size="sm" variant="outline" onClick={() => setChartType('line')}>
              Line View
            </Button>
            <Button size="sm" variant="outline" onClick={() => setChartType('pie')}>
              Pie View
            </Button>
          </div>
        </Card>
      </div>

      {/* ColorPicker & CommandPalette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ColorPicker */}
        <Card className="p-6 border-2 border-pink-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">🎨 ColorPicker Component</h3>
            <p className="text-sm text-gray-600">Advanced color selection with presets</p>
          </div>
          
          <div className="space-y-6">
            <ColorPicker
              value={selectedColor}
              onChange={setSelectedColor}
              showPresets
              presets={[
                '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
                '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
              ]}
              showAlpha
              showHistory
              format="hex"
            />
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: selectedColor }}>
              <p className="text-white font-medium text-center">
                Selected: {selectedColor}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setSelectedColor('#3B82F6')}>
                Reset to Blue
              </Button>
              <Button variant="outline" onClick={() => {
                const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                setSelectedColor(randomColor);
              }}>
                Random Color
              </Button>
            </div>
          </div>
        </Card>

        {/* CommandPalette */}
        <Card className="p-6 border-2 border-indigo-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">⌘ CommandPalette Component</h3>
            <p className="text-sm text-gray-600">Quick actions and navigation</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setCommandOpen(true)}
            >
              <span>Open Command Palette</span>
              <kbd className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded">⌘K</kbd>
            </Button>
            
            <CommandPalette
              open={commandOpen}
              onOpenChange={setCommandOpen}
              commands={commands}
              onSelect={(command) => {
                toast.success(`Executed: ${command.label}`);
                setCommandOpen(false);
              }}
              placeholder="Type a command or search..."
              showRecent
              showCategories
            />
            
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-indigo-900 mb-2">Available Commands:</h4>
              <ul className="space-y-2 text-sm">
                {commands.map(cmd => (
                  <li key={cmd.id} className="flex items-center justify-between text-indigo-700">
                    <span>{cmd.icon} {cmd.label}</span>
                    <kbd className="px-2 py-1 text-xs bg-white rounded">{cmd.shortcut}</kbd>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* ErrorBoundary Demo */}
      <Card className="p-8 border-2 border-red-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🛡️ ErrorBoundary Component</h3>
          <p className="text-gray-600">Graceful error handling and recovery</p>
        </div>
        
        <ErrorBoundary
          fallback={(error, retry) => (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Something went wrong!</p>
                  <p className="text-sm">{error.message}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={retry}>Try Again</Button>
                    <Button size="sm" variant="outline">Report Issue</Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          onError={(error) => console.error('Error caught:', error)}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Switch 
                checked={!errorTrigger} 
                onCheckedChange={(checked) => setErrorTrigger(!checked)}
              />
              <Label>Component Status: {errorTrigger ? 'Error State' : 'Normal State'}</Label>
            </div>
            
            {errorTrigger ? (
              <div>
                {/* This would throw an error in real scenario */}
                <Alert variant="destructive">
                  <AlertDescription>
                    Error simulation active - ErrorBoundary is handling this gracefully
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="p-6 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  ✅ Component running normally. Toggle the switch to simulate an error.
                </p>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </Card>

      {/* Timeline Component */}
      <Card className="p-8 border-2 border-amber-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">📍 Timeline Component</h3>
          <p className="text-gray-600">Project milestones and event tracking</p>
        </div>
        
        <Timeline
          events={timelineEvents}
          orientation="vertical"
          showConnectors
          animated
          renderEvent={(event) => (
            <div className="flex items-start space-x-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${
                event.status === 'completed' ? 'bg-green-500' :
                event.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                'bg-gray-300'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <Badge variant={
                    event.status === 'completed' ? 'success' :
                    event.status === 'in-progress' ? 'default' : 'secondary'
                  } className="text-xs">
                    {event.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            </div>
          )}
        />
      </Card>

      {/* TextAnimations Component */}
      <Card className="p-8 border-2 border-teal-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">✨ TextAnimations Component</h3>
          <p className="text-gray-600">Engaging text effects and animations</p>
        </div>
        
        <div className="space-y-8">
          {/* Animation Speed Control */}
          <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
            <Label>Animation Speed:</Label>
            <Slider
              value={[animationSpeed]}
              onValueChange={([value]) => setAnimationSpeed(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{animationSpeed}x</span>
          </div>
          
          {/* Text Animation Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextAnimations
                text="Fade In Animation"
                animation="fadeIn"
                duration={1000 / animationSpeed}
                className="text-2xl font-bold text-gray-900"
              />
              
              <TextAnimations
                text="Slide In From Left"
                animation="slideInLeft"
                duration={1000 / animationSpeed}
                className="text-xl font-semibold text-blue-600"
              />
              
              <TextAnimations
                text="Bounce In Effect"
                animation="bounceIn"
                duration={1000 / animationSpeed}
                className="text-lg font-medium text-purple-600"
              />
              
              <TextAnimations
                text="Typing Effect..."
                animation="typewriter"
                duration={2000 / animationSpeed}
                className="text-lg font-mono text-gray-700"
              />
            </div>
            
            <div className="space-y-4">
              <TextAnimations
                text="Gradient Animation"
                animation="gradient"
                duration={3000 / animationSpeed}
                className="text-2xl font-bold"
                gradient={['#3B82F6', '#8B5CF6', '#EC4899']}
              />
              
              <TextAnimations
                text="Pulse Animation"
                animation="pulse"
                duration={1500 / animationSpeed}
                className="text-xl font-semibold text-red-600"
              />
              
              <TextAnimations
                text="Wave Animation"
                animation="wave"
                duration={2000 / animationSpeed}
                className="text-lg font-medium text-teal-600"
              />
              
              <TextAnimations
                text="3D Rotation"
                animation="rotate3D"
                duration={2000 / animationSpeed}
                className="text-lg font-bold text-indigo-600"
              />
            </div>
          </div>
          
          {/* Interactive Demo */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <TextAnimations
              text="🚀 Interactive Text Animation Playground"
              animation="slideInUp"
              duration={1500 / animationSpeed}
              className="text-2xl font-bold text-center mb-4"
              onAnimationComplete={() => console.log('Animation completed!')}
            />
            
            <div className="grid grid-cols-3 gap-3">
              {['fadeIn', 'slideIn', 'bounce', 'typewriter', 'gradient', 'pulse'].map((anim) => (
                <Button
                  key={anim}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Trigger re-render with new animation
                    const element = document.querySelector('.demo-text');
                    if (element) {
                      element.style.animation = 'none';
                      setTimeout(() => {
                        element.style.animation = '';
                      }, 10);
                    }
                  }}
                >
                  {anim}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Section */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-2 border-purple-200">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Advanced Components Complete!
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You've explored our most sophisticated components designed for enterprise applications. 
            These components provide the building blocks for complex, data-driven interfaces.
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '📊', label: 'DataGrid & DataGridAdvanced', desc: 'Powerful data tables' },
              { icon: '📅', label: 'Calendar', desc: 'Event management' },
              { icon: '📈', label: 'Chart', desc: 'Data visualization' },
              { icon: '🎨', label: 'ColorPicker', desc: 'Color selection' },
              { icon: '⌘', label: 'CommandPalette', desc: 'Quick actions' },
              { icon: '🛡️', label: 'ErrorBoundary', desc: 'Error handling' },
              { icon: '📍', label: 'Timeline', desc: 'Event tracking' },
              { icon: '✨', label: 'TextAnimations', desc: 'Animated text' },
              { icon: '🚀', label: 'And More', desc: 'Infinite possibilities' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-sm text-gray-900">{item.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Next Steps */}
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              View Documentation
            </Button>
            <Button size="lg" variant="outline">
              Download Components
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};