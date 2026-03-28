import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InviteRevealProps {
  label: string;
  onComplete: () => void;
  venueName?: string;
  venueAddress?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const floatingParticles = [
  { className: 'top-[10%] left-[8%] w-1.5 h-1.5 bg-primary/20', duration: 5, y: -18, delay: 0 },
  { className: 'top-[20%] right-[12%] w-2 h-2 bg-accent/15', duration: 6, y: -22, delay: 1.5 },
  { className: 'bottom-[25%] left-[18%] w-1 h-1 bg-gold/25', duration: 4, y: -14, delay: 0.8 },
  { className: 'bottom-[15%] right-[22%] w-1.5 h-1.5 bg-primary/15', duration: 5.5, y: -16, delay: 2.2 },
  { className: 'top-[45%] left-[5%] w-1 h-1 bg-champagne/30', duration: 4.5, y: -12, delay: 1 },
] as const;

export const InviteReveal = ({ label, onComplete, venueName, venueAddress }: InviteRevealProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center romantic-gradient overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* Floating particles */}
      {floatingParticles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${p.className}`}
          animate={{ y: [0, p.y, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
        {/* Top decorative line */}
        <motion.div
          className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        />

        {/* "Together with their families" */}
        <motion.p
          className="font-sans text-xs md:text-sm uppercase tracking-[0.3em] text-muted-foreground/70 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
        >
          Together with their families
        </motion.p>

        {/* Couple names */}
        <div className="mb-6 overflow-hidden">
          <motion.h1
            className="font-display text-5xl sm:text-6xl md:text-8xl text-foreground leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
          >
            Eddie{' '}
            <span className="gold-shimmer">&amp;</span>{' '}
            Yasmine
          </motion.h1>
        </div>

        {/* "request the pleasure of your company" */}
        <motion.p
          className="font-serif italic text-base md:text-lg text-muted-foreground/80 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
        >
          request the pleasure of your company
        </motion.p>

        {/* Guest name — the star */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9, type: 'spring', stiffness: 90, damping: 14 }}
        >
          <p className="font-display text-4xl sm:text-5xl md:text-7xl text-primary will-change-transform">
            {label}
          </p>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8, ease: EASE }}
        />

        {/* Date and venue */}
        <motion.div
          className="space-y-2 mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.6, ease: EASE }}
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-serif text-base md:text-lg">July 2, 2027 &middot; 4:00 PM</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-serif text-base md:text-lg">{venueName || 'Blue Dress Barn'} &middot; {venueAddress || 'Benton Harbor, MI'}</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.6, ease: EASE }}
        >
          <Button
            variant="hero"
            size="xl"
            onClick={onComplete}
            className="group"
          >
            <motion.span
              className="flex items-center gap-2"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ delay: 4, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              View Your Invitation
            </motion.span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
