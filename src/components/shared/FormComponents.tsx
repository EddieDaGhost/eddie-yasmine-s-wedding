import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField = ({
  label,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-foreground font-medium">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

// Styled Input
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const StyledInput = React.forwardRef<HTMLInputElement, StyledInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'h-12 bg-background border-border focus:border-primary transition-colors',
          error && 'border-destructive focus:border-destructive',
          className
        )}
        {...props}
      />
    );
  }
);
StyledInput.displayName = 'StyledInput';

// Styled Textarea
interface StyledTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const StyledTextarea = React.forwardRef<
  HTMLTextAreaElement,
  StyledTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        'bg-background border-border focus:border-primary transition-colors min-h-[120px]',
        error && 'border-destructive focus:border-destructive',
        className
      )}
      {...props}
    />
  );
});
StyledTextarea.displayName = 'StyledTextarea';

// Styled Select
interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const StyledSelect = React.forwardRef<
  HTMLSelectElement,
  StyledSelectProps
>(({ className, error, options, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
        'transition-colors appearance-none cursor-pointer',
        error && 'border-destructive focus:border-destructive',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
StyledSelect.displayName = 'StyledSelect';
