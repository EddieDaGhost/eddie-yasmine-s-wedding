import * as React from 'react';
import { cn } from '@/lib/utils';

interface RSVPTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const RSVPTextarea = React.forwardRef<HTMLTextAreaElement, RSVPTextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[120px] w-full rounded-xl border-2 bg-background px-4 py-3',
          'text-base text-foreground placeholder:text-muted-foreground/60',
          'transition-all duration-300 ease-out resize-none',
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
RSVPTextarea.displayName = 'RSVPTextarea';
