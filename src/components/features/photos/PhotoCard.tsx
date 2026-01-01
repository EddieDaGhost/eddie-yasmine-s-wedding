import { motion } from 'framer-motion';
import { Heart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoCardProps {
  id: string;
  fileUrl: string;
  caption?: string;
  guestName?: string;
  onDownload?: () => void;
}

export const PhotoCard = ({ fileUrl, caption, guestName, onDownload }: PhotoCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative rounded-lg overflow-hidden bg-card border border-border"
    >
      <div className="aspect-square">
        <img
          src={fileUrl}
          alt={caption || 'Wedding photo'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {caption && (
            <p className="text-foreground font-serif text-sm mb-1">{caption}</p>
          )}
          {guestName && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Heart className="w-3 h-3 text-primary" />
              <span>by {guestName}</span>
            </div>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="absolute top-2 right-2"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
