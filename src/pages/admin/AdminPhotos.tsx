import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface Photo {
  id: string;
  file_url: string | null;
  caption: string | null;
  guest_id: string;
  approved: boolean | null;
  created_at: string;
}

const AdminPhotos = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const { data: photos, isLoading } = useQuery({
    queryKey: ['admin-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
  });

  const updatePhoto = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from('photos')
        .update({ approved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: 'Photo updated!' });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: 'Photo deleted!' });
    },
  });

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredPhotos = photos?.filter((p) => {
    if (filter === 'pending') return !p.approved;
    if (filter === 'approved') return p.approved;
    return true;
  });

  const pendingCount = photos?.filter((p) => !p.approved).length || 0;

  return (
    <AdminLayout onLogout={logout}>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-1">Photo Moderation</h1>
        <p className="text-muted-foreground">Approve or reject guest photos</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'approved', label: 'Approved' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'romantic' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as typeof filter)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos?.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="aspect-square bg-muted">
              {photo.file_url ? (
                <img
                  src={photo.file_url}
                  alt={photo.caption || 'Guest photo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  photo.approved
                    ? 'bg-sage/20 text-sage-foreground'
                    : 'bg-gold/20 text-gold-foreground'
                }`}>
                  {photo.approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {photo.caption && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {photo.caption}
                </p>
              )}

              <p className="text-xs text-muted-foreground mb-3">
                {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true })}
              </p>

              <div className="flex gap-2">
                {!photo.approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => updatePhoto.mutate({ id: photo.id, approved: true })}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {photo.approved && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => updatePhoto.mutate({ id: photo.id, approved: false })}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePhoto.mutate(photo.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPhotos?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No photos found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPhotos;
