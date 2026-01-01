import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Photo {
  id: string;
  file_url?: string;
  caption?: string;
  guest_name?: string;
  approved?: boolean;
  created_at: string;
}

interface PhotoModerationPanelProps {
  photos: Photo[];
  isLoading?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const PhotoModerationPanel = ({
  photos,
  isLoading = false,
  onApprove,
  onReject,
  onDelete,
}: PhotoModerationPanelProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No photos to moderate</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            {photo.file_url ? (
              <img
                src={photo.file_url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              photo.approved 
                ? 'bg-green-500/90 text-white' 
                : 'bg-amber-500/90 text-white'
            }`}>
              {photo.approved ? 'Approved' : 'Pending'}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!photo.approved && onApprove && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onApprove(photo.id)}
                className="h-8 w-8 p-0"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
              </Button>
            )}
            {photo.approved && onReject && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onReject(photo.id)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="w-4 h-4 text-amber-500" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onDelete(photo.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
          
          {/* Caption & Info */}
          <div className="mt-2">
            {photo.caption && (
              <p className="text-sm text-foreground truncate">{photo.caption}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {photo.guest_name || 'Anonymous'} • {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
