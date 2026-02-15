/**
 * Image utilities for the visual editor.
 * Provides layout options, aspect ratio presets, and image field configuration.
 */

export type ImageLayout = 'full' | 'half-left' | 'half-right' | 'inline' | 'grid';
export type AspectRatio = 'original' | 'square' | '4:3' | '16:9' | '3:2' | '21:9';

export interface ImageLayoutOption {
  value: ImageLayout;
  label: string;
  description: string;
  icon: string;
  cssClass: string;
}

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  ratio: number | null; // null means original
}

export interface ImageFieldMetadata {
  src: string;
  alt: string;
  layout?: ImageLayout;
  aspectRatio?: AspectRatio;
  maxWidth?: number;
  maxHeight?: number;
  caption?: string;
}

export interface SelectedImageInfo {
  src: string;
  alt: string;
  sectionId: string | null;
  itemIndex: number | null;
  fieldKey: string | null;
  path: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

// Layout options for images
export const IMAGE_LAYOUT_OPTIONS: ImageLayoutOption[] = [
  {
    value: 'full',
    label: 'Full Width',
    description: 'Image spans the full container width',
    icon: '▣',
    cssClass: 'w-full',
  },
  {
    value: 'half-left',
    label: 'Half Width (Left)',
    description: 'Image takes half width, aligned left',
    icon: '◧',
    cssClass: 'w-1/2 float-left mr-4',
  },
  {
    value: 'half-right',
    label: 'Half Width (Right)',
    description: 'Image takes half width, aligned right',
    icon: '◨',
    cssClass: 'w-1/2 float-right ml-4',
  },
  {
    value: 'inline',
    label: 'Inline (Small)',
    description: 'Small inline image',
    icon: '◻',
    cssClass: 'w-32 inline-block',
  },
  {
    value: 'grid',
    label: 'Grid Cell',
    description: 'Sized for gallery grids',
    icon: '▦',
    cssClass: 'w-full aspect-square object-cover',
  },
];

// Aspect ratio presets
export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { value: 'original', label: 'Original', ratio: null },
  { value: 'square', label: 'Square (1:1)', ratio: 1 },
  { value: '4:3', label: 'Standard (4:3)', ratio: 4 / 3 },
  { value: '16:9', label: 'Widescreen (16:9)', ratio: 16 / 9 },
  { value: '3:2', label: 'Photo (3:2)', ratio: 3 / 2 },
  { value: '21:9', label: 'Cinematic (21:9)', ratio: 21 / 9 },
];

/**
 * Get CSS class for a layout option
 */
export const getLayoutClass = (layout: ImageLayout): string => {
  const option = IMAGE_LAYOUT_OPTIONS.find(o => o.value === layout);
  return option?.cssClass || 'w-full';
};

/**
 * Get layout option by value
 */
export const getLayoutOption = (layout: ImageLayout): ImageLayoutOption | undefined => {
  return IMAGE_LAYOUT_OPTIONS.find(o => o.value === layout);
};

/**
 * Get aspect ratio option by value
 */
export const getAspectRatioOption = (ratio: AspectRatio): AspectRatioOption | undefined => {
  return ASPECT_RATIO_OPTIONS.find(o => o.value === ratio);
};

/**
 * Calculate dimensions for a given aspect ratio
 */
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  aspectRatio: AspectRatio,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } => {
  const option = getAspectRatioOption(aspectRatio);
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Apply aspect ratio
  if (option?.ratio) {
    const currentRatio = originalWidth / originalHeight;
    if (currentRatio > option.ratio) {
      // Image is wider than target ratio, constrain by height
      width = Math.round(originalHeight * option.ratio);
    } else {
      // Image is taller than target ratio, constrain by width
      height = Math.round(originalWidth / option.ratio);
    }
  }
  
  // Apply max constraints
  if (maxWidth && width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * scale);
  }
  
  if (maxHeight && height > maxHeight) {
    const scale = maxHeight / height;
    height = maxHeight;
    width = Math.round(width * scale);
  }
  
  return { width, height };
};

/**
 * Parse image metadata from content string
 */
export const parseImageMetadata = (content: string): ImageFieldMetadata | null => {
  if (!content) return null;
  
  // If it's just a URL string, wrap it
  if (content.startsWith('http') || content.startsWith('/')) {
    return { src: content, alt: '' };
  }
  
  // Try parsing as JSON
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === 'object' && parsed.src) {
      return parsed as ImageFieldMetadata;
    }
    return null;
  } catch {
    return { src: content, alt: '' };
  }
};

/**
 * Stringify image metadata for storage
 */
export const stringifyImageMetadata = (metadata: ImageFieldMetadata): string => {
  // If only src and alt, just return the src for simplicity
  if (
    Object.keys(metadata).filter(k => metadata[k as keyof ImageFieldMetadata]).length <= 2 &&
    !metadata.layout &&
    !metadata.aspectRatio &&
    !metadata.maxWidth &&
    !metadata.maxHeight
  ) {
    return metadata.src;
  }
  return JSON.stringify(metadata);
};

/**
 * Validate image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Get placeholder for empty image
 */
export const getImagePlaceholder = (): string => {
  return '/placeholder.svg';
};

/**
 * Extract image field key from element path (legacy fallback).
 * Prefer using resolveImageField from sectionConfig.ts instead.
 */
export const extractImageFieldKey = (path: string, sectionId: string | null): string | null => {
  const parts = path.split(' > ');
  for (const part of parts.reverse()) {
    if (part.includes('hero')) return 'home_hero_image';
    if (part.includes('story')) return 'story_image';
    if (part.includes('avatar')) return 'avatar';
    if (part.includes('background')) return 'background_image';
    if (part.includes('thumbnail')) return 'thumbnail';
    if (part.includes('photo')) return 'photo';
    if (part.includes('logo')) return 'logo';
  }
  if (sectionId) return `${sectionId}_image`;
  return 'image';
};

/**
 * Layout to CSS class mapping for iframe preview rendering.
 */
export const LAYOUT_CSS_MAP: Record<ImageLayout, string> = {
  full: 'width: 100%; height: auto;',
  'half-left': 'width: 50%; float: left; margin-right: 1rem;',
  'half-right': 'width: 50%; float: right; margin-left: 1rem;',
  inline: 'width: 8rem; display: inline-block;',
  grid: 'width: 100%; aspect-ratio: 1/1; object-fit: cover;',
};

/**
 * Get inline CSS string for a layout option (for iframe injection).
 */
export const getLayoutInlineCss = (layout: ImageLayout): string => {
  return LAYOUT_CSS_MAP[layout] || LAYOUT_CSS_MAP.full;
};

/**
 * Build complete image metadata for draft JSON storage.
 */
export const buildImageDraftValue = (metadata: ImageFieldMetadata): string => {
  // Store as JSON if there's layout/crop metadata, otherwise just the URL
  if (metadata.layout || metadata.aspectRatio || metadata.maxWidth || metadata.maxHeight || metadata.caption) {
    return JSON.stringify(metadata);
  }
  return metadata.src;
};
