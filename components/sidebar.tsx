'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  Home,
  CheckSquare,
  Calendar,
  Settings,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "Events", icon: LayoutGrid },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-primary">
              JAS39 Planner
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full ${
                  isCollapsed ? "justify-center" : "justify-start"
                }`}
                asChild
              >
                <Link href={item.href}>
                  <Icon className={`w-5 h-5 ${!isCollapsed && "mr-3"}`} />
                  {!isCollapsed && item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}