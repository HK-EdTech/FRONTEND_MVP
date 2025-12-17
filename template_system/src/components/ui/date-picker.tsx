import React from 'react';
import { Button } from './button';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  return (
    <Button variant="outline" className="w-40 justify-start text-left">
      <Calendar className="w-4 h-4 mr-2" />
      {value ? value.toLocaleDateString() : placeholder}
    </Button>
  );
}