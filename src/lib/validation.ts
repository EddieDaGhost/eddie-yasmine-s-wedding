import { z } from 'zod';

/**
 * Shared validation schemas for consistent form validation across the app
 */

// Email validation
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

// Name validation (1-100 characters, letters, spaces, hyphens, apostrophes)
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Message/Content validation (1-2000 characters)
export const messageSchema = z
  .string()
  .min(1, 'Message is required')
  .max(2000, 'Message must be less than 2000 characters');

// Optional message (can be empty)
export const optionalMessageSchema = z
  .string()
  .max(2000, 'Message must be less than 2000 characters')
  .optional();

// Phone number validation (optional)
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\(\)\+]*$/, 'Please enter a valid phone number')
  .max(20, 'Phone number must be less than 20 characters')
  .optional()
  .or(z.literal(''));

// Guest count validation (1-10)
export const guestCountSchema = z
  .number()
  .int('Number of guests must be a whole number')
  .min(1, 'At least 1 guest is required')
  .max(10, 'Maximum 10 guests allowed');

// Song title/artist validation
export const songTitleSchema = z
  .string()
  .min(1, 'Song title is required')
  .max(200, 'Song title must be less than 200 characters');

export const artistNameSchema = z
  .string()
  .min(1, 'Artist name is required')
  .max(200, 'Artist name must be less than 200 characters');

// URL validation (optional)
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));
