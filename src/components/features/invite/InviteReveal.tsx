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

/* ---------- Floating particles (ambient) ---------- */
const floatingParticles = [
  { className: 'top-[10%] left-[8%] w-1.5 h-1.5 bg-primary/20', duration: 5, y: -18, delay: 0 },
  { className: 'top-[20%] right-[12%] w-2 h-2 bg-accent/15', duration: 6, y: -22, delay: 1.5 },
  { className: 'bottom-[25%] left-[18%] w-1 h-1 bg-gold/25', duration: 4, y: -14, delay: 0.8 },
  { className: 'bottom-[15%] right-[22%] w-1.5 h-1.5 bg-primary/15', duration: 5.5, y: -16, delay: 2.2 },
  { className: 'top-[45%] left-[5%] w-1 h-1 bg-champagne/30', duration: 4.5, y: -12, delay: 1 },
  { className: 'top-[60%] right-[6%] w-1 h-1 bg-gold/20', duration: 5, y: -20, delay: 0.5 },
  { className: 'top-[75%] left-[25%] w-1.5 h-1.5 bg-accent/20', duration: 6.5, y: -15, delay: 3 },
  { className: 'top-[30%] left-[50%] w-1 h-1 bg-primary/10', duration: 4, y: -10, delay: 1.8 },
] as const;

/* ---------- Sparkle burst positions around the guest name ---------- */
const sparkles = [
  { x: -120, y: -30, size: 6, delay: 0 },
  { x: 130, y: -25, size: 5, delay: 0.1 },
  { x: -80, y: 30, size: 4, delay: 0.2 },
  { x: 100, y: 35, size: 5, delay: 0.15 },
  { x: -150, y: 0, size: 3, delay: 0.25 },
  { x: 160, y: -5, size: 4, delay: 0.05 },
  { x: -40, y: -50, size: 3, delay: 0.3 },
  { x: 50, y: -45, size: 4, delay: 0.18 },
  { x: -60, y: 50, size: 3, delay: 0.22 },
  { x: 70, y: 48, size: 5, delay: 0.12 },
  { x: 0, y: -55, size: 4, delay: 0.08 },
  { x: -10, y: 55, size: 3, delay: 0.28 },
];

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

      {/* Radial glow behind guest name — appears when name appears */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[35%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[35%] w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-gold/[0.08] blur-[60px]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
        {/* Top decorative line */}
        <motion.div
          className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        />

        {/* "With hearts full of love," */}
        <motion.p
          className="font-serif italic text-base md:text-lg text-muted-foreground/80 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
        >
          With hearts full of love,
        </motion.p>

        {/* Couple names — italic / cursive style with primary color */}
        <div className="mb-6 overflow-hidden">
          <motion.h1
            className="leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
          >
            <span
              className="font-display italic text-5xl sm:text-6xl md:text-8xl text-primary"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              Eddie
            </span>
            {' '}
            <motion.span
              className="gold-shimmer text-4xl sm:text-5xl md:text-7xl font-display italic inline-block"
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 150, damping: 12 }}
            >
              &amp;
            </motion.span>
            {' '}
            <span
              className="font-display italic text-5xl sm:text-6xl md:text-8xl text-primary"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              Yasmine
            </span>
          </motion.h1>
        </div>

        {/* "invite you to share in the celebration of their wedding day" */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
        >
          <p className="font-serif italic text-base md:text-lg text-muted-foreground/80">
            invite you to share in the celebration
          </p>
          <p className="font-serif italic text-base md:text-lg text-muted-foreground/80">
            of their wedding day
          </p>
        </motion.div>

        {/* Guest name — the showstopper */}
        <div className="relative mb-10">
          {/* Sparkle burst around the name */}
          {sparkles.map((s, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full bg-gold"
              style={{ width: s.size, height: s.size }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: [0, s.x * 0.6, s.x],
                y: [0, s.y * 0.6, s.y],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                delay: 1.9 + s.delay,
                duration: 1,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Glowing underline that draws itself */}
          <motion.div
            className="absolute -bottom-3 left-1/2 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(40 70% 55%), hsl(350 25% 65%), hsl(40 70% 55%), transparent)',
            }}
            initial={{ width: 0, x: '-50%', opacity: 0 }}
            animate={{ width: '110%', x: '-55%', opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.8, ease: EASE }}
          />

          {/* Second subtle underline glow */}
          <motion.div
            className="absolute -bottom-3 left-1/2 h-[6px] rounded-full blur-[4px]"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(40 70% 55% / 0.5), hsl(350 25% 65% / 0.3), hsl(40 70% 55% / 0.5), transparent)',
            }}
            initial={{ width: 0, x: '-50%', opacity: 0 }}
            animate={{ width: '110%', x: '-55%', opacity: 1 }}
            transition={{ delay: 2.35, duration: 0.8, ease: EASE }}
          />

          {/* The name itself */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1.9, duration: 0.7, ease: EASE }}
          >
            <motion.p
              className="font-display text-4xl sm:text-5xl md:text-7xl will-change-transform"
              style={{
                background: 'linear-gradient(135deg, hsl(40 70% 55%), hsl(350 30% 65%), hsl(40 70% 55%), hsl(355 35% 75%))',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                delay: 2.2,
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {label}
            </motion.p>
          </motion.div>

          {/* Continuous subtle shimmer effect on the name */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          >
            <motion.div
              className="absolute inset-y-0 w-[60px] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ left: ['-80px', 'calc(100% + 80px)'] }}
              transition={{ delay: 3.2, duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8, ease: EASE }}
        />

        {/* Date and venue */}
        <motion.div
          className="space-y-2 mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.6, ease: EASE }}
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-serif text-base md:text-lg">July 2, 2027 &middot; 4PM ET | 3PM CT</span>
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
          transition={{ delay: 3.6, duration: 0.6, ease: EASE }}
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
              transition={{ delay: 4.5, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              View Your Invitation
            </motion.span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
