import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AspectRatio } from './ui/aspect-ratio';
import { EventColorSelector } from './EventColorSelector';
import { X, Upload, Image } from 'lucide-react';

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  eventData: {
    title: string;
    location: string;
    description: string;
    tasks: any[];
    coverImage?: string;
    color?: string;
  };
  createdBy: string;
  createdAt: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: {
    title: string;
    date: string;
    endDate?: string;
    time: string;
    endTime?: string;
    isMultiDay?: boolean;
    location: string;
    description: string;
    members: string[];
    coverImage?: string;
    color?: string;
    tasks?: any[];
  }) => void;
  template?: EventTemplate | null;
}

const availableMembers = [
  'Alex Johnson',
  'Sarah Chen',
  'Michael Brown',
  'Emily Davis',
  'David Wilson',
  'Lisa Garcia',
  'Tom Miller',
  'Anna Rodriguez'
];

export function CreateEventModal({ isOpen, onClose, onCreateEvent, template }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    isMultiDay: false,
    location: '',
    description: '',
    members: [] as string[],
    coverImage: '',
    color: '#E8F4FD', // Default to light blue
    tasks: [] as any[]
  });

  const [selectedMember, setSelectedMember] = useState('');

  // Pre-fill form when template is provided
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.eventData.title,
        date: '',
        endDate: '',
        time: '',
        endTime: '',
        isMultiDay: false,
        location: template.eventData.location,
        description: template.eventData.description,
        members: [],
        coverImage: template.eventData.coverImage || '',
        color: template.eventData.color || '#E8F4FD',
        tasks: template.eventData.tasks || []
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const isValid = formData.title && formData.date && formData.time &&
      (!formData.isMultiDay || (formData.isMultiDay && formData.endDate)) &&
      (!formData.isMultiDay || formData.endTime);
    
    if (isValid) {
      onCreateEvent(formData);
      setFormData({
        title: '',
        date: '',
        endDate: '',
        time: '',
        endTime: '',
        isMultiDay: false,
        location: '',
        description: '',
        members: [],
        coverImage: '',
        color: '#E8F4FD',
        tasks: []
      });
      setSelectedMember('');
    }
  };

  const addMember = (member: string) => {
    if (member && !formData.members.includes(member)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
      setSelectedMember('');
    }
  };

  const removeMember = (memberToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member !== memberToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event and invite team members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>
          </div>

          {/* Date and Time Period Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMultiDay"
                checked={formData.isMultiDay}
                onChange={(e) => {
                  const isMultiDay = e.target.checked;
                  setFormData(prev => ({ 
                    ...prev, 
                    isMultiDay,
                    endDate: isMultiDay ? prev.endDate : '',
                    endTime: isMultiDay ? prev.endTime : ''
                  }));
                }}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label htmlFor="isMultiDay" className="text-sm">Multi-day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Start Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              
              {formData.isMultiDay && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.date}
                    required={formData.isMultiDay}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Start Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  End Time {formData.isMultiDay ? '(on last day)' : '*'}
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required={!formData.isMultiDay}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Event description..."
              rows={3}
            />
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-3">
            <Label>Cover Image (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
              {formData.coverImage ? (
                <div className="space-y-4">
                  <div className="w-full max-w-md mx-auto">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Add a cover image</p>
                    <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // For demo purposes, we'll set placeholder images
                      const images = [
                        'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NTg5MDQ2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
                        'https://images.unsplash.com/photo-1758270704840-0ac001215b55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGdyb3VwJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU4ODgxOTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
                        'https://images.unsplash.com/photo-1561886362-a2b38ce83470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBoYWNrYXRob24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU4OTc4MDMzfDA&ixlib=rb-4.1.0&q=80&w=1080'
                      ];
                      const randomImage = images[Math.floor(Math.random() * images.length)];
                      setFormData(prev => ({ ...prev, coverImage: randomImage }));
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Event Color Selector */}
          <EventColorSelector
            selectedColor={formData.color}
            onColorSelect={(color) => setFormData(prev => ({ ...prev, color }))}
          />

          <div className="space-y-3">
            <Label>Team Members</Label>
            <div className="flex gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers
                    .filter(member => !formData.members.includes(member))
                    .map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => addMember(selectedMember)}
                disabled={!selectedMember}
              >
                Add
              </Button>
            </div>
            
            {formData.members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.members.map((member) => (
                  <Badge key={member} variant="secondary" className="px-3 py-1">
                    {member}
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}