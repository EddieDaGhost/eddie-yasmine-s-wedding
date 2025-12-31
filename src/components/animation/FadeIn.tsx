import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const getDirectionOffset = (direction: Direction): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x: 0, y: 30 };
    case 'down':
      return { x: 0, y: -30 };
    case 'left':
      return { x: 30, y: 0 };
    case 'right':
      return { x: -30, y: 0 };
    case 'none':
      return { x: 0, y: 0 };
  }
};

export const FadeIn = ({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: FadeInProps) => {
  const offset = getDirectionOffset(direction);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
