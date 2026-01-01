import * as React from 'react';
import { cn } from '@/lib/utils';

interface RSVPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const RSVPInput = React.forwardRef<HTMLInputElement, RSVPInputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-14 w-full rounded-xl border-2 bg-background px-4 py-3',
          'text-base text-foreground placeholder:text-muted-foreground/60',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-0',
          hasError
            ? 'border-destructive focus:border-destructive'
            : 'border-border/60 hover:border-primary/40 focus:border-primary focus:shadow-soft',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
          className
        )}
        {...props}
      />
    );
  }
);
RSVPInput.displayName = 'RSVPInput';
