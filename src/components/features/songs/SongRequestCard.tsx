import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface SongRequestCardProps {
  title: string;
  artist: string;
}

export const SongRequestCard = ({ title, artist }: SongRequestCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
    >
      <div className="p-2 bg-primary/10 rounded-full">
        <Music className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </motion.div>
  );
};
