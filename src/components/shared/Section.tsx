import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionVariant = 'default' | 'gradient' | 'muted' | 'primary';
type SectionSpacing = 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  spacing?: SectionSpacing;
  id?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<SectionVariant, string> = {
  default: 'bg-background',
  gradient: 'romantic-gradient',
  muted: 'bg-secondary/30',
  primary: 'bg-primary/5',
};

const spacingStyles: Record<SectionSpacing, string> = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  xl: 'py-24 md:py-40',
  hero: 'py-20 md:py-32 lg:py-40',
};

export const Section = ({
  children,
  className,
  variant = 'default',
  spacing = 'md',
  id,
  fullWidth = false,
}: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(variantStyles[variant], spacingStyles[spacing], className)}
    >
      {fullWidth ? (
        children
      ) : (
        <div className="container mx-auto px-4 md:px-6">{children}</div>
      )}
    </section>
  );
};

// Container component for consistent widths
interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

const containerSizes: Record<string, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
};

export const Container = ({
  children,
  className,
  size = 'lg',
  centered = true,
}: ContainerProps) => {
  return (
    <div
      className={cn(
        containerSizes[size],
        centered && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};
