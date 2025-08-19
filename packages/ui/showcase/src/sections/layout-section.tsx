import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ScrollArea,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Resizable,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../src/components';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Layout,
  Layers,
  Grid3x3,
  Square,
  Maximize2,
  ArrowUpDown,
  Package,
  Home,
  Settings,
  User,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  Download,
  Share2,
  Heart,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';

export const LayoutSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layout className="w-8 h-8" />
          Layout Components
        </h2>
        <p className="text-muted-foreground mt-2">
          Components for structuring and organizing content with responsive layouts and containers.
        </p>
      </div>

      {/* Cards Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Square className="w-5 h-5" />
            Cards
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards are versatile containers perfect for displaying grouped information,
                  featuring headers, content areas, and optional footers.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardFooter>
            </Card>

            {/* Interactive Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interactive Card</CardTitle>
                  <Badge>New</Badge>
                </div>
                <CardDescription>Hover for effect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-1" />
                  Like
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </CardFooter>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
                <div className="h-[80px] mt-4">
                  <div className="flex items-end gap-1 h-full">
                    {[40, 55, 35, 70, 55, 80, 65].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card */}
            <Card className="border-primary">
              <CardHeader>
                <Activity className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Performance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time insights into your application's performance metrics.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span className="font-medium">2.1 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span className="font-medium">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expandable Card */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCard('expand1')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle>Expandable Card</CardTitle>
                  {expandedCards.has('expand1') ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CardHeader>
              {expandedCards.has('expand1') && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This content is only visible when the card is expanded.
                    Click the header to toggle visibility.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Results
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Complex Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Alpha</CardTitle>
                    <CardDescription>Q4 2025 Initiative</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} className="border-2 border-background w-8 h-8">
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs">+3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Dec 31
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    12
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Container Examples */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Containers & Grids
          </h3>
          <div className="space-y-4">
            {/* Responsive Grid */}
            <div className="p-6 border rounded-lg">
              <h4 className="font-medium mb-4">Responsive Grid System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="p-4 bg-muted rounded-lg text-center font-medium"
                  >
                    Grid Item {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Flexbox Container */}
            <div className="p-6 border rounded-lg">
              <h4 className="font-medium mb-4">Flexible Container</h4>
              <div className="flex flex-wrap gap-2">
                {['Home', 'Products', 'Services', 'About', 'Contact', 'Blog', 'Careers'].map((item) => (
                  <div key={item} className="px-4 py-2 bg-primary/10 rounded-md">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Masonry-like Layout */}
            <div className="p-6 border rounded-lg">
              <h4 className="font-medium mb-4">Dynamic Heights Grid</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 h-24">Short</div>
                <div className="bg-muted rounded-lg p-4 h-40 row-span-2">Tall</div>
                <div className="bg-muted rounded-lg p-4 h-24">Short</div>
                <div className="bg-muted rounded-lg p-4 h-32">Medium</div>
                <div className="bg-muted rounded-lg p-4 h-32">Medium</div>
              </div>
            </div>
          </div>
        </div>

        {/* ScrollArea Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Scroll Areas
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vertical ScrollArea */}
            <Card>
              <CardHeader>
                <CardTitle>Vertical Scroll</CardTitle>
                <CardDescription>Scrollable content with custom scrollbar</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <p className="text-sm">
                          Scrollable item {i + 1} - Lorem ipsum dolor sit amet
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Horizontal ScrollArea */}
            <Card>
              <CardHeader>
                <CardTitle>Horizontal Scroll</CardTitle>
                <CardDescription>Side-scrolling content area</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex w-max space-x-4 p-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Card key={i} className="w-[200px]">
                        <CardHeader>
                          <CardTitle className="text-sm">Card {i + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Horizontally scrollable card content
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Collapsible Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Collapsibles
          </h3>
          <div className="space-y-4">
            {/* Basic Collapsible */}
            <Card>
              <CardContent className="pt-6">
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="w-full space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      Advanced Settings
                    </h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    Basic configuration options
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      Advanced option 1
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      Advanced option 2
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      Advanced option 3
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Multiple Collapsibles (Accordion-like) */}
            <Card>
              <CardHeader>
                <CardTitle>FAQ Section</CardTitle>
                <CardDescription>Multiple collapsible sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    question: "What is a Design System?",
                    answer: "A design system is a collection of reusable components, guided by clear standards, that can be assembled to build applications."
                  },
                  {
                    question: "Why use TypeScript?",
                    answer: "TypeScript adds static typing to JavaScript, helping catch errors early and improving code maintainability."
                  },
                  {
                    question: "How to customize themes?",
                    answer: "Themes can be customized through CSS variables, Tailwind configuration, and component variants."
                  }
                ].map((item, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50">
                      <span className="font-medium">{item.question}</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pt-2 pb-4 text-muted-foreground">
                      {item.answer}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resizable Panels */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Maximize2 className="w-5 h-5" />
            Resizable Panels
          </h3>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Resizable Layout</CardTitle>
              <CardDescription>Drag the handle to resize panels</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={25} minSize={15}>
                    <div className="h-full p-4 bg-muted/30">
                      <h4 className="font-semibold mb-4">Sidebar</h4>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                          <Home className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Mail className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={50}>
                        <div className="h-full p-4">
                          <h4 className="font-semibold mb-2">Main Content</h4>
                          <p className="text-sm text-muted-foreground">
                            This is the main content area. It can be resized both horizontally
                            and vertically using the drag handles.
                          </p>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={50}>
                        <div className="h-full p-4 bg-muted/20">
                          <h4 className="font-semibold mb-2">Console</h4>
                          <div className="font-mono text-xs space-y-1">
                            <div className="text-green-600">✓ Build completed</div>
                            <div className="text-blue-600">→ Starting development server...</div>
                            <div className="text-yellow-600">⚠ Warning: Unused variable</div>
                          </div>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={25} minSize={15}>
                    <div className="h-full p-4 bg-muted/30">
                      <h4 className="font-semibold mb-4">Properties</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium">Width</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 text-sm border rounded"
                            placeholder="auto"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Height</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 text-sm border rounded"
                            placeholder="100%"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Padding</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-2 py-1 text-sm border rounded"
                            placeholder="16px"
                          />
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complex Layout Example */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Complex Layout Example
          </h3>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Dashboard Layout</CardTitle>
              <CardDescription>Combining multiple layout components</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] flex">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/10">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Navigation</h4>
                        <Separator />
                      </div>
                      {['Dashboard', 'Analytics', 'Reports', 'Users', 'Settings'].map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          {item}
                        </Button>
                      ))}
                      
                      <Collapsible>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                          <span className="text-sm font-semibold">Projects</span>
                          <ChevronRight className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1 mt-1">
                          {['Project Alpha', 'Project Beta', 'Project Gamma'].map((project) => (
                            <Button
                              key={project}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                            >
                              {project}
                            </Button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </ScrollArea>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Overview</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Export</Button>
                        <Button size="sm">New Report</Button>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Card key={i}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Metric {i + 1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{(Math.random() * 1000).toFixed(0)}</div>
                              <p className="text-xs text-muted-foreground mt-1">
                                +{(Math.random() * 20).toFixed(1)}% from last period
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
