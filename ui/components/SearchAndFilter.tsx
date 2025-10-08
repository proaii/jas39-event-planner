import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Clock, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Checkbox } from './ui/checkbox';

interface FilterOptions {
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
  availableEventTypes?: string[];
  showEventFilters?: boolean;
  showTaskFilters?: boolean;
  placeholder?: string;
  className?: string;
  currentUser?: string;
  // Sort functionality
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
  availableEventTypes = [],
  showEventFilters = false,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Quick filter presets
  const quickFilters = [
    {
      label: 'Due Today',
      filter: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        onFiltersChange({
          ...filters,
          dateRange: { from: today, to: tomorrow }
        });
      }
    },
    {
      label: 'High Priority',
      filter: () => onFiltersChange({
        ...filters,
        priority: ['Urgent', 'High']
      })
    },
    {
      label: 'In Progress',
      filter: () => onFiltersChange({
        ...filters,
        status: ['In Progress']
      })
    },
    {
      label: 'My Tasks',
      filter: () => onFiltersChange({
        ...filters,
        assignees: [currentUser]
      })
    }
  ];

  // Count active filters
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (!value) return count;
    if (key === 'dateRange' && value.from) return count + 1;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    return count;
  }, 0);

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      assignees: [],
      dateRange: { from: null, to: null },
      eventTypes: [],
      showCompleted: true,
      showPersonalTasks: true
    });
  };

  const removeFilter = (filterType: keyof FilterOptions, value?: string) => {
    const newFilters = { ...filters };
    
    if (filterType === 'dateRange') {
      newFilters.dateRange = { from: null, to: null };
    } else if (Array.isArray(newFilters[filterType]) && value) {
      newFilters[filterType] = (newFilters[filterType] as string[]).filter(item => item !== value);
    } else if (filterType === 'showCompleted' || filterType === 'showPersonalTasks') {
      newFilters[filterType] = !newFilters[filterType];
    }
    
    onFiltersChange(newFilters);
  };

  // Keyboard shortcuts
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
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filters and Sort */}
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
        
        {/* Sort Options */}
        {showSort && onSortChange && (
          <>
            <Button
              variant={sortBy === 'dueDate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('dueDate')}
              className="h-7 text-xs"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Due Date
            </Button>
            <Button
              variant={sortBy === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('priority')}
              className="h-7 text-xs"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Priority
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('recent')}
              className="h-7 text-xs"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Recent
            </Button>
          </>
        )}
        
        {/* Advanced Filters */}
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
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Task Filters */}
              {showTaskFilters && (
                <>
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs">Status</label>
                    <div className="flex flex-wrap gap-1">
                      {(['To Do', 'In Progress', 'Done'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            const currentStatuses = filters.status || [];
                            const newStatuses = currentStatuses.includes(status)
                              ? currentStatuses.filter(s => s !== status)
                              : [...currentStatuses, status];
                            onFiltersChange({ ...filters, status: newStatuses });
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            filters.status?.includes(status)
                              ? statusColors[status]
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className="space-y-2">
                    <label className="text-xs">Priority</label>
                    <div className="flex flex-wrap gap-1">
                      {(['Urgent', 'High', 'Normal', 'Low'] as const).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => {
                            const currentPriorities = filters.priority || [];
                            const newPriorities = currentPriorities.includes(priority)
                              ? currentPriorities.filter(p => p !== priority)
                              : [...currentPriorities, priority];
                            onFiltersChange({ ...filters, priority: newPriorities });
                          }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            filters.priority?.includes(priority)
                              ? priorityColors[priority]
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assignee Filter */}
                  {availableAssignees.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs">Assignees</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {availableAssignees.map((assignee) => (
                          <label key={assignee} className="flex items-center space-x-2 text-xs">
                            <Checkbox
                              checked={filters.assignees?.includes(assignee) || false}
                              onCheckedChange={(checked) => {
                                const currentAssignees = filters.assignees || [];
                                const newAssignees = checked
                                  ? [...currentAssignees, assignee]
                                  : currentAssignees.filter(a => a !== assignee);
                                onFiltersChange({ ...filters, assignees: newAssignees });
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

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-xs">Due Date Range</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start h-8">
                      <Calendar className="w-3 h-3 mr-2" />
                      {filters.dateRange?.from && filters.dateRange?.to
                        ? `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                        : filters.dateRange?.from
                        ? `From ${filters.dateRange.from.toLocaleDateString()}`
                        : "Select date range"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: filters.dateRange?.from || undefined,
                        to: filters.dateRange?.to || undefined
                      }}
                      onSelect={(range) => {
                        onFiltersChange({
                          ...filters,
                          dateRange: {
                            from: range?.from || null,
                            to: range?.to || null
                          }
                        });
                        if (range?.to) {
                          setIsDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Toggle Options */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs">
                  <Checkbox
                    checked={filters.showCompleted ?? true}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, showCompleted: checked as boolean })
                    }
                  />
                  <span>Show completed tasks</span>
                </label>
                
                <label className="flex items-center space-x-2 text-xs">
                  <Checkbox
                    checked={filters.showPersonalTasks ?? true}
                    onCheckedChange={(checked) => 
                      onFiltersChange({ ...filters, showPersonalTasks: checked as boolean })
                    }
                  />
                  <span>Show personal tasks</span>
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.status?.map((status) => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="text-xs h-6 px-2"
            >
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
            <Badge
              key={`priority-${priority}`}
              variant="secondary"
              className="text-xs h-6 px-2"
            >
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
            <Badge
              key={`assignee-${assignee}`}
              variant="secondary"
              className="text-xs h-6 px-2"
            >
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