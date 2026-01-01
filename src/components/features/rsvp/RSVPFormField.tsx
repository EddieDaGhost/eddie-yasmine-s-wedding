import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RSVPFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const RSVPFormField = ({
  label,
  error,
  required,
  hint,
  className,
  children,
}: RSVPFormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-foreground font-medium text-base">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </Label>
      {children}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
