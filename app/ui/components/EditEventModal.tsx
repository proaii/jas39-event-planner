import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { EventColorSelector } from './EventColorSelector';
import { Calendar, MapPin, Clock, Users, Image, X, UserPlus } from 'lucide-react';
import { unsplash_tool } from '../utils/unsplash';

interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  isMultiDay?: boolean;
  location: string;
  description: string;
  progress: number;
  tasks: any[];
  members: string[];
  coverImage?: string;
  color?: string;
}

interface EditEventModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdateEvent: (eventId: string, eventData: {
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
  }) => void;
  onInviteMembers?: () => void; // Add this prop to open the invite modal
}

export function EditEventModal({ isOpen, event, onClose, onUpdateEvent, onInviteMembers }: EditEventModalProps) {
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
    color: '#E8F4FD'
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        endDate: event.endDate || '',
        time: event.time,
        endTime: event.endTime || '',
        isMultiDay: event.isMultiDay || false,
        location: event.location,
        description: event.description,
        members: [...event.members], // Copy array to avoid mutation
        coverImage: event.coverImage || '',
        color: event.color || '#E8F4FD'
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    onUpdateEvent(event.id, {
      ...formData,
      members: formData.members
    });
    onClose();
  };

  const generateCoverImage = async () => {
    if (!formData.title.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await unsplash_tool(formData.title);
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
    } catch (error) {
      console.error('Error generating cover image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const removeMember = (memberToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member !== memberToRemove)
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Edit Event</span>
          </DialogTitle>
          <DialogDescription>
            Update event details, cover image, and team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Cover Image</span>
            </Label>
            {formData.coverImage && (
              <div className="relative">
                <img 
                  src={formData.coverImage} 
                  alt="Cover preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter image URL or generate from title"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCoverImage}
                disabled={isGeneratingImage || !formData.title.trim()}
              >
                {isGeneratingImage ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          {/* Event Color Selector */}
          <EventColorSelector
            selectedColor={formData.color}
            onColorSelect={(color) => setFormData(prev => ({ ...prev, color }))}
          />

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
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
                <Label htmlFor="date" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </Label>
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
                  <Label htmlFor="endDate" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>End Date</span>
                  </Label>
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
                <Label htmlFor="time" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Start Time</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>End Time {formData.isMultiDay ? '(on last day)' : ''}</span>
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              placeholder="Enter event location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Team Members - Corrected Interactive UI */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team Members</span>
            </Label>
            
            {/* Current Members Display */}
            <div className="space-y-3">
              {formData.members.length > 0 ? (
                formData.members.map((member) => (
                  <div key={member} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{member}</p>
                        <p className="text-xs text-muted-foreground">Team Member</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                  <p className="text-xs text-muted-foreground mt-1">Add members to start collaborating</p>
                </div>
              )}
            </div>

            {/* Add Team Member Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                // Close this modal and open the invite modal
                if (onInviteMembers) {
                  onInviteMembers();
                }
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Click "Add Team Member" to search and select from available users.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}