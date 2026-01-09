import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  alt?: string;
  bucketName?: string;
}

interface StorageFile {
  name: string;
  url: string;
}

export const ImagePicker = ({
  value,
  onChange,
  onAltChange,
  alt = '',
  bucketName = 'guest_photos',
}: ImagePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [altText, setAltText] = useState(alt);
  const { toast } = useToast();

  // Load files from storage
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const fileUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name);
          return { name: file.name, url: urlData.publicUrl };
        })
      );

      setFiles(fileUrls);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
      setIsOpen(false);
      toast({
        title: 'Image uploaded!',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
            <img src={value} alt={altText} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                  </DialogHeader>
                  <ImagePickerContent
                    files={files}
                    isLoading={isLoadingFiles}
                    isUploading={isUploading}
                    onUpload={handleUpload}
                    onSelect={handleSelect}
                    selectedUrl={value}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onChange('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-32 border-dashed">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span>Select or upload image</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select Image</DialogTitle>
              </DialogHeader>
              <ImagePickerContent
                files={files}
                isLoading={isLoadingFiles}
                isUploading={isUploading}
                onUpload={handleUpload}
                onSelect={handleSelect}
                selectedUrl={value}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {onAltChange && (
        <div>
          <Label htmlFor="alt-text" className="text-xs">Alt Text</Label>
          <Input
            id="alt-text"
            value={altText}
            onChange={(e) => {
              setAltText(e.target.value);
              onAltChange(e.target.value);
            }}
            placeholder="Describe the image..."
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
};

interface ImagePickerContentProps {
  files: StorageFile[];
  isLoading: boolean;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (url: string) => void;
  selectedUrl: string;
}

const ImagePickerContent = ({
  files,
  isLoading,
  isUploading,
  onUpload,
  onSelect,
  selectedUrl,
}: ImagePickerContentProps) => {
  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Label
          htmlFor="image-upload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload new image
        </Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={onUpload}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      {/* File Grid */}
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {files.map((file) => (
              <motion.button
                key={file.name}
                onClick={() => onSelect(file.url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedUrl === file.url ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                {selectedUrl === file.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-2" />
            <p>No images in storage</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ImagePicker;
