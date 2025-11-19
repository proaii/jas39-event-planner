"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Clock, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterOptions {
  status?: ('To Do' | 'In Progress' | 'Done')[];
  priority?: ('Urgent' | 'High' | 'Normal' | 'Low')[];
  assignees?: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  eventTypes?: string[];
  showCompleted?: boolean;
  showPersonalTasks?: boolean;
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableAssignees?: string[];
  showTaskFilters?: boolean;
  placeholder?: string;
  className?: string;
  currentUser?: string;
  sortBy?: 'dueDate' | 'priority' | 'recent';
  onSortChange?: (sortBy: 'dueDate' | 'priority' | 'recent') => void;
  showSort?: boolean;
}

const priorityColors = {
  'Urgent': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Normal': 'bg-blue-100 text-blue-800 border-blue-200',
  'Low': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Done': 'bg-green-100 text-green-800 border-green-200'
};

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  availableAssignees = [],
  showTaskFilters = true,
  placeholder = "Search tasks and events...",
  className = "",
  currentUser = "Alex Johnson",
  sortBy = 'dueDate',
  onSortChange,
  showSort = false
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(filters);
    }
  }, [isFilterOpen, filters]);

  const quickFilters = [
    {
      label: 'Due Today',
      filter: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        onFiltersChange({ ...filters, dateRange: { from: today, to: tomorrow } });
      }
    },
    {
      label: 'High Priority',
      filter: () => onFiltersChange({ ...filters, priority: ['Urgent', 'High'] })
    },
    {
      label: 'In Progress',
      filter: () => onFiltersChange({ ...filters, status: ['In Progress'] })
    },
    {
      label: 'My Tasks',
      filter: () => onFiltersChange({ ...filters, assignees: [currentUser] })
    }
  ];

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (!value) return count;
    if (key === 'dateRange' && value.from) return count + 1;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    return count;
  }, 0);

  const clearAllFilters = () => {
    const cleared = {
      status: [],
      priority: [],
      assignees: [],
      dateRange: { from: null, to: null },
      eventTypes: [],
      showCompleted: true,
      showPersonalTasks: true
    };
    setTempFilters(cleared);
    onFiltersChange(cleared);
  };

  const removeFilter = (filterType: keyof FilterOptions, value?: string) => {
    const newFilters = { ...filters };
    switch (filterType) {
      case "status":
        newFilters.status = newFilters.status?.filter((item) => item !== value);
        break;
      case "priority":
        newFilters.priority = newFilters.priority?.filter((item) => item !== value);
        break;
      case "assignees":
        newFilters.assignees = newFilters.assignees?.filter((item) => item !== value);
        break;
      case "dateRange":
        newFilters.dateRange = { from: null, to: null };
        break;
      case "showCompleted":
        newFilters.showCompleted = !newFilters.showCompleted;
        break;
      case "showPersonalTasks":
        newFilters.showPersonalTasks = !newFilters.showPersonalTasks;
        break;
    }
    onFiltersChange(newFilters);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && searchInputRef.current === document.activeElement) {
        searchInputRef.current?.blur();
        onSearchChange('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((quickFilter, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={quickFilter.filter}
            className="h-7 text-xs"
          >
            {quickFilter.label}
          </Button>
        ))}

        {showSort && onSortChange && (
          <>
            {(['dueDate', 'priority', 'recent'] as const).map((type) => (
              <Button
                key={type}
                variant={sortBy === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSortChange(type)}
                className="h-7 text-xs"
              >
                <ArrowUpDown className="w-3 h-3 mr-1" />
                {type === 'dueDate' ? 'Due Date' : type === 'priority' ? 'Priority' : 'Recent'}
              </Button>
            ))}
          </>
        )}

        {/* Filters Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Header with Clear All */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>

              {/* Status */}
              {showTaskFilters && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs">Status</label>
                    <div className="flex flex-wrap gap-1">
                      {(['To Do', 'In Progress', 'Done'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            const current = tempFilters.status || [];
                            const newStatuses = current.includes(status)
                              ? current.filter(s => s !== status)
                              : [...current, status];
                            const updated = { ...tempFilters, status: newStatuses };
                            setTempFilters(updated);
                            onFiltersChange(updated);
                          }}
                          className={`text-xs text-background px-2 py-1 rounded border transition-colors ${
                            tempFilters.status?.includes(status)
                              ? statusColors[status]
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs">Priority</label>
                    <div className="flex flex-wrap gap-1">
                      {(['Urgent', 'High', 'Normal', 'Low'] as const).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => {
                            const current = tempFilters.priority || [];
                            const newPriorities = current.includes(priority)
                              ? current.filter(p => p !== priority)
                              : [...current, priority];
                            const updated = { ...tempFilters, priority: newPriorities };
                            setTempFilters(updated);
                            onFiltersChange(updated);
                          }}
                          className={`text-xs text-background px-2 py-1 rounded border transition-colors ${
                            tempFilters.priority?.includes(priority)
                              ? priorityColors[priority]
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assignees */}
                  {availableAssignees.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs">Assignees</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {availableAssignees.map((assignee) => (
                          <label key={assignee} className="flex items-center space-x-2 text-xs">
                            <Checkbox
                              checked={tempFilters.assignees?.includes(assignee) || false}
                              onCheckedChange={(checked) => {
                                const current = tempFilters.assignees || [];
                                const newAssignees = checked
                                  ? [...current, assignee]
                                  : current.filter(a => a !== assignee);
                                const updated = { ...tempFilters, assignees: newAssignees };
                                setTempFilters(updated);
                                onFiltersChange(updated);
                              }}
                            />
                            <span>{assignee}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-xs">Due Date Range</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                      <Calendar className="w-3 h-3 mr-2" />
                      {tempFilters.dateRange?.from && tempFilters.dateRange?.to
                        ? `${tempFilters.dateRange.from.toLocaleDateString()} - ${tempFilters.dateRange.to.toLocaleDateString()}`
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: tempFilters.dateRange?.from || undefined,
                        to: tempFilters.dateRange?.to || undefined
                      }}
                      onSelect={(range) => {
                        const updated = {
                          ...tempFilters,
                          dateRange: {
                            from: range?.from || null,
                            to: range?.to || null
                          }
                        };
                        setTempFilters(updated);
                        onFiltersChange(updated);
                        if (range?.to) setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs">
                  <Checkbox
                    checked={tempFilters.showCompleted ?? true}
                    onCheckedChange={(checked) => {
                      const updated = { ...tempFilters, showCompleted: checked as boolean };
                      setTempFilters(updated);
                      onFiltersChange(updated);
                    }}
                  />
                  <span>Show completed tasks</span>
                </label>

                <label className="flex items-center space-x-2 text-xs">
                  <Checkbox
                    checked={tempFilters.showPersonalTasks ?? true}
                    onCheckedChange={(checked) => {
                      const updated = { ...tempFilters, showPersonalTasks: checked as boolean };
                      setTempFilters(updated);
                      onFiltersChange(updated);
                    }}
                  />
                  <span>Show personal tasks</span>
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.status?.map((status) => (
            <Badge key={`status-${status}`} variant="secondary" className="text-xs h-6 px-2">
              Status: {status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('status', status)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          ))}

          {filters.priority?.map((priority) => (
            <Badge key={`priority-${priority}`} variant="secondary" className="text-xs h-6 px-2">
              {priority} Priority
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('priority', priority)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          ))}

          {filters.assignees?.map((assignee) => (
            <Badge key={`assignee-${assignee}`} variant="secondary" className="text-xs h-6 px-2">
              <User className="w-2 h-2 mr-1" />
              {assignee}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('assignees', assignee)}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          ))}

          {filters.dateRange?.from && (
            <Badge variant="secondary" className="text-xs h-6 px-2">
              <Clock className="w-2 h-2 mr-1" />
              Date Range
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter('dateRange')}
                className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
              >
                <X className="w-2 h-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
