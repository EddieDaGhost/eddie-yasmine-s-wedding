import { PhotoCard } from './PhotoCard';
import { StaggerContainer } from '@/components/animation';

interface Photo {
  id: string;
  file_url: string;
  caption?: string;
  guest_name?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isLoading?: boolean;
  onDownload?: (photo: Photo) => void;
}

export const PhotoGallery = ({ photos, isLoading = false, onDownload }: PhotoGalleryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          id={photo.id}
          fileUrl={photo.file_url}
          caption={photo.caption}
          guestName={photo.guest_name}
          onDownload={onDownload ? () => onDownload(photo) : undefined}
        />
      ))}
    </StaggerContainer>
  );
};
