import { motion } from 'framer-motion';
import { CheckCircle2, Heart, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAllContent } from '@/hooks/useContent';
import { sanitizeHtml } from '@/lib/sanitize';

interface RSVPSuccessViewProps {
  guestName: string;
  onSubmitAnother: () => void;
}

export const RSVPSuccessView = ({ guestName, onSubmitAnother }: RSVPSuccessViewProps) => {
  const { data } = useAllContent();

  const venueName =
    data?.find((c) => c.key === 'eventdetails_venue_name')?.value || 'The Grand Estate';
  const venueAddress =
    data?.find((c) => c.key === 'eventdetails_venue_address')?.value || 'Napa Valley, California';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 md:py-12"
    >
      {/* Animated Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative inline-flex items-center justify-center mb-8"
      >
        {/* Outer ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute w-28 h-28 rounded-full border-2 border-sage/30"
        />
        {/* Inner circle */}
        <div className="w-24 h-24 rounded-full bg-sage/20 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-sage" />
        </div>
        {/* Floating hearts */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: -40,
              x: (i - 1) * 20,
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute top-0"
          >
            <Heart className="w-4 h-4 text-primary fill-primary" />
          </motion.div>
        ))}
      </motion.div>

      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mb-10"
      >
        <h1 className="font-display text-4xl md:text-5xl text-foreground">
          Thank You, {guestName}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We're absolutely thrilled that you'll be joining us to celebrate our special day.
        </p>
      </motion.div>

      {/* Wedding Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 md:p-8 max-w-md mx-auto mb-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">July 2nd, 2027</p>
              <p className="text-sm text-muted-foreground">Ceremony begins at 4:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
              <div className="text-left">
              <p className="font-medium">{venueName}</p>
              <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(venueAddress) }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-3 mb-10 text-primary"
      >
        <Heart className="w-4 h-4" />
        <span className="font-serif text-lg">See you at the wedding</span>
        <Heart className="w-4 h-4" />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button asChild variant="romantic" size="lg">
          <Link to="/event-details">
            View Event Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={onSubmitAnother}>
          Submit Another RSVP
        </Button>
      </motion.div>
    </motion.div>
  );
};
