import { z } from 'zod';

export const rsvpFormSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  numberOfGuests: z.string().min(1, 'Please select number of guests'),
  mealChoice: z.string().min(1, 'Please select a meal preference'),
  songRequest: z.string().max(200, 'Song request is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

export interface RSVPFormState {
  isLoading: boolean;
  isSubmitted: boolean;
  errors: Partial<Record<keyof RSVPFormData, string>>;
}

export const mealOptions = [
  { value: '', label: 'Select your meal preference' },
  { value: 'beef', label: 'Beef Tenderloin' },
  { value: 'chicken', label: 'Herb-Roasted Chicken' },
  { value: 'fish', label: 'Pan-Seared Salmon' },
  { value: 'vegetarian', label: 'Vegetarian Risotto' },
  { value: 'vegan', label: 'Vegan Garden Plate' },
] as const;

export const guestOptions = [
  { value: '', label: 'Select number of guests' },
  { value: '1', label: '1 Guest (Just me)' },
  { value: '2', label: '2 Guests' },
  { value: '3', label: '3 Guests' },
  { value: '4', label: '4 Guests' },
  { value: '5', label: '5 Guests' },
] as const;
