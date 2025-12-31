import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  ornament?: boolean;
}

const sizeStyles = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-5xl',
  lg: 'text-4xl md:text-6xl lg:text-7xl',
};

export const SectionHeader = ({ 
  title, 
  subtitle, 
  className,
  align = 'center',
  size = 'md',
  ornament = true,
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-12 md:mb-16",
        align === 'center' && "text-center",
        align === 'left' && "text-left",
        align === 'right' && "text-right",
        className
      )}
    >
      <h2 className={cn(
        "font-display text-foreground mb-4 tracking-tight",
        sizeStyles[size]
      )}>
        {title}
      </h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={cn(
            "text-muted-foreground text-base md:text-lg leading-relaxed",
            align === 'center' && "max-w-2xl mx-auto"
          )}
        >
          {subtitle}
        </motion.p>
      )}
      {ornament && (
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "decorative-line mt-6",
            align === 'left' && "ml-0 origin-left",
            align === 'right' && "mr-0 ml-auto origin-right",
            align === 'center' && "origin-center"
          )} 
        />
      )}
    </motion.div>
  );
};
