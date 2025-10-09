import React from 'react';
import { Label } from './ui/label';
import { Check } from 'lucide-react';

interface EventColorSelectorProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
}

// Predefined color palette with muted, pastel colors
const colorOptions = [
  { name: 'Light Blue', value: '#E8F4FD' },
  { name: 'Light Green', value: '#F0F9F0' },
  { name: 'Light Yellow', value: '#FEF9E8' },
  { name: 'Light Pink', value: '#FDF2F8' },
  { name: 'Light Purple', value: '#F3ECFF' },
  { name: 'Light Orange', value: '#FFF7ED' },
  { name: 'Light Teal', value: '#F0FDFA' },
  { name: 'Light Lavender', value: '#F5F3FF' }
];

export function EventColorSelector({ selectedColor, onColorSelect }: EventColorSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Event Color</Label>
      <p className="text-sm text-muted-foreground">
        Choose a color that will be displayed when no cover image is uploaded
      </p>
      <div className="grid grid-cols-4 gap-3">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
              selectedColor === color.value 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            style={{ backgroundColor: color.value }}
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