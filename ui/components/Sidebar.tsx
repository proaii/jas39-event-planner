import React, { useState } from 'react';
import { Button } from './ui/button';
import { Home, CheckSquare, Calendar, Settings, Palette, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SidebarProps {
  currentView: string;
  onNavigateToDashboard: () => void;
  onNavigateToEvents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToSettings: () => void;
  onStyleGuide?: () => void;
}

export function Sidebar({ 
  currentView, 
  onNavigateToDashboard, 
  onNavigateToEvents,
  onNavigateToTasks, 
  onNavigateToCalendar, 
  onNavigateToSettings,
  onStyleGuide 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: onNavigateToDashboard },
    { id: 'allEvents', label: 'Events', icon: LayoutGrid, onClick: onNavigateToEvents },
    { id: 'allTasks', label: 'Tasks', icon: CheckSquare, onClick: onNavigateToTasks },
    { id: 'calendar', label: 'Calendar', icon: Calendar, onClick: onNavigateToCalendar },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: onNavigateToSettings },
  ];

  if (onStyleGuide) {
    navItems.push({ id: 'styleguide', label: 'Style Guide', icon: Palette, onClick: onStyleGuide });
  }

  return (
    <aside className={`bg-white border-r border-border min-h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <nav className={`${isCollapsed ? 'p-3' : 'p-6'} space-y-2 flex flex-col h-full`}>
        {/* Header with Logo and Collapse Button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={onNavigateToDashboard}
                      className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer w-full text-center"
                    >
                      JP
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>JAS39 Planner</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button 
                onClick={onNavigateToDashboard}
                className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                JAS39 Planner
              </button>
            )}
          </div>
          
          {/* Collapse/Expand Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Navigation Links */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`w-full ${isCollapsed ? 'justify-center px-2 py-3 h-12 w-12' : 'justify-start'} ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={item.onClick}
                  >
                    <Icon className={`w-5 h-5 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && item.label}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}


      </nav>
    </aside>
  );
}