// components/dashboard/DashboardSkeleton.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex min-h-full">
      {/* Sidebar Skeleton */}
      <div className="w-16 md:w-64 border-r border-border bg-background flex flex-col items-center p-4">
        <Skeleton className="h-8 w-8 rounded-full mb-6" />
        <Skeleton className="h-8 w-full rounded-md mb-2" />
        <Skeleton className="h-8 w-full rounded-md mb-2" />
        <Skeleton className="h-8 w-full rounded-md mb-2" />
      </div>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Widgets Section Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="lg:col-span-1">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* My Tasks Section Skeleton */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-12 w-full mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
