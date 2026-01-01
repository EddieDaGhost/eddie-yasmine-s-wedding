import { SongRequestCard } from './SongRequestCard';
import { StaggerContainer } from '@/components/animation';

interface SongRequest {
  id: number;
  title: string;
  artist: string;
}

interface SongRequestListProps {
  songs: SongRequest[];
  isLoading?: boolean;
}

export const SongRequestList = ({ songs, isLoading = false }: SongRequestListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No song requests yet!</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-3">
      {songs.map((song) => (
        <SongRequestCard
          key={song.id}
          title={song.title || 'Unknown Title'}
          artist={song.artist || 'Unknown Artist'}
        />
      ))}
    </StaggerContainer>
  );
};
