import { useState, useRef } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, Image, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { sanitizeText } from '@/lib/sanitize';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
  status: 'pending' | 'compressing' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

const BUCKET = 'guest_photos';
const NAME_MAX = 100;
const CAPTION_MAX = 2000;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const PhotoUpload = () => {
  const { toast } = useToast();
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Photo Upload"
        description="Share your photos from the celebration - available on the wedding day!"
      />
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      status: 'pending' as const,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Compress each photo in the background
    for (const photo of newPhotos) {
      try {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: 'compressing' as const } : p))
        );

        const compressed = await imageCompression(photo.file, COMPRESSION_OPTIONS);
        const compressedPreview = URL.createObjectURL(compressed);

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, file: compressed, preview: compressedPreview, status: 'pending' as const }
              : p
          )
        );

        // Revoke old preview URL
        URL.revokeObjectURL(photo.preview);
      } catch {
        // Keep original if compression fails
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: 'pending' as const } : p))
        );
      }
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  // Upload each photo to storage, then record it in the photos table. Each
  // file carries its own status so one failure doesn't get reported as a
  // success for the whole batch — the previous version marked every photo
  // uploaded regardless.
  const handleUpload = async () => {
    setIsUploading(true);

    const queue = photos.filter((p) => p.status === 'pending' || p.status === 'error');
    let succeeded = 0;
    let failed = 0;

    for (const photo of queue) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: 'uploading' as const, error: undefined } : p))
      );

      try {
        const ext = photo.file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, photo.file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

        // Gallery uses file_url directly as an <img src>, so store the full URL.
        const { error: insertError } = await supabase.from('photos').insert({
          file_url: urlData.publicUrl,
          caption: photo.caption.trim() ? sanitizeText(photo.caption.trim()).slice(0, CAPTION_MAX) : null,
          uploader_name: uploaderName.trim()
            ? sanitizeText(uploaderName.trim()).slice(0, NAME_MAX)
            : null,
          approved: true,
        });
        if (insertError) throw insertError;

        succeeded++;
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: 'uploaded' as const } : p))
        );
      } catch (err) {
        failed++;
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: string }).message)
            : 'Upload failed';
        console.error('Photo upload failed:', err);
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { ...p, status: 'error' as const, error: message } : p
          )
        );
      }
    }

    setIsUploading(false);

    if (succeeded > 0) {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
    }

    if (failed === 0) {
      toast({
        title: `${succeeded} photo${succeeded === 1 ? '' : 's'} uploaded!`,
        description: 'Thank you for sharing — they are in the gallery now.',
      });
    } else if (succeeded === 0) {
      toast({
        title: 'Upload failed',
        description: 'None of your photos could be uploaded. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Some photos failed',
        description: `${succeeded} uploaded, ${failed} failed. Tap Upload again to retry the rest.`,
        variant: 'destructive',
      });
    }
  };

  const pendingCount = photos.filter((p) => p.status === 'pending' || p.status === 'error').length;
  const compressingCount = photos.filter((p) => p.status === 'compressing').length;

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Photo Upload" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Share Your Photos"
            subtitle="Upload your favorite moments from the celebration!"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8 text-center mb-8"
            >
              <div className="mb-6 text-left">
                <label htmlFor="uploader" className="text-sm text-muted-foreground mb-2 block">
                  Your name <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <Input
                  id="uploader"
                  placeholder="So we know who to thank"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  maxLength={NAME_MAX}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-12 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">
                  Click to Upload Photos
                </h3>
                <p className="text-muted-foreground text-sm">
                  Or drag and drop your photos here
                </p>
                <p className="text-muted-foreground/60 text-xs mt-2">
                  Photos are automatically compressed for faster upload
                </p>
              </div>
            </motion.div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        <img
                          src={photo.preview}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                        {photo.status === 'compressing' && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          </div>
                        )}
                        {photo.status === 'uploading' && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          </div>
                        )}
                        {photo.status === 'uploaded' && (
                          <div className="absolute inset-0 bg-sage/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-sage" />
                          </div>
                        )}
                        {photo.status === 'error' && (
                          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Input
                        placeholder="Add a caption..."
                        value={photo.caption}
                        onChange={(e) => updateCaption(photo.id, e.target.value)}
                        className="mt-2 text-sm"
                        maxLength={CAPTION_MAX}
                        disabled={photo.status === 'uploaded'}
                      />
                      {photo.status === 'error' && (
                        <p className="mt-1 text-xs text-destructive" title={photo.error}>
                          Failed to upload — tap Upload to retry.
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="romantic"
                  size="lg"
                  className="w-full"
                  onClick={handleUpload}
                  disabled={isUploading || pendingCount === 0 || compressingCount > 0}
                >
                  {isUploading ? 'Uploading...' : compressingCount > 0 ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Compressing {compressingCount} photo{compressingCount > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5 mr-2" />
                      Upload {pendingCount} Photo{pendingCount !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PhotoUpload;
