import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';

interface ScheduleEvent {
  id: number;
  name: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
}

interface EventScheduleProps {
  events: ScheduleEvent[];
  isLoading?: boolean;
}

export const EventSchedule = ({ events, isLoading = false }: EventScheduleProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-24 h-16 bg-muted/50 rounded animate-pulse" />
            <div className="flex-1 h-16 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Schedule details coming soon!</p>
      </div>
    );
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-border" />
      
      <div className="space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-6"
          >
            {/* Time */}
            <div className="w-16 text-right flex-shrink-0">
              <span className="text-sm font-medium text-primary">
                {formatTime(event.start_time)}
              </span>
            </div>
            
            {/* Dot */}
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 bg-primary rounded-full border-2 border-background" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <h4 className="font-display text-lg text-foreground mb-1">
                {event.name}
              </h4>
              {event.description && (
                <p className="text-muted-foreground text-sm mb-2">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {event.end_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Until {formatTime(event.end_time)}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
