import { motion } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GuestbookMessageProps {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export const GuestbookMessage = ({ name, content, createdAt }: GuestbookMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 relative"
    >
      <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/20" />
      
      <p className="text-foreground font-serif text-lg leading-relaxed mb-4">
        "{content}"
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
};
