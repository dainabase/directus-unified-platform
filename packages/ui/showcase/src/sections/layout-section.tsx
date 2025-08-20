import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Separator,
  ScrollArea,
  ScrollBar,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Resizable,
  ResizablePanel,
  ResizableHandle,
  Button,
  Badge,
  ChevronDown
} from '../components';

export const LayoutSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `Tag ${a.length - i}`
  );

  const frameworks = [
    { name: 'Next.js', description: 'The React Framework for Production' },
    { name: 'React', description: 'A JavaScript library for building UIs' },
    { name: 'Vue', description: 'The Progressive JavaScript Framework' },
    { name: 'Angular', description: 'Platform for building mobile and desktop apps' },
    { name: 'Svelte', description: 'Cybernetically enhanced web apps' },
    { name: 'Solid', description: 'Simple and performant reactivity' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Layout Components</h2>
        <p className="text-muted-foreground mb-8">
          Essential layout components for structuring your application interface with cards, separators, scroll areas, and resizable panels.
        </p>
      </div>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>Versatile container components with header, content, and footer sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card with title and description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the main content area of the card. You can place any content here.</p>
              </CardContent>
            </Card>

            {/* Card with Footer */}
            <Card>
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>Includes action buttons in the footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can have footers for actions and additional information.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>

            {/* Interactive Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interactive Card</CardTitle>
                  <Badge>New</Badge>
                </div>
                <CardDescription>Hover me for effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has hover effects and can be clicked.</p>
              </CardContent>
            </Card>

            {/* Nested Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Nested Cards</CardTitle>
                <CardDescription>Cards within cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Card className="p-3">
                  <p className="text-sm">Nested content 1</p>
                </Card>
                <Card className="p-3">
                  <p className="text-sm">Nested content 2</p>
                </Card>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Separator */}
      <Card>
        <CardHeader>
          <CardTitle>Separator</CardTitle>
          <CardDescription>Visual dividers for content sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Horizontal Separator */}
          <div>
            <h4 className="text-sm font-medium mb-4">Horizontal</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm">Content above separator</p>
                <Separator className="my-4" />
                <p className="text-sm">Content below separator</p>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div>
            <h4 className="text-sm font-medium mb-4">Vertical</h4>
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div>Blog</div>
              <Separator orientation="vertical" />
              <div>Docs</div>
              <Separator orientation="vertical" />
              <div>Source</div>
              <Separator orientation="vertical" />
              <div>Support</div>
            </div>
          </div>

          {/* Separator with Text */}
          <div>
            <h4 className="text-sm font-medium mb-4">With Label</h4>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scroll Area */}
      <Card>
        <CardHeader>
          <CardTitle>Scroll Area</CardTitle>
          <CardDescription>Customizable scrollable containers with styled scrollbars</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vertical Scroll */}
          <div>
            <h4 className="text-sm font-medium mb-4">Vertical Scroll</h4>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="space-y-4">
                {frameworks.map((framework, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-semibold">{framework.name}</h4>
                    <p className="text-sm text-muted-foreground">{framework.description}</p>
                    {i < frameworks.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Horizontal Scroll */}
          <div>
            <h4 className="text-sm font-medium mb-4">Horizontal Scroll</h4>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-4 p-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Both Scrollbars */}
          <div>
            <h4 className="text-sm font-medium mb-4">Both Directions</h4>
            <ScrollArea className="h-48 w-full rounded-md border">
              <div className="p-4">
                <table className="w-max">
                  <thead>
                    <tr>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <th key={i} className="border px-4 py-2">
                          Column {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 20 }).map((_, row) => (
                      <tr key={row}>
                        {Array.from({ length: 10 }).map((_, col) => (
                          <td key={col} className="border px-4 py-2">
                            R{row + 1} C{col + 1}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible */}
      <Card>
        <CardHeader>
          <CardTitle>Collapsible</CardTitle>
          <CardDescription>Expandable and collapsible content sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Collapsible */}
          <div>
            <h4 className="text-sm font-medium mb-4">Basic Collapsible</h4>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>View more details</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p>This is the collapsible content that appears when expanded.</p>
                    <p className="mt-2">You can place any content here including other components.</p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Nested Collapsible */}
          <div>
            <h4 className="text-sm font-medium mb-4">Nested Collapsible</h4>
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Advanced Settings</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Configure performance settings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Manage security preferences</p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Resizable Panels */}
      <Card>
        <CardHeader>
          <CardTitle>Resizable Panels</CardTitle>
          <CardDescription>Adjustable panel layouts with drag handles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <Resizable defaultSize={{ width: '100%', height: '100%' }}>
              <ResizablePanel defaultSize={25} minSize={20}>
                <div className="h-full p-4 bg-muted/50 rounded-l-md">
                  <h4 className="font-semibold mb-2">Left Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    Drag the handle to resize this panel. Min width: 20%
                  </p>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="h-full p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Center Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    This is the main content area. It adjusts automatically.
                  </p>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                <div className="h-full p-4 bg-muted/50 rounded-r-md">
                  <h4 className="font-semibold mb-2">Right Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    Another resizable panel. Min width: 20%
                  </p>
                </div>
              </ResizablePanel>
            </Resizable>
          </div>

          {/* Nested Resizable */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4">Nested Layout</h4>
            <div className="h-96 w-full">
              <Resizable defaultSize={{ width: '100%', height: '100%' }}>
                <ResizablePanel defaultSize={30} minSize={25}>
                  <div className="h-full p-4 bg-muted/50 rounded-l-md">
                    <h4 className="font-semibold">Sidebar</h4>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <Resizable direction="vertical" className="h-full">
                    <ResizablePanel defaultSize={60}>
                      <div className="h-full p-4 bg-muted/30">
                        <h4 className="font-semibold">Main Content</h4>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40}>
                      <div className="h-full p-4 bg-muted/20 rounded-br-md">
                        <h4 className="font-semibold">Footer Area</h4>
                      </div>
                    </ResizablePanel>
                  </Resizable>
                </ResizablePanel>
              </Resizable>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
