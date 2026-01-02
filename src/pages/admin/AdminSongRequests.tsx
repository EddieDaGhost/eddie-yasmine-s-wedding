import { motion } from 'framer-motion';
import { Music, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface SongRequest {
  id: number;
  title: string | null;
  artist: string | null;
  guest_id: string | null;
  created_at: string;
}

const AdminSongRequests = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery({
    queryKey: ['admin-songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SongRequest[];
    },
  });

  const deleteSong = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('song_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-songs'] });
      toast({ title: 'Song request deleted!' });
    },
  });

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-1">Song Requests</h1>
        <p className="text-muted-foreground">
          {songs?.length || 0} songs requested by guests
        </p>
      </div>

      {/* Songs List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs?.map((song) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-foreground">
                    {song.title || 'Unknown Title'}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {song.artist || 'Unknown Artist'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(song.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSong.mutate(song.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}

        {songs?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No song requests yet.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSongRequests;
