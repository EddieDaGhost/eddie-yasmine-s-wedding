import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animation';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadFormProps {
  onUpload?: (file: File, caption: string) => Promise<void>;
  isLoading?: boolean;
  maxSizeMB?: number;
}

export const PhotoUploadForm = ({ 
  onUpload, 
  isLoading = false,
  maxSizeMB = 10
}: PhotoUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !onUpload) return;
    
    await onUpload(selectedFile, caption);
    handleRemove();
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Click to upload a photo</p>
            <p className="text-sm text-muted-foreground">PNG, JPG up to {maxSizeMB}MB</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-lg overflow-hidden"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-video object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        {/* Caption */}
        {preview && (
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
            />
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="romantic"
          className="w-full"
          disabled={!selectedFile || isLoading}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {isLoading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </form>
    </FadeIn>
  );
};
