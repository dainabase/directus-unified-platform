import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommandPalette,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  ErrorBoundary,
  ColorPicker,
  Rating,
  Stepper,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TextAnimations,
  Button,
  Badge,
  Search,
  Calendar,
  Calculator,
  CreditCard,
  Settings,
  User,
  Mail,
  FileText,
  HelpCircle,
  Clock,
  Check
} from '../components';

export const AdvancedSection = () => {
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [rating, setRating] = useState(3);
  const [currentStep, setCurrentStep] = useState(1);
  const [commandOpen, setCommandOpen] = useState(false);

  const steps = [
    { title: 'Account', description: 'Create your account' },
    { title: 'Profile', description: 'Complete your profile' },
    { title: 'Settings', description: 'Configure preferences' },
    { title: 'Review', description: 'Review and confirm' },
    { title: 'Complete', description: 'Setup complete' }
  ];

  const timelineEvents = [
    {
      title: 'Project Started',
      description: 'Initial setup and planning phase',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      title: 'Design Review',
      description: 'UI/UX review with stakeholders',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      title: 'Development',
      description: 'Core feature implementation',
      time: 'In progress',
      status: 'active'
    },
    {
      title: 'Testing',
      description: 'QA and user acceptance testing',
      time: 'Upcoming',
      status: 'pending'
    },
    {
      title: 'Deployment',
      description: 'Production release',
      time: 'Scheduled',
      status: 'pending'
    }
  ];

  const animations = [
    { text: 'Fade In Animation', type: 'fadeIn' },
    { text: 'Slide Up Animation', type: 'slideUp' },
    { text: 'Type Writer Effect', type: 'typewriter' },
    { text: 'Glitch Text Effect', type: 'glitch' },
    { text: 'Wave Animation', type: 'wave' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Advanced Components</h2>
        <p className="text-muted-foreground mb-8">
          Complex and feature-rich components for advanced use cases including command palettes, color pickers, timelines, and more.
        </p>
      </div>

      {/* Command Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Command Palette</CardTitle>
          <CardDescription>Searchable command menu for quick actions and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCommandOpen(!commandOpen)}
          >
            <Search className="mr-2 h-4 w-4" />
            Press to open command palette...
          </Button>
          
          {commandOpen && (
            <div className="mt-4 border rounded-lg">
              <CommandPalette>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Search Users</span>
                    </CommandItem>
                    <CommandItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Settings">
                    <CommandItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>General Settings</span>
                    </CommandItem>
                    <CommandItem>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Email Preferences</span>
                    </CommandItem>
                    <CommandItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Documentation</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Help">
                    <CommandItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support Center</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandPalette>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Color Picker</CardTitle>
          <CardDescription>Advanced color selection with various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Color Selection</h4>
              <ColorPicker 
                value={selectedColor} 
                onChange={setSelectedColor}
                className="w-full"
              />
              <div className="mt-4 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Selected Color:</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-md border"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div>
                    <p className="font-mono text-sm">{selectedColor}</p>
                    <p className="text-xs text-muted-foreground">HEX Format</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-4">Preset Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#000000', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    className="w-full aspect-square rounded-md border-2 transition-all hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Rating</CardTitle>
          <CardDescription>Star rating component for feedback and reviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Interactive Rating</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Rating value={rating} onChange={setRating} max={5} />
                <span className="text-sm text-muted-foreground">{rating} out of 5</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Rating value={4.5} max={5} readonly />
                <span className="text-sm text-muted-foreground">4.5 (Read-only)</span>
              </div>

              <div className="flex items-center gap-4">
                <Rating value={3} max={10} size="sm" />
                <span className="text-sm text-muted-foreground">3 out of 10 (Small)</span>
              </div>

              <div className="flex items-center gap-4">
                <Rating value={4} max={5} size="lg" />
                <span className="text-sm text-muted-foreground">Large size</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Stepper</CardTitle>
          <CardDescription>Multi-step process indicator with navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper activeStep={currentStep} steps={steps} />
          
          <div className="mt-8 p-6 border rounded-lg">
            <h4 className="font-semibold mb-2">{steps[currentStep - 1].title}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {steps[currentStep - 1].description}
            </p>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === steps.length}
              >
                {currentStep === steps.length ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Alternative Vertical Stepper */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-4">Vertical Variant</h4>
            <Stepper 
              activeStep={currentStep} 
              steps={steps} 
              orientation="vertical"
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Visual representation of chronological events</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline>
            {timelineEvents.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineConnector />
                <TimelineDot 
                  className={
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'active' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }
                >
                  {event.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                  {event.status === 'active' && <Clock className="h-3 w-3 text-white animate-pulse" />}
                </TimelineDot>
                <TimelineContent>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    {event.status === 'active' && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>

      {/* Text Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Text Animations</CardTitle>
          <CardDescription>Dynamic text effects and animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {animations.map((animation) => (
            <div key={animation.type} className="space-y-2">
              <h4 className="text-sm font-medium">{animation.type}</h4>
              <TextAnimations 
                text={animation.text} 
                animation={animation.type}
                className="text-2xl font-bold"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Error Boundary */}
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary</CardTitle>
          <CardDescription>Graceful error handling for component failures</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBoundary
            fallback={
              <div className="p-6 border rounded-lg bg-destructive/10">
                <h4 className="font-semibold text-destructive mb-2">Something went wrong!</h4>
                <p className="text-sm text-muted-foreground">
                  This is a custom error boundary fallback UI. In production, this would catch and handle component errors gracefully.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            }
          >
            <div className="p-6 border rounded-lg">
              <h4 className="font-semibold mb-2">Protected Content</h4>
              <p className="text-sm text-muted-foreground">
                This content is wrapped in an Error Boundary. If an error occurs, it will be caught and handled gracefully without crashing the entire application.
              </p>
            </div>
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Complex Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complex Integration</CardTitle>
          <CardDescription>Example of multiple advanced components working together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Project Status</CardTitle>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Stepper 
                  activeStep={3} 
                  steps={[
                    { title: 'Planning' },
                    { title: 'Design' },
                    { title: 'Development' },
                    { title: 'Testing' },
                    { title: 'Launch' }
                  ]}
                  size="sm"
                />
                <div className="mt-4 flex items-center gap-2">
                  <Rating value={4} max={5} size="sm" readonly />
                  <span className="text-xs text-muted-foreground">Team Performance</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Update
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
