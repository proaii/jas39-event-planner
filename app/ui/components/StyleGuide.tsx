import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Check, X, AlertTriangle, Info } from 'lucide-react';

interface StyleGuideProps {
  onBack: () => void;
}

export function StyleGuide({ onBack }: StyleGuideProps) {
  const [inputValue, setInputValue] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

  const colorPalette = [
    { name: 'Primary', value: '#4A90E2', description: 'Main brand color for primary actions' },
    { name: 'Secondary', value: '#50E3C2', description: 'Success states and confirmations' },
    { name: 'Background', value: '#FFFFFF', description: 'Main background color' },
    { name: 'Muted Background', value: '#F4F4F4', description: 'Light background for cards and sections' },
    { name: 'Foreground', value: '#4A4A4A', description: 'Primary text color' },
    { name: 'Muted Foreground', value: '#9B9B9B', description: 'Secondary text and placeholders' },
    { name: 'Border', value: '#E5E5E5', description: 'Borders and dividers' },
    { name: 'Destructive', value: '#D0021B', description: 'Error states and dangerous actions' },
    { name: 'Warning', value: '#F5A623', description: 'Warning states and alerts' }
  ];

  const typographyExamples = [
    { element: 'H1', size: '32px', weight: 'Bold', example: 'Main Page Heading' },
    { element: 'H2', size: '24px', weight: 'Bold', example: 'Section Heading' },
    { element: 'H3', size: '20px', weight: 'Bold', example: 'Subsection Heading' },
    { element: 'Body', size: '16px', weight: 'Regular', example: 'This is body text used for paragraphs and general content.' },
    { element: 'Label', size: '14px', weight: 'Medium', example: 'Form labels and captions' }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Event Planner</h1>
              <p className="text-muted-foreground">UI Kit & Style Guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        
        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Color Palette</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorPalette.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div 
                  className="h-20 w-full" 
                  style={{ backgroundColor: color.value }}
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.value}</p>
                  <p className="text-xs text-muted-foreground">{color.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Typography</h2>
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
                      {type.element === 'Body' && <p>{type.example}</p>}
                      {type.element === 'Label' && <label className="text-sm font-medium">{type.example}</label>}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Buttons</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Primary Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default</Label>
                  <div className="flex gap-3">
                    <Button>Primary Button</Button>
                    <Button size="sm">Small</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>With Icon</Label>
                  <div className="flex gap-3">
                    <Button>
                      <Check className="w-4 h-4 mr-2" />
                      Success
                    </Button>
                    <Button>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Disabled</Label>
                  <Button disabled>Disabled Button</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary & Text Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Secondary (Outline)</Label>
                  <div className="flex gap-3">
                    <Button variant="outline">Secondary</Button>
                    <Button variant="outline" size="sm">Small</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ghost Buttons</Label>
                  <div className="flex gap-3">
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="ghost" size="sm">Small Ghost</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Destructive</Label>
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

        {/* Input Fields */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Input Fields</h2>
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
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
                    onFocus={() => setFocusedInput('text')}
                    onBlur={() => setFocusedInput('')}
                  />
                  <p className="text-xs text-muted-foreground">Helper text goes here</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focused-input">Focused State</Label>
                  <Input
                    id="focused-input"
                    type="text"
                    placeholder="This input is focused"
                    className="ring-2 ring-primary ring-offset-2"
                    onFocus={() => setFocusedInput('focused')}
                    onBlur={() => setFocusedInput('')}
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

        {/* Cards */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Cards</h2>
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

        {/* Badges & Status */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Status & Badges</h2>
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

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Usage Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-secondary">Do's</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Use primary blue (#4A90E2) for main actions and navigation</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Apply consistent 8px border radius to maintain visual harmony</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Use Inter font family for all text elements</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Maintain proper contrast ratios for accessibility</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Don'ts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Don't use colors outside the defined palette</p>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Don't mix different font families in the same interface</p>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Don't use more than 3 levels of visual hierarchy</p>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Don't place light text on light backgrounds</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}