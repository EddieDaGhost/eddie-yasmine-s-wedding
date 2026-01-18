import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Replace,
  Type,
  Crop,
  Maximize2,
  Layout,
  Check,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ImagePicker } from './ImagePicker';
import {
  type ImageLayout,
  type AspectRatio,
  type SelectedImageInfo,
  type ImageFieldMetadata,
  IMAGE_LAYOUT_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  isValidImageUrl,
  getImagePlaceholder,
} from '@/lib/admin/imageUtils';

interface ImageEditorProps {
  selectedImage: SelectedImageInfo;
  onImageChange: (src: string) => void;
  onAltChange: (alt: string) => void;
  onLayoutChange: (layout: ImageLayout) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onSizeChange: (maxWidth: number | undefined, maxHeight: number | undefined) => void;
  onClose: () => void;
  onApply: () => void;
  metadata?: ImageFieldMetadata;
}

export const ImageEditor = ({
  selectedImage,
  onImageChange,
  onAltChange,
  onLayoutChange,
  onAspectRatioChange,
  onSizeChange,
  onClose,
  onApply,
  metadata,
}: ImageEditorProps) => {
  const [localSrc, setLocalSrc] = useState(selectedImage.src || '');
  const [localAlt, setLocalAlt] = useState(selectedImage.alt || '');
  const [localLayout, setLocalLayout] = useState<ImageLayout>(metadata?.layout || 'full');
  const [localAspectRatio, setLocalAspectRatio] = useState<AspectRatio>(metadata?.aspectRatio || 'original');
  const [localMaxWidth, setLocalMaxWidth] = useState<number>(metadata?.maxWidth || 0);
  const [localMaxHeight, setLocalMaxHeight] = useState<number>(metadata?.maxHeight || 0);
  const [activeTab, setActiveTab] = useState<'replace' | 'alt' | 'crop' | 'layout'>('replace');
  const [hasChanges, setHasChanges] = useState(false);
  const [altError, setAltError] = useState<string | null>(null);

  // Track changes
  useEffect(() => {
    const changed = 
      localSrc !== selectedImage.src ||
      localAlt !== selectedImage.alt ||
      localLayout !== (metadata?.layout || 'full') ||
      localAspectRatio !== (metadata?.aspectRatio || 'original') ||
      localMaxWidth !== (metadata?.maxWidth || 0) ||
      localMaxHeight !== (metadata?.maxHeight || 0);
    setHasChanges(changed);
  }, [localSrc, localAlt, localLayout, localAspectRatio, localMaxWidth, localMaxHeight, selectedImage, metadata]);

  // Validate alt text
  useEffect(() => {
    if (!localAlt.trim() && localSrc) {
      setAltError('Alt text is recommended for accessibility');
    } else if (localAlt.length > 125) {
      setAltError('Alt text should be under 125 characters');
    } else {
      setAltError(null);
    }
  }, [localAlt, localSrc]);

  const handleSrcChange = useCallback((url: string) => {
    setLocalSrc(url);
    onImageChange(url);
  }, [onImageChange]);

  const handleAltChange = useCallback((alt: string) => {
    setLocalAlt(alt);
    onAltChange(alt);
  }, [onAltChange]);

  const handleLayoutChange = useCallback((layout: ImageLayout) => {
    setLocalLayout(layout);
    onLayoutChange(layout);
  }, [onLayoutChange]);

  const handleAspectRatioChange = useCallback((ratio: AspectRatio) => {
    setLocalAspectRatio(ratio);
    onAspectRatioChange(ratio);
  }, [onAspectRatioChange]);

  const handleSizeChange = useCallback((width: number, height: number) => {
    setLocalMaxWidth(width);
    setLocalMaxHeight(height);
    onSizeChange(width || undefined, height || undefined);
  }, [onSizeChange]);

  const handleReset = () => {
    setLocalSrc(selectedImage.src || '');
    setLocalAlt(selectedImage.alt || '');
    setLocalLayout(metadata?.layout || 'full');
    setLocalAspectRatio(metadata?.aspectRatio || 'original');
    setLocalMaxWidth(metadata?.maxWidth || 0);
    setLocalMaxHeight(metadata?.maxHeight || 0);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Image Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                Modified
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Preview */}
        <div className="p-4 border-b border-border">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {localSrc && isValidImageUrl(localSrc) ? (
              <img
                src={localSrc}
                alt={localAlt || 'Preview'}
                className={cn(
                  'w-full h-full transition-all duration-200',
                  localAspectRatio === 'square' && 'aspect-square object-cover',
                  localAspectRatio === '4:3' && 'aspect-[4/3] object-cover',
                  localAspectRatio === '16:9' && 'aspect-video object-cover',
                  localAspectRatio === '3:2' && 'aspect-[3/2] object-cover',
                  localAspectRatio === '21:9' && 'aspect-[21/9] object-cover',
                  localAspectRatio === 'original' && 'object-contain',
                )}
                style={{
                  maxWidth: localMaxWidth || undefined,
                  maxHeight: localMaxHeight || undefined,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
          
          {/* Context info */}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedImage.sectionId && (
              <Badge variant="outline" className="text-xs">
                Section: {selectedImage.sectionId}
              </Badge>
            )}
            {selectedImage.itemIndex !== null && (
              <Badge variant="outline" className="text-xs">
                Item #{selectedImage.itemIndex + 1}
              </Badge>
            )}
            {selectedImage.fieldKey && (
              <Badge variant="outline" className="text-xs">
                Field: {selectedImage.fieldKey}
              </Badge>
            )}
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full grid grid-cols-4 rounded-none border-b border-border bg-transparent h-10">
            <TabsTrigger value="replace" className="text-xs data-[state=active]:bg-muted rounded-none">
              <Replace className="w-3 h-3 mr-1" />
              Replace
            </TabsTrigger>
            <TabsTrigger value="alt" className="text-xs data-[state=active]:bg-muted rounded-none">
              <Type className="w-3 h-3 mr-1" />
              Alt
            </TabsTrigger>
            <TabsTrigger value="crop" className="text-xs data-[state=active]:bg-muted rounded-none">
              <Crop className="w-3 h-3 mr-1" />
              Crop
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs data-[state=active]:bg-muted rounded-none">
              <Layout className="w-3 h-3 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
            {/* Replace Image Tab */}
            <TabsContent value="replace" className="m-0 p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Select or upload a new image
                  </Label>
                  <ImagePicker
                    value={localSrc}
                    onChange={handleSrcChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-url" className="text-xs text-muted-foreground">
                    Or enter URL directly
                  </Label>
                  <Input
                    id="image-url"
                    value={localSrc}
                    onChange={(e) => handleSrcChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Alt Text Tab */}
            <TabsContent value="alt" className="m-0 p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alt-text" className="text-xs text-muted-foreground">
                    Alt Text (for accessibility & SEO)
                  </Label>
                  <Input
                    id="alt-text"
                    value={localAlt}
                    onChange={(e) => handleAltChange(e.target.value)}
                    placeholder="Describe the image content..."
                    className={cn(
                      'mt-1',
                      altError && 'border-amber-500 focus-visible:ring-amber-500'
                    )}
                  />
                  {altError && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {altError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {localAlt.length}/125 characters
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-xs font-medium mb-2">Tips for good alt text:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Describe what's in the image</li>
                    <li>• Be concise but descriptive</li>
                    <li>• Don't start with "Image of..."</li>
                    <li>• Include relevant context</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Crop/Aspect Ratio Tab */}
            <TabsContent value="crop" className="m-0 p-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-3 block">
                    Aspect Ratio Preset
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIO_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleAspectRatioChange(option.value)}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-colors text-center',
                          localAspectRatio === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-xs font-medium">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Max Dimensions (px)</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Width:</span>
                      <Slider
                        value={[localMaxWidth]}
                        onValueChange={([v]) => handleSizeChange(v, localMaxHeight)}
                        max={1920}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">
                        {localMaxWidth || 'Auto'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Height:</span>
                      <Slider
                        value={[localMaxHeight]}
                        onValueChange={([v]) => handleSizeChange(localMaxWidth, v)}
                        max={1080}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">
                        {localMaxHeight || 'Auto'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="m-0 p-4">
              <div className="space-y-4">
                <Label className="text-xs text-muted-foreground mb-3 block">
                  Image Layout
                </Label>
                
                <div className="space-y-2">
                  {IMAGE_LAYOUT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleLayoutChange(option.value)}
                      className={cn(
                        'w-full p-3 rounded-lg border-2 transition-colors text-left flex items-center gap-3',
                        localLayout === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                      {localLayout === option.value && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={onApply}>
              <Check className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageEditor;
