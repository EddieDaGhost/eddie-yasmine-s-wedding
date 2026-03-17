import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useAllContent } from '@/hooks/useContent';

const PlaylistEmbed = () => {
  const { data: content } = useAllContent();

  // Admins can set this via the content table with key "playlist_spotify_url"
  // Expected format: https://open.spotify.com/playlist/PLAYLIST_ID
  const spotifyUrl = content?.find((c) => c.key === 'playlist_spotify_url')?.value;

  if (!spotifyUrl) return null;

  // Convert Spotify URL to embed format
  const embedUrl = spotifyUrl.replace('open.spotify.com', 'open.spotify.com/embed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-foreground">Our Playlist</h3>
          <p className="text-muted-foreground text-sm">
            Songs for the celebration — add yours via RSVP!
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden">
        <iframe
          src={`${embedUrl}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Wedding playlist"
          className="rounded-xl"
        />
      </div>
    </motion.div>
  );
};

export default PlaylistEmbed;
