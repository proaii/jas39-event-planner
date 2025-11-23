"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit3, Trash2, Calendar, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatEventDateRange, isCurrentlyActive, calculateDuration, extractDateAndTime } from '@/lib/timeUtils';
import { Event, Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface EventCardProps {
  event?: Event; 
  tasks?: Task[];
  onClick: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onAddTask?: (eventId: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function EventCard({ event, tasks = [], onClick, onEdit, onDelete, onAddTask, isLoading, error }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="w-full p-4">
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </Card>
    );
  }

  // Error display
  if (error || !event) {
    return (
      <Card className="w-full p-4 text-center text-red-500">
        {error ?? 'Failed to load event.'}
      </Card>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase();

  const { date: startDate, time: startTime } = extractDateAndTime(event.startAt);
  const { date: endDate, time: endTime } = extractDateAndTime(event.endAt);

  const eventDateRange = formatEventDateRange({
    date: startDate || '',
    time: startTime || '',
    endDate: endDate || undefined,
    endTime: endTime || undefined,
    isMultiDay: startDate !== endDate,
  });

  const isActive = isCurrentlyActive({
    date: startDate || '',
    endDate: endDate || undefined,
    time: startTime || '',
    endTime: endTime || undefined,
  });

  const duration = calculateDuration(event.startAt || '', event.endAt || undefined, startTime, endTime);

  const eventTasks = tasks.filter(task => task.eventId === event.eventId);
  const totalTasks = eventTasks.length;
  const completedTasks = eventTasks.filter(task => task.taskStatus === 'Done').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('[data-dropdown-trigger]')) return;
    onClick(event.eventId);
  };

  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm overflow-hidden relative flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full">
        <AspectRatio ratio={16 / 9}>
          {event.coverImageUri ? (
            <ImageWithFallback
              src={event.coverImageUri}
              alt={event.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `hsl(var(--chart-${event.color + 1}))` }}
            >
              <Calendar className="w-12 h-12 text-primary/60" />
            </div>
          )}
        </AspectRatio>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        {(isHovered || isDropdownOpen) && (
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-transparent hover:bg-white/20 text-white transition-colors"
                  data-dropdown-trigger
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onClick(event.eventId)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(event.eventId)} className="cursor-pointer">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                )}
                {onAddTask && (
                  <DropdownMenuItem onClick={() => onAddTask(event.eventId)} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)} 
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-foreground line-clamp-2">
            {event.title}
          </h3>
          
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 text-sm ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              <Clock className="w-4 h-4" />
              <span>{eventDateRange}</span>
              {isActive && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Active
                </Badge>
              )}
            </div>
            
            {duration && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Duration: {duration}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {event.members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {event.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{event.members.length - 4}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {event.members.length} member{event.members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {totalTasks > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Task Progress</span>
                </div>
                <span className="font-medium text-foreground">
                  {completedTasks}/{totalTasks}
                </span>
              </div>

              
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: '#4A90E2',
                  }}
                />
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-medium ${
                    progressPercentage === 100 ? 'text-[#4A90E2]' : 'text-muted-foreground'
                  }`}
                >
                  {progressPercentage}% complete
                </span>
              </div>
            </div>
          )}



        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone and will permanently remove the event and all its associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (onDelete) {
                  onDelete(event.eventId);
                }
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}