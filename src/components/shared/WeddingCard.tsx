import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeddingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantStyles = {
  default: 'bg-card border border-border',
  glass: 'glass-card',
  elevated: 'bg-card shadow-elegant border border-border/50',
  outlined: 'bg-transparent border-2 border-border',
};

const WeddingCard = React.forwardRef<HTMLDivElement, WeddingCardProps>(
  (
    {
      className,
      variant = 'default',
      hoverable = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'rounded-2xl transition-all duration-300',
      variantStyles[variant],
      paddingStyles[padding],
      hoverable && 'hover:shadow-elegant hover:-translate-y-1 cursor-pointer',
      className
    );

    if (hoverable) {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          className={baseStyles}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);
WeddingCard.displayName = 'WeddingCard';

// Card Header
const WeddingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
WeddingCardHeader.displayName = 'WeddingCardHeader';

// Card Title
const WeddingCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-serif text-xl md:text-2xl text-foreground leading-tight',
      className
    )}
    {...props}
  />
));
WeddingCardTitle.displayName = 'WeddingCardTitle';

// Card Description
const WeddingCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
WeddingCardDescription.displayName = 'WeddingCardDescription';

// Card Content
const WeddingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-4', className)} {...props} />
));
WeddingCardContent.displayName = 'WeddingCardContent';

// Card Footer
const WeddingCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
WeddingCardFooter.displayName = 'WeddingCardFooter';

// Card Image
interface WeddingCardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'square' | 'video' | 'portrait';
}

const aspectRatioStyles = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

const WeddingCardImage = React.forwardRef<HTMLDivElement, WeddingCardImageProps>(
  ({ className, src, alt, aspectRatio = 'square', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-xl',
        aspectRatioStyles[aspectRatio],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        {...props}
      />
    </div>
  )
);
WeddingCardImage.displayName = 'WeddingCardImage';

export {
  WeddingCard,
  WeddingCardHeader,
  WeddingCardTitle,
  WeddingCardDescription,
  WeddingCardContent,
  WeddingCardFooter,
  WeddingCardImage,
};
