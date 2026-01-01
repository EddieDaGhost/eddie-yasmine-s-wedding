import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RSVPSelectOption {
  value: string;
  label: string;
}

interface RSVPSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: readonly RSVPSelectOption[];
  hasError?: boolean;
}

export const RSVPSelect = React.forwardRef<HTMLSelectElement, RSVPSelectProps>(
  ({ className, options, hasError, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-14 w-full appearance-none rounded-xl border-2 bg-background px-4 py-3 pr-12',
            'text-base text-foreground cursor-pointer',
            'transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-0',
            hasError
              ? 'border-destructive focus:border-destructive'
              : 'border-border/60 hover:border-primary/40 focus:border-primary focus:shadow-soft',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-foreground bg-background"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);
RSVPSelect.displayName = 'RSVPSelect';
