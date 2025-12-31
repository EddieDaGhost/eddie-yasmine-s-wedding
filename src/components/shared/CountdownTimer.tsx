import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTimeUntilWedding } from '@/lib/wedding-utils';

interface TimeBlockProps {
  value: number;
  label: string;
  delay?: number;
}

const TimeBlock = ({ value, label, delay = 0 }: TimeBlockProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex flex-col items-center"
  >
    <div className="glass-card rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[90px]">
      <span className="font-display text-3xl md:text-5xl text-foreground tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
    </div>
    <span className="mt-2 text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
      {label}
    </span>
  </motion.div>
);

export const CountdownTimer = () => {
  const [time, setTime] = useState(getTimeUntilWedding());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilWedding());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (time.isWeddingDay) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <p className="font-display text-3xl md:text-4xl text-primary">
          Today is the day!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      <TimeBlock value={time.days} label="Days" delay={0} />
      <span className="text-2xl md:text-4xl text-primary/40 font-light mt-[-24px]">:</span>
      <TimeBlock value={time.hours} label="Hours" delay={0.1} />
      <span className="text-2xl md:text-4xl text-primary/40 font-light mt-[-24px]">:</span>
      <TimeBlock value={time.minutes} label="Minutes" delay={0.2} />
      <span className="text-2xl md:text-4xl text-primary/40 font-light mt-[-24px] hidden sm:block">:</span>
      <div className="hidden sm:block">
        <TimeBlock value={time.seconds} label="Seconds" delay={0.3} />
      </div>
    </div>
  );
};
