import React from 'react';
import { Calendar } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Simple Header for Auth pages */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground">Student Event Planner</span>
          </div>
        </div>
      </header>
      
      {children}
    </div>
  );
}