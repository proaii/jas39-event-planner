"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";
import { useEventViewStore } from "@/stores/eventViewStore";

export function ViewSwitcher() {
  const { currentView, setView } = useEventViewStore();

  return (
    <div className="flex rounded-lg border border-border overflow-hidden mb-2">
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView('list')}
        className="rounded-none border-0"
      >
        <List className="w-4 h-4 mr-2" />
        List View
      </Button>
      <Button
        variant={currentView === "board" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView('board')}
        className="rounded-none border-0"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Board View
      </Button>
    </div>
  );
}
