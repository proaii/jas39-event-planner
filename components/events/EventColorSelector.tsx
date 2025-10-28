"use client";
import React from 'react';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventColorSelectorProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
}

const colorOptions = [
  { name: 'Chart 1', value: 'bg-chart-1' },
  { name: 'Chart 2', value: 'bg-chart-2' },
  { name: 'Chart 3', value: 'bg-chart-3' },
  { name: 'Chart 4', value: 'bg-chart-4' },
  { name: 'Chart 5', value: 'bg-chart-5' },
  { name: 'Primary', value: 'bg-primary' },
  { name: 'Secondary', value: 'bg-secondary' },
  { name: 'Accent', value: 'bg-accent' },
];

export function EventColorSelector({ selectedColor, onColorSelect }: EventColorSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Event Color</Label>
      <p className="text-sm text-muted-foreground">
        Choose a color that will be displayed when no cover image is uploaded
      </p>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            type="button"
            className={cn(
              'relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md',
              selectedColor === color.value
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50',
              color.value
            )}
            onClick={() => onColorSelect(color.value)}
            title={color.name}
          >
            {selectedColor === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
