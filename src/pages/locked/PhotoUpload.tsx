import { useState, useRef } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, Image, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedPhoto {
  id: string;
  preview: string;
  caption: string;
  status: 'pending' | 'uploaded';
}

const PhotoUpload = () => {
  const { toast } = useToast();
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Photo Upload"
        description="Share your photos from the celebration - available on the wedding day!"
      />
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      preview: URL.createObjectURL(file),
      caption: '',
      status: 'pending' as const,
    }));

    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setPhotos(photos.map((p) => ({ ...p, status: 'uploaded' as const })));
    setIsUploading(false);
    
    toast({
      title: "Photos Uploaded!",
      description: "Your photos will appear in the gallery after approval.",
    });
  };

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
                        {photo.status === 'uploaded' && (
                          <div className="absolute inset-0 bg-sage/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-sage" />
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
                      />
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="romantic"
                  size="lg"
                  className="w-full"
                  onClick={handleUpload}
                  disabled={isUploading || photos.every((p) => p.status === 'uploaded')}
                >
                  {isUploading ? 'Uploading...' : (
                    <>
                      <Image className="w-5 h-5 mr-2" />
                      Upload {photos.filter((p) => p.status === 'pending').length} Photos
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
