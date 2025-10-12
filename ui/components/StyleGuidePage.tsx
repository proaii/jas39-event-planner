import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Check, X, AlertTriangle, Info, User, Calendar, Settings, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface StyleGuidePageProps {
  onBack: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToEvents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToSettings: () => void;
}

export function StyleGuidePage({ 
  onBack,
  onNavigateToDashboard,
  onNavigateToEvents,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToSettings
}: StyleGuidePageProps) {
  const [inputValue, setInputValue] = useState('');

  const colorPalette = [
    { name: 'Primary Blue', value: '#4A90E2', description: 'Main brand color for primary actions and navigation' },
    { name: 'Primary Hover', value: '#3A7BC8', description: 'Darker shade for primary button hover states' },
    { name: 'Secondary Green', value: '#50E3C2', description: 'Success states and confirmations' },
    { name: 'Secondary Hover', value: 'rgba(74, 144, 226, 0.1)', description: 'Light semi-transparent blue for outline button hovers' },
    { name: 'Background', value: '#FFFFFF', description: 'Main background color' },
    { name: 'Muted Background', value: '#F4F4F4', description: 'Light background for cards and sections' },
    { name: 'Foreground', value: '#4A4A4A', description: 'Primary text color' },
    { name: 'Muted Foreground', value: '#9B9B9B', description: 'Secondary text and placeholders' },
    { name: 'Border', value: '#E5E5E5', description: 'Borders and dividers' },
    { name: 'Destructive', value: '#D0021B', description: 'Error states and dangerous actions' },
    { name: 'Warning', value: '#F5A623', description: 'Warning states and alerts' }
  ];

  const typographyExamples = [
    { element: 'H1', size: '32px', weight: 'Medium (500)', example: 'Main Page Heading' },
    { element: 'H2', size: '24px', weight: 'Medium (500)', example: 'Section Heading' },
    { element: 'H3', size: '20px', weight: 'Medium (500)', example: 'Subsection Heading' },
    { element: 'H4', size: '16px', weight: 'Medium (500)', example: 'Card titles and labels' },
    { element: 'Body', size: '16px', weight: 'Normal (400)', example: 'This is body text used for paragraphs and general content.' },
    { element: 'Button', size: '16px', weight: 'Medium (500)', example: 'Button text and interactive elements' },
    { element: 'Input', size: '16px', weight: 'Normal (400)', example: 'Form input placeholder and entered text' }
  ];

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar */}
      <Sidebar
        currentView="styleguide"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToEvents={onNavigateToEvents}
        onNavigateToTasks={onNavigateToTasks}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToSettings={onNavigateToSettings}
        onStyleGuide={() => {}} // No-op since we're already on style guide
      />
      
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8 bg-muted/30">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground">Style Guide</h1>
            <p className="text-muted-foreground">Design system for Student Event Planner</p>
          </div>
        </div>

        {/* Color Palette */}
        <section>
          <h2 className="text-foreground mb-6">Color Palette</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorPalette.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div 
                  className="h-20 w-full" 
                  style={{ backgroundColor: color.name === 'Secondary Hover' ? 'rgba(74, 144, 226, 0.1)' : color.value }}
                />
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.value}</p>
                  <p className="text-xs text-muted-foreground">{color.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-foreground mb-6">Typography</h2>
          <Card>
            <CardHeader>
              <CardTitle>Inter Font Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {typographyExamples.map((type) => (
                <div key={type.element} className="border-b border-border pb-4 last:border-b-0">
                  <div className="grid lg:grid-cols-4 gap-4 items-center">
                    <div className="lg:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground">{type.element}</p>
                      <p className="text-xs text-muted-foreground">{type.size} • {type.weight}</p>
                    </div>
                    <div className="lg:col-span-3">
                      {type.element === 'H1' && <h1>{type.example}</h1>}
                      {type.element === 'H2' && <h2>{type.example}</h2>}
                      {type.element === 'H3' && <h3>{type.example}</h3>}
                      {type.element === 'H4' && <h4>{type.example}</h4>}
                      {type.element === 'Body' && <p>{type.example}</p>}
                      {type.element === 'Button' && <Button size="sm">{type.example}</Button>}
                      {type.element === 'Input' && <Input placeholder={type.example} className="max-w-xs" />}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Button Variants with Hover States */}
        <section>
          <h2 className="text-foreground mb-6">Button Variants & Hover States</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Primary Buttons</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Solid blue buttons with darker blue hover state (#3A7BC8)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Sizes</Label>
                  <div className="flex gap-3 items-center">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>With Icons</Label>
                  <div className="flex gap-3">
                    <Button>
                      <Check className="w-4 h-4 mr-2" />
                      Success
                    </Button>
                    <Button>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Disabled State</Label>
                  <Button disabled>Disabled Button</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary & Outline Buttons</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Outline buttons with light blue background fill on hover
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Outline Variants</Label>
                  <div className="flex gap-3">
                    <Button variant="outline">Secondary</Button>
                    <Button variant="outline" size="sm">Small</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ghost Buttons</Label>
                  <div className="flex gap-3">
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Destructive Actions</Label>
                  <div className="flex gap-3">
                    <Button variant="destructive">Delete</Button>
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Inputs */}
        <section>
          <h2 className="text-foreground mb-6">Form Inputs</h2>
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text Input</Label>
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Enter text here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Helper text goes here</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focused-input">Focused State</Label>
                  <Input
                    id="focused-input"
                    type="text"
                    placeholder="This input shows focus ring"
                    className="ring-2 ring-primary ring-offset-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-input">Email Input</Label>
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input
                    id="disabled-input"
                    type="text"
                    placeholder="Disabled input"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea">Textarea</Label>
                <Textarea
                  id="textarea"
                  placeholder="Enter your message here..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Styles */}
        <section>
          <h2 className="text-foreground mb-6">Card Styles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">A simple card with header and content. Used for organizing information into digestible sections.</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Highlighted Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Cards can be highlighted with colored borders and backgrounds to draw attention.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">Cards can contain interactive elements like buttons and progress bars.</p>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">75%</span>
                </div>
                <Button size="sm" className="w-full">Action Button</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status & Badges */}
        <section>
          <h2 className="text-foreground mb-6">Status & Badges</h2>
          <Card>
            <CardHeader>
              <CardTitle>Status Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Task Status Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">To Do</Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Done</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">System Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Info className="w-3 h-3 mr-1" />
                    Info
                  </Badge>
                  <Badge className="bg-secondary text-secondary-foreground">
                    <Check className="w-3 h-3 mr-1" />
                    Success
                  </Badge>
                  <Badge className="bg-warning text-warning-foreground">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Warning
                  </Badge>
                  <Badge variant="destructive">
                    <X className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Examples */}
        <section>
          <h2 className="text-foreground mb-6">Interactive Examples</h2>
          <Card>
            <CardHeader>
              <CardTitle>Hover & Focus States</CardTitle>
              <p className="text-sm text-muted-foreground">
                Hover over buttons and click in inputs to see interactive states
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Hover for darker blue</Button>
                <Button variant="outline">Hover for light blue fill</Button>
                <Button variant="ghost">
                  <Bell className="w-4 h-4 mr-2" />
                  Ghost with icon
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Click to see focus ring" />
                <Button variant="outline" className="justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Outline with icon
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}