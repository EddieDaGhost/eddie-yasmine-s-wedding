import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animation';
import { Music } from 'lucide-react';

interface SongRequestFormData {
  title: string;
  artist: string;
}

interface SongRequestFormProps {
  onSubmit?: (data: SongRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export const SongRequestForm = ({ onSubmit, isLoading = false }: SongRequestFormProps) => {
  const [formData, setFormData] = useState<SongRequestFormData>({
    title: '',
    artist: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
      setFormData({ title: '', artist: '' });
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="song-title">Song Title</Label>
          <Input
            id="song-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter song title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="song-artist">Artist</Label>
          <Input
            id="song-artist"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            placeholder="Enter artist name"
            required
          />
        </div>

        <Button
          type="submit"
          variant="romantic"
          className="w-full"
          disabled={isLoading}
        >
          <Music className="w-4 h-4 mr-2" />
          {isLoading ? 'Requesting...' : 'Request Song'}
        </Button>
      </form>
    </FadeIn>
  );
};
