"use client";
import React from 'react';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEventColorStore } from '@/stores/eventColorStore';

const colorOptions = [
  { name: 'Chart 1', value: 'bg-chart-1' },
  { name: 'Chart 2', value: 'bg-chart-2' },
  { name: 'Chart 3', value: 'bg-chart-3' },
  { name: 'Chart 4', value: 'bg-chart-4' },
  { name: 'Chart 5', value: 'bg-chart-5' },
];

interface EventColorSelectorProps {
  // Controlled mode props (optional)
  selectedColor?: string;
  onColorSelect?: (color: string) => void;
  // Option to hide label and description
  showLabel?: boolean;
}

export function EventColorSelector({ 
  selectedColor: controlledColor,
  onColorSelect: controlledOnSelect,
  showLabel = true,
}: EventColorSelectorProps = {}) {
  // Global store (uncontrolled mode)
  const { selectedColor: storeColor, setColor: storeSetColor } = useEventColorStore();

  // Use controlled props if provided, otherwise use store
  const isControlled = controlledColor !== undefined && controlledOnSelect !== undefined;
  const selectedColor = isControlled ? controlledColor : storeColor;
  const handleColorSelect = isControlled ? controlledOnSelect : storeSetColor;

  return (
    <div className="space-y-3">
      {showLabel && (
        <>
          <Label>Event Color</Label>
          <p className="text-sm text-muted-foreground">
            Choose a color that will be displayed when no cover image is uploaded
          </p>
        </>
      )}
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
            onClick={() => handleColorSelect(color.value)}
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