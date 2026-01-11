/**
 * Centralized section configuration for the visual editor.
 * Defines all editable sections, their JSON paths, and metadata.
 */

export interface SectionConfig {
  id: string;
  label: string;
  selector: string; // CSS selector to find this section in the DOM
  contentKeys: string[];
  fields: FieldConfig[];
  defaultContent?: Record<string, unknown>;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'json' | 'image' | 'array';
  path: string; // dot-notation path within content
  placeholder?: string;
}

export interface PageConfig {
  key: string;
  label: string;
  path: string;
  sections: SectionConfig[];
}

// Home page sections
const homeSections: SectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    selector: '[data-section="hero"], section:first-of-type',
    contentKeys: ['home_announcement', 'home_names', 'home_date', 'home_location'],
    fields: [
      { key: 'home_announcement', label: 'Announcement', type: 'text', path: 'home_announcement', placeholder: "We're Getting Married" },
      { key: 'home_names', label: 'Names', type: 'text', path: 'home_names', placeholder: 'Eddie & Yasmine' },
      { key: 'home_date', label: 'Wedding Date', type: 'text', path: 'home_date', placeholder: 'July 2nd, 2027' },
      { key: 'home_location', label: 'Location', type: 'text', path: 'home_location', placeholder: 'The Grand Estate, California' },
    ],
  },
  {
    id: 'quick-info',
    label: 'Quick Info',
    selector: '[data-section="quick-info"], section:nth-of-type(2)',
    contentKeys: ['home_quick_title', 'home_quick_subtitle'],
    fields: [
      { key: 'home_quick_title', label: 'Title', type: 'text', path: 'home_quick_title', placeholder: 'Join Us for Our Celebration' },
      { key: 'home_quick_subtitle', label: 'Subtitle', type: 'textarea', path: 'home_quick_subtitle', placeholder: 'We are delighted to invite you...' },
    ],
  },
];

// Our Story page sections
const ourStorySections: SectionConfig[] = [
  {
    id: 'story-header',
    label: 'Story Header',
    selector: '[data-section="story-header"], .story-header',
    contentKeys: ['story_title', 'story_subtitle'],
    fields: [
      { key: 'story_title', label: 'Title', type: 'text', path: 'story_title', placeholder: 'Our Story' },
      { key: 'story_subtitle', label: 'Subtitle', type: 'textarea', path: 'story_subtitle', placeholder: 'How we met...' },
    ],
  },
  {
    id: 'story-content',
    label: 'Story Content',
    selector: '[data-section="story-content"], .story-content',
    contentKeys: ['story_quote'],
    fields: [
      { key: 'story_quote', label: 'Quote', type: 'textarea', path: 'story_quote', placeholder: 'A meaningful quote...' },
    ],
  },
];

// Wedding Party page sections
const weddingPartySections: SectionConfig[] = [
  {
    id: 'party-header',
    label: 'Page Header',
    selector: '[data-section="party-header"]',
    contentKeys: ['party_title', 'party_subtitle'],
    fields: [
      { key: 'party_title', label: 'Title', type: 'text', path: 'party_title', placeholder: 'Wedding Party' },
      { key: 'party_subtitle', label: 'Subtitle', type: 'textarea', path: 'party_subtitle', placeholder: 'Meet our special people...' },
    ],
  },
  {
    id: 'bridesmaids',
    label: 'Bridesmaids',
    selector: '[data-section="bridesmaids"]',
    contentKeys: ['bridesmaids_data'],
    fields: [
      { key: 'bridesmaids_data', label: 'Bridesmaids Data', type: 'json', path: 'bridesmaids_data' },
    ],
  },
  {
    id: 'groomsmen',
    label: 'Groomsmen',
    selector: '[data-section="groomsmen"]',
    contentKeys: ['groomsmen_data'],
    fields: [
      { key: 'groomsmen_data', label: 'Groomsmen Data', type: 'json', path: 'groomsmen_data' },
    ],
  },
];

// FAQ page sections
const faqSections: SectionConfig[] = [
  {
    id: 'faq-header',
    label: 'FAQ Header',
    selector: '[data-section="faq-header"]',
    contentKeys: ['faq_title', 'faq_subtitle'],
    fields: [
      { key: 'faq_title', label: 'Title', type: 'text', path: 'faq_title', placeholder: 'Frequently Asked Questions' },
      { key: 'faq_subtitle', label: 'Subtitle', type: 'textarea', path: 'faq_subtitle', placeholder: 'Common questions...' },
    ],
  },
  {
    id: 'faq-items',
    label: 'FAQ Items',
    selector: '[data-section="faq-items"]',
    contentKeys: ['faq_items'],
    fields: [
      { key: 'faq_items', label: 'FAQ Items', type: 'json', path: 'faq_items' },
    ],
  },
];

// Registry page sections
const registrySections: SectionConfig[] = [
  {
    id: 'registry-header',
    label: 'Registry Header',
    selector: '[data-section="registry-header"]',
    contentKeys: ['registry_title', 'registry_subtitle', 'registry_message'],
    fields: [
      { key: 'registry_title', label: 'Title', type: 'text', path: 'registry_title', placeholder: 'Registry' },
      { key: 'registry_subtitle', label: 'Subtitle', type: 'textarea', path: 'registry_subtitle' },
      { key: 'registry_message', label: 'Message', type: 'textarea', path: 'registry_message' },
    ],
  },
  {
    id: 'registry-items',
    label: 'Registry Items',
    selector: '[data-section="registry-items"]',
    contentKeys: ['registry_items'],
    fields: [
      { key: 'registry_items', label: 'Registry Items', type: 'json', path: 'registry_items' },
    ],
  },
];

// Travel page sections
const travelSections: SectionConfig[] = [
  {
    id: 'travel-header',
    label: 'Travel Header',
    selector: '[data-section="travel-header"]',
    contentKeys: ['travel_title', 'travel_subtitle'],
    fields: [
      { key: 'travel_title', label: 'Title', type: 'text', path: 'travel_title', placeholder: 'Travel & Accommodations' },
      { key: 'travel_subtitle', label: 'Subtitle', type: 'textarea', path: 'travel_subtitle' },
    ],
  },
  {
    id: 'travel-hotels',
    label: 'Hotels',
    selector: '[data-section="travel-hotels"]',
    contentKeys: ['travel_hotels'],
    fields: [
      { key: 'travel_hotels', label: 'Hotels Data', type: 'json', path: 'travel_hotels' },
    ],
  },
  {
    id: 'travel-tips',
    label: 'Travel Tips',
    selector: '[data-section="travel-tips"]',
    contentKeys: ['travel_tips'],
    fields: [
      { key: 'travel_tips', label: 'Tips Data', type: 'json', path: 'travel_tips' },
    ],
  },
];

// All editable pages configuration
export const EDITABLE_PAGES: PageConfig[] = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    sections: homeSections,
  },
  {
    key: 'our-story',
    label: 'Our Story',
    path: '/our-story',
    sections: ourStorySections,
  },
  {
    key: 'wedding-party',
    label: 'Wedding Party',
    path: '/wedding-party',
    sections: weddingPartySections,
  },
  {
    key: 'faq',
    label: 'FAQ',
    path: '/faq',
    sections: faqSections,
  },
  {
    key: 'registry',
    label: 'Registry',
    path: '/registry',
    sections: registrySections,
  },
  {
    key: 'travel',
    label: 'Travel',
    path: '/travel',
    sections: travelSections,
  },
];

/**
 * Get page config by key
 */
export const getPageConfig = (pageKey: string): PageConfig | undefined => {
  return EDITABLE_PAGES.find(p => p.key === pageKey);
};

/**
 * Get all content keys for a page
 */
export const getPageContentKeys = (pageKey: string): string[] => {
  const page = getPageConfig(pageKey);
  if (!page) return [];
  return page.sections.flatMap(s => s.contentKeys);
};

/**
 * Get section config by ID within a page
 */
export const getSectionConfig = (pageKey: string, sectionId: string): SectionConfig | undefined => {
  const page = getPageConfig(pageKey);
  if (!page) return undefined;
  return page.sections.find(s => s.id === sectionId);
};
