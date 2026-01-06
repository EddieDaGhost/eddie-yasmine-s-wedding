import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, CheckCircle, XCircle, Trash2, Loader2, Tag, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  tags: string[] | null;
}

const AdminPhotos = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

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

  const updateTags = useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
      const { error } = await supabase
        .from('photos')
        .update({ tags })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: 'Tags updated!' });
    },
  });

  // Get all unique tags from photos
  const allTags = Array.from(
    new Set(photos?.flatMap((p) => p.tags || []) || [])
  ).sort();

  const addTagToPhoto = (photoId: string, tag: string) => {
    const photo = photos?.find((p) => p.id === photoId);
    if (!photo || !tag.trim()) return;
    const currentTags = photo.tags || [];
    if (!currentTags.includes(tag.trim())) {
      updateTags.mutate({ id: photoId, tags: [...currentTags, tag.trim()] });
    }
    setNewTag('');
  };

  const removeTagFromPhoto = (photoId: string, tag: string) => {
    const photo = photos?.find((p) => p.id === photoId);
    if (!photo) return;
    const currentTags = photo.tags || [];
    updateTags.mutate({ id: photoId, tags: currentTags.filter((t) => t !== tag) });
  };

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredPhotos = photos?.filter((p) => {
    // Status filter
    if (filter === 'pending' && p.approved) return false;
    if (filter === 'approved' && !p.approved) return false;
    // Tag filter
    if (tagFilter && !(p.tags || []).includes(tagFilter)) return false;
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
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={tagFilter === '' ? 'romantic' : 'outline'}
            size="sm"
            onClick={() => setTagFilter('')}
          >
            All Tags
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={tagFilter === tag ? 'romantic' : 'outline'}
              size="sm"
              onClick={() => setTagFilter(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

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

              {/* Tags Section */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-1 mb-1">
                  {(photo.tags || []).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeTagFromPhoto(photo.id, tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                {editingPhotoId === photo.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="h-7 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTagToPhoto(photo.id, newTag);
                        } else if (e.key === 'Escape') {
                          setEditingPhotoId(null);
                          setNewTag('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => {
                        addTagToPhoto(photo.id, newTag);
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => setEditingPhotoId(photo.id)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Add tag
                  </Button>
                )}
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
