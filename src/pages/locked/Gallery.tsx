import { useState } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Tag } from 'lucide-react';

interface Photo {
  id: string;
  file_url: string | null;
  caption: string | null;
  tags: string[] | null;
}

const Gallery = () => {
  const [tagFilter, setTagFilter] = useState<string>('');
  const { isUnlocked, isAdminPreview } = useIsUnlocked();

  const { data: photos, isLoading } = useQuery({
    queryKey: ['gallery-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('id, file_url, caption, tags')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: isUnlocked,
  });

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Photo Gallery"
        description="View all the beautiful photos from the celebration - available after the wedding!"
      />
    );
  }

  // Get all unique tags from approved photos
  const allTags = Array.from(
    new Set(photos?.flatMap((p) => p.tags || []) || [])
  ).sort();

  const filteredPhotos = tagFilter
    ? photos?.filter((p) => (p.tags || []).includes(tagFilter))
    : photos;

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Photo Gallery" />}
      
      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Wedding Gallery"
            subtitle="Beautiful moments captured from our special day."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <Button
                variant={tagFilter === '' ? 'romantic' : 'outline'}
                size="sm"
                onClick={() => setTagFilter('')}
              >
                All
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPhotos?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No photos found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos?.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                >
                  {photo.file_url ? (
                    <img
                      src={photo.file_url}
                      alt={photo.caption || 'Wedding photo'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  
                  {/* Overlay with tags */}
                  {((photo.tags && photo.tags.length > 0) || photo.caption) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      {photo.caption && (
                        <p className="text-white text-sm mb-2 line-clamp-2">{photo.caption}</p>
                      )}
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {photo.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-white/20 text-white border-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
