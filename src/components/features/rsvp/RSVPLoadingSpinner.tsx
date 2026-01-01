import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const RSVPLoadingSpinner = () => {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Heart className="w-5 h-5" />
      </motion.div>
      <span>Sending your RSVP...</span>
    </div>
  );
};
