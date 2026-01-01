import { EventCard } from './EventCard';
import { StaggerContainer } from '@/components/animation';

interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
}

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
}

export const EventsList = ({ events, isLoading = false }: EventsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event schedule coming soon!</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          name={event.name || 'Event'}
          description={event.description || undefined}
          location={event.location || undefined}
          startTime={event.start_time || undefined}
          endTime={event.end_time || undefined}
        />
      ))}
    </StaggerContainer>
  );
};
