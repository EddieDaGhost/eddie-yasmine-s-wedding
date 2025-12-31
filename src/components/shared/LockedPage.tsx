import { motion } from 'framer-motion';
import { Lock, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CountdownTimer } from './CountdownTimer';
import { formatWeddingDate } from '@/lib/wedding-utils';

interface LockedPageProps {
  title: string;
  description?: string;
}

export const LockedPage = ({ title, description }: LockedPageProps) => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center romantic-gradient">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8"
            >
              <Lock className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              {title}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg mb-2">
              {description || "This special content will unlock on our wedding day"}
            </p>
            <p className="text-primary font-serif text-xl mb-12">
              {formatWeddingDate()}
            </p>

            {/* Countdown */}
            <CountdownTimer />

            {/* Decorative */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-2 text-muted-foreground"
            >
              <Heart className="w-4 h-4 text-primary" />
              <span className="font-serif">Come back on the big day!</span>
              <Heart className="w-4 h-4 text-primary" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};
