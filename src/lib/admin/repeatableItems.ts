/**
 * Utilities for handling repeating items (arrays) in the visual editor.
 * Provides schema definitions, validation, and manipulation helpers.
 */

export interface ItemFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'date' | 'select' | 'boolean';
  placeholder?: string;
  options?: string[]; // For select type
  required?: boolean;
}

export interface RepeatableItemConfig {
  /** Unique identifier for this repeatable config */
  id: string;
  /** Display label */
  label: string;
  /** Singular label for one item */
  singularLabel: string;
  /** CSS selector to find items within the section */
  itemSelector: string;
  /** JSON path to the array in content (dot notation) */
  jsonPath: string;
  /** Field schema for each item */
  fields: ItemFieldSchema[];
  /** Default values for new items */
  defaultItem: Record<string, unknown>;
}

// Repeatable item configurations for different sections
export const REPEATABLE_CONFIGS: Record<string, RepeatableItemConfig> = {
  faq_items: {
    id: 'faq_items',
    label: 'FAQ Items',
    singularLabel: 'FAQ Item',
    itemSelector: '[data-faq-item], .faq-item, .accordion-item',
    jsonPath: 'faq_items',
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true, placeholder: 'Enter the question...' },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true, placeholder: 'Enter the answer...' },
    ],
    defaultItem: { question: 'New Question', answer: 'Answer goes here...' },
  },
  bridesmaids_data: {
    id: 'bridesmaids_data',
    label: 'Bridesmaids',
    singularLabel: 'Bridesmaid',
    itemSelector: '[data-bridesmaid], .bridesmaid-card',
    jsonPath: 'bridesmaids_data',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', placeholder: 'e.g., Maid of Honor' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    defaultItem: { name: 'New Bridesmaid', role: 'Bridesmaid', image: '', description: '' },
  },
  groomsmen_data: {
    id: 'groomsmen_data',
    label: 'Groomsmen',
    singularLabel: 'Groomsman',
    itemSelector: '[data-groomsman], .groomsman-card',
    jsonPath: 'groomsmen_data',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', placeholder: 'e.g., Best Man' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    defaultItem: { name: 'New Groomsman', role: 'Groomsman', image: '', description: '' },
  },
  registry_items: {
    id: 'registry_items',
    label: 'Registry Items',
    singularLabel: 'Registry Item',
    itemSelector: '[data-registry-item], .registry-item',
    jsonPath: 'registry_items',
    fields: [
      { key: 'name', label: 'Store Name', type: 'text', required: true },
      { key: 'url', label: 'Link URL', type: 'text', placeholder: 'https://...' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Logo', type: 'image' },
    ],
    defaultItem: { name: 'New Registry', url: '', description: '', image: '' },
  },
  travel_hotels: {
    id: 'travel_hotels',
    label: 'Hotels',
    singularLabel: 'Hotel',
    itemSelector: '[data-hotel], .hotel-card',
    jsonPath: 'travel_hotels',
    fields: [
      { key: 'name', label: 'Hotel Name', type: 'text', required: true },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'url', label: 'Website', type: 'text', placeholder: 'https://...' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
    ],
    defaultItem: { name: 'New Hotel', address: '', phone: '', url: '', notes: '', image: '' },
  },
  travel_tips: {
    id: 'travel_tips',
    label: 'Travel Tips',
    singularLabel: 'Tip',
    itemSelector: '[data-travel-tip], .travel-tip',
    jsonPath: 'travel_tips',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'icon', label: 'Icon', type: 'text', placeholder: 'Icon name (optional)' },
    ],
    defaultItem: { title: 'New Tip', content: '', icon: '' },
  },
  timeline_items: {
    id: 'timeline_items',
    label: 'Timeline Events',
    singularLabel: 'Timeline Event',
    itemSelector: '[data-timeline-item], .timeline-item',
    jsonPath: 'timeline_items',
    fields: [
      { key: 'date', label: 'Date', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
    ],
    defaultItem: { date: '', title: 'New Event', description: '', image: '' },
  },
  gallery_items: {
    id: 'gallery_items',
    label: 'Gallery Images',
    singularLabel: 'Image',
    itemSelector: '[data-gallery-item], .gallery-item',
    jsonPath: 'gallery_items',
    fields: [
      { key: 'src', label: 'Image URL', type: 'image', required: true },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
    ],
    defaultItem: { src: '', alt: '', caption: '' },
  },
};

/**
 * Get repeatable config by content key
 */
export const getRepeatableConfig = (contentKey: string): RepeatableItemConfig | undefined => {
  return REPEATABLE_CONFIGS[contentKey];
};

/**
 * Parse JSON array from string safely
 */
export const parseArrayContent = (content: string): unknown[] => {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Stringify array to JSON
 */
export const stringifyArrayContent = (items: unknown[]): string => {
  return JSON.stringify(items, null, 2);
};

/**
 * Add item to array at position
 */
export const addItem = (
  items: unknown[],
  newItem: Record<string, unknown>,
  position?: number
): unknown[] => {
  const result = [...items];
  if (position !== undefined && position >= 0 && position <= items.length) {
    result.splice(position, 0, newItem);
  } else {
    result.push(newItem);
  }
  return result;
};

/**
 * Remove item from array at index
 */
export const removeItem = (items: unknown[], index: number): unknown[] => {
  return items.filter((_, i) => i !== index);
};

/**
 * Duplicate item at index
 */
export const duplicateItem = (items: unknown[], index: number): unknown[] => {
  if (index < 0 || index >= items.length) return items;
  const result = [...items];
  const duplicated = JSON.parse(JSON.stringify(items[index]));
  result.splice(index + 1, 0, duplicated);
  return result;
};

/**
 * Update item at index
 */
export const updateItem = (
  items: unknown[],
  index: number,
  updates: Record<string, unknown>
): unknown[] => {
  return items.map((item, i) => 
    i === index ? { ...(item as Record<string, unknown>), ...updates } : item
  );
};

/**
 * Reorder items (move from one index to another)
 */
export const reorderItems = (
  items: unknown[],
  fromIndex: number,
  toIndex: number
): unknown[] => {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * Validate an item against its schema
 */
export const validateItem = (
  item: Record<string, unknown>,
  schema: ItemFieldSchema[]
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  schema.forEach(field => {
    const value = item[field.key];
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field.key] = `${field.label} is required`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
