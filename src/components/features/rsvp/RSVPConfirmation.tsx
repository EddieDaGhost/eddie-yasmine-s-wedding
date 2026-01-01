import { motion } from 'framer-motion';
import { Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RSVPConfirmationProps {
  name: string;
  attending: boolean;
}

export const RSVPConfirmation = ({ name, attending }: RSVPConfirmationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
      >
        <CheckCircle className="w-10 h-10 text-primary" />
      </motion.div>

      <h2 className="font-display text-3xl text-foreground mb-4">
        Thank You, {name}!
      </h2>

      {attending ? (
        <>
          <p className="text-muted-foreground text-lg mb-2">
            We're thrilled you'll be joining us!
          </p>
          <div className="flex items-center justify-center gap-2 text-primary mb-8">
            <Heart className="w-4 h-4" />
            <span className="font-serif">See you on July 2nd, 2027</span>
            <Heart className="w-4 h-4" />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-lg mb-8">
          We're sorry you can't make it, but thank you for letting us know.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/event-details">View Event Details</Link>
        </Button>
        <Button asChild variant="romantic">
          <Link to="/our-story">Read Our Story</Link>
        </Button>
      </div>
    </motion.div>
  );
};
