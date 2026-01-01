import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  name: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export const EventCard = ({ name, description, location, startTime, endTime }: EventCardProps) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-shadow"
    >
      <h3 className="font-display text-xl text-foreground mb-2">{name}</h3>
      
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="space-y-2">
        {(startTime || endTime) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>
              {formatTime(startTime)}
              {endTime && ` - ${formatTime(endTime)}`}
            </span>
          </div>
        )}
        
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
