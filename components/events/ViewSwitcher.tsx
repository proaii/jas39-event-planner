// ViewSwitcher.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";

interface ViewSwitcherProps {
  currentView: 'list' | 'board';
  onViewChange: (view: 'list' | 'board') => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden mb-2">
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange('list')}
        className="rounded-none border-0"
      >
        <List className="w-4 h-4 mr-2" />
        List View
      </Button>
      <Button
        variant={currentView === "board" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange('board')}
        className="rounded-none border-0"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Board View
      </Button>
    </div>
  );
}
